import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Clipboard from '@react-native-clipboard/clipboard';
import {useRoute, useNavigation} from '@react-navigation/native';

import styles from './GuesthousePaymentReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

import XBtn from '@assets/images/x_gray.svg';

dayjs.locale('ko');

const formatPrice = n => {
  if (typeof n !== 'number') return '';
  return `${n.toLocaleString()}원`;
};

const formatTime = timeStr => {
  if (!timeStr) return '';
  const date = dayjs(timeStr);
  if (date.isValid()) return date.format('HH:mm');
  return typeof timeStr === 'string' ? timeStr.slice(0, 5) : '';
};

const formatDateWithDay = dateStr => {
  if (!dateStr) return '';
  const date = dayjs(dateStr);
  return date.isValid() ? date.format('YYYY. MM. DD (dd)') : dateStr;
};

const buildPurchaseSubtitle = ctx => {
  if (!ctx) return '';
  const isDormitory = ctx.roomType === 'DORMITORY';
  const genderMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  if (isDormitory) {
    const parts = [];
    if (ctx.roomCapacity) parts.push(`${ctx.roomCapacity}인 도미토리`);
    const genderText = genderMap[ctx.dormitoryGenderType];
    if (genderText) parts.push(genderText);
    return parts.length ? `[${parts.join(', ')}]` : '';
  }

  const parts = [];
  if (ctx.roomCapacity) {
    const maxText = ctx.roomMaxCapacity
      ? ` (최대 ${ctx.roomMaxCapacity}인)`
      : '';
    parts.push(`${ctx.roomCapacity}인 기준${maxText}`);
  }
  if (ctx.femaleOnly) parts.push('여성전용');
  return parts.length ? `[${parts.join(', ')}]` : '';
};

const buildPurchaseTitle = ctx => {
  if (!ctx?.roomName) return '';
  if (!ctx.checkIn || !ctx.checkOut) return ctx.roomName;

  const nights = Math.max(
    0,
    dayjs(ctx.checkOut).diff(dayjs(ctx.checkIn), 'day'),
  );
  return nights > 0 ? `${ctx.roomName} / ${nights}박` : ctx.roomName;
};

const mapDtoToViewData = (dto, fallback, reservationId) => {
  if (!dto) return null;

  const fallbackAddress = [fallback?.guesthouseAddress, fallback?.guesthouseAddressDetail]
    .filter(Boolean)
    .join(' ');

  return {
    guesthouse: {
      name: dto.guesthouse ?? fallback?.guesthouseName ?? '',
      address: dto.address ?? fallbackAddress ?? '',
      phone: fallback?.guesthousePhone ?? '',
    },

    stay: {
      checkIn: dto.checkIn ?? formatDateWithDay(fallback?.checkIn),
      checkInTime: formatTime(fallback?.checkInTime ?? fallback?.checkIn),
      checkOut: dto.checkOut ?? formatDateWithDay(fallback?.checkOut),
      checkOutTime: formatTime(fallback?.checkOutTime ?? fallback?.checkOut),
    },

    purchase: {
      title: dto.roomName ?? buildPurchaseTitle(fallback),
      subTitle: buildPurchaseSubtitle(fallback),
    },

    reservation: {
      number:
        dto.reservationId !== undefined && dto.reservationId !== null
          ? String(dto.reservationId)
          : reservationId
            ? String(reservationId)
            : '',
      name: dto.userName ?? fallback?.userName ?? '',
      phone: dto.phoneNum ?? fallback?.userPhone ?? '',
    },

    payment: {
      paidAt: dto.approvedAt ?? '',

      unitPriceLabel: '결제 금액',
      totalLabel: '총 결제 금액',
      finalLabel: '최종 결제 금액',

      unitPrice:
        typeof dto.amount === 'number'
          ? dto.amount
          : typeof fallback?.roomPrice === 'number'
            ? fallback.roomPrice
            : 0,
      totalPrice:
        typeof dto.totalAmount === 'number'
          ? dto.totalAmount
          : typeof fallback?.totalPrice === 'number'
            ? fallback.totalPrice
            : 0,
      finalPrice:
        typeof dto.totalAmount === 'number'
          ? dto.totalAmount
          : typeof fallback?.totalPrice === 'number'
            ? fallback.totalPrice
            : 0,

      method: (dto.paymentType && PAYMENT_TYPE_LABEL[dto.paymentType]) ?? '',
    },

    cancelPolicy: {
      notice: '취소/환불 규정은 숙소 정책에 따라 달라요.',
    },
  };
};

const GuesthousePaymentReceipt = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const reservationId = route?.params?.reservationId ?? 0;
  const receiptContext = route?.params?.receiptContext ?? null;
  // const reservationId = route?.params?.reservationId;

  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = useMemo(
    () => mapDtoToViewData(dto, receiptContext, reservationId),
    [dto, receiptContext, reservationId],
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await reservationPaymentApi.getReservationPaymentDetail(
          reservationId,
        );
        setDto(res?.data);
      } catch (e) {
        // Alert.alert('알림', '예약 상세를 불러오지 못했어');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reservationId]);

  const handleCopy = (text, label = '복사했어') => {
    Clipboard.setString(text ?? '');
    Alert.alert('알림', label);
  };

  const handleCall = async () => {
    const phone = (data?.guesthouse?.phone || '').replace(/-/g, '');
    if (!phone) return Alert.alert('알림', '전화번호가 없어');

    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) return Alert.alert('알림', '전화 앱을 열 수 없어');
    Linking.openURL(url);
  };

  const handleCopyAddress = () => {
    const addr = data?.guesthouse?.address || '';
    if (!addr) return Alert.alert('알림', '주소가 없어');
    handleCopy(addr, '주소를 복사했어');
  };

  const handleOpenMap = async () => {
    const q = encodeURIComponent(
      `${data?.guesthouse?.name || ''} ${data?.guesthouse?.address || ''}`,
    );
    const url = `https://m.map.naver.com/search2/search.naver?query=${q}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) return Alert.alert('알림', '지도를 열 수 없어');
    Linking.openURL(url);
  };

  const handleFindWay = async () => {
    handleOpenMap();
  };

  const onPressCancel = () => {
    Alert.alert('예약취소', '예약을 취소할까?', [
      {text: '아니', style: 'cancel'},
      {
        text: '취소할래',
        style: 'destructive',
        onPress: () => Alert.alert('알림', '예약취소 기능은 준비중이야'),
      },
    ]);
  };

  // 로딩
  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator />
        <Text style={[FONTS.fs_14_medium, {marginTop: 10, color: COLORS.grayscale_500}]}>
          불러오는 중...
        </Text>
      </View>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={[FONTS.fs_14_medium, {color: COLORS.grayscale_600}]}>
          예약 정보를 찾을 수 없어
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 타이틀 */}
        <View style={styles.title}>
          <Text style={[FONTS.fs_20_semibold]}>예약확정</Text>
          <Text style={[FONTS.fs_18_semibold, styles.guesthouseName]}>
            {data.guesthouse.name}
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.address]}>
            {data.guesthouse.address}
          </Text>
        </View>

        {/* 액션 버튼 4개 */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <View style={styles.actionIcon} />
            <Text style={[FONTS.fs_12_medium, styles.actionText]}>숙소문의</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleCopyAddress}>
            <View style={styles.actionIcon} />
            <Text style={[FONTS.fs_12_medium, styles.actionText]}>주소복사</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleOpenMap}>
            <View style={styles.actionIcon} />
            <Text style={[FONTS.fs_12_medium, styles.actionText]}>지도보기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleFindWay}>
            <View style={styles.actionIcon} />
            <Text style={[FONTS.fs_12_medium, styles.actionText]}>길찾기</Text>
          </TouchableOpacity>
        </View>

        {/* 체크인/아웃 카드 */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={[FONTS.fs_12_medium, styles.infoLabel]}>체크인</Text>
            <Text style={[FONTS.fs_14_semibold, styles.infoDate]}>
              {data.stay.checkIn}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.infoTime]}>
              {data.stay.checkInTime}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={[FONTS.fs_12_medium, styles.infoLabel]}>체크아웃</Text>
            <Text style={[FONTS.fs_14_semibold, styles.infoDate]}>
              {data.stay.checkOut}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.infoTime]}>
              {data.stay.checkOutTime}
            </Text>
          </View>
        </View>

        {/* 구매 정보 */}
        <View style={styles.purchaseWrap}>
          <View style={styles.purchaseLeft}>
            <Text style={[FONTS.fs_14_medium, styles.purchaseTitle]}>
              구매 정보
            </Text>
            <Text style={[FONTS.fs_14_semibold, {marginTop: 8}]}>
              {data.purchase.title}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.purchaseSub]}>
              {data.purchase.subTitle}
            </Text>
          </View>
        </View>

        {/* 예약 정보 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            예약 정보
          </Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>예약번호</Text>
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
                {data.reservation.number}
              </Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopy(data.reservation.number, '예약번호 복사했어')}>
                <Text style={[FONTS.fs_12_medium, styles.copyBtnText]}>
                  예약번호 복사
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>이름</Text>
            <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
              {data.reservation.name}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>전화번호</Text>
            <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
              {data.reservation.phone}
            </Text>
          </View>

          <View style={styles.divider} />
        </View>

        {/* 결제 정보 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            결제 정보
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
              결제일시 {data.payment.paidAt}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.unitPriceLabel}
            </Text>
            <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
              {formatPrice(data.payment.unitPrice)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.totalLabel}
            </Text>
            <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
              {formatPrice(data.payment.totalPrice)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.finalLabel}
            </Text>
            <Text style={[FONTS.fs_16_semibold, styles.rowValue, styles.finalPrice]}>
              {formatPrice(data.payment.finalPrice)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>결제 수단</Text>
            <Text style={[FONTS.fs_14_semibold, styles.rowValue]}>
              {data.payment.method}
            </Text>
          </View>

          <View style={styles.divider} />
        </View>

        {/* 예약취소 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            예약취소
          </Text>

          <Text style={[FONTS.fs_12_medium, styles.cancelNotice]}>
            {data.cancelPolicy.notice}
          </Text>

          <TouchableOpacity style={styles.cancelBtn} onPress={onPressCancel}>
            <Text style={[FONTS.fs_16_semibold, styles.cancelBtnText]}>
              예약취소
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default GuesthousePaymentReceipt;
