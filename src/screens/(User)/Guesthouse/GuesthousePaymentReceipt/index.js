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
import {useRoute, useNavigation, StackActions} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import styles from './GuesthousePaymentReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';

import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {trimJejuPrefix} from '@utils/formatAddress';

import XBtn from '@assets/images/x_gray.svg';
import CopyIcon from '@assets/images/copy_fill_black.svg';
import RouteIcon from '@assets/images/route_fill_black.svg';
import PhoneIcon from '@assets/images/phone_fill_black.svg';
import MapIcon from '@assets/images/map_fill_black.svg';

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

const formatPaidAt = paidAt => {
  if (!paidAt) return '';
  const date = dayjs(paidAt);
  return date.isValid() ? date.format('YYYY.MM.DD (dd) HH:mm') : paidAt;
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
    if (genderText && ctx.dormitoryGenderType !== 'MIXED') {
      parts.push(genderText);
    }
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

const buildPaymentUnitSuffix = ctx =>
  ctx?.roomType === 'DORMITORY' ? ' (1베드 당)' : '';

const buildPaymentTotalSuffix = (ctx, nights) => {
  if (!ctx) return '';
  if (ctx.roomType === 'DORMITORY') {
    const bedCount = ctx.guestCount ?? '';
    const nightsText = nights > 0 ? `${nights}박` : '';
    if (!bedCount && !nightsText) return '';
    return ` (베드 ${bedCount || '?'}개 X ${nightsText || '?'})`;
  }

  return nights > 0 ? ` (${nights}박)` : '';
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

      unitPriceLabel: '객실 가격',
      totalLabel: '총 가격',
      finalLabel: '실 결제 금액',

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
      notice: '예약 후 10분 이내에는 무료 취소가 가능합니다. \n단, 체크인 시간 이후에는 취소가 불가합니다.',
    },
  };
};

const GuesthousePaymentReceipt = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const receiptContext = route?.params?.receiptContext ?? null;
  const reservationId = route?.params?.reservationId ?? null;

  const [dto, setDto] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = useMemo(
    () => mapDtoToViewData(dto, receiptContext, reservationId),
    [dto, receiptContext, reservationId],
  );
  const nights = useMemo(() => {
    const checkIn = receiptContext?.checkIn ?? dto?.checkIn;
    const checkOut = receiptContext?.checkOut ?? dto?.checkOut;
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, dayjs(checkOut).diff(dayjs(checkIn), 'day')) + 1;
  }, [receiptContext, dto]);
  const unitPriceSuffix = useMemo(
    () => buildPaymentUnitSuffix(receiptContext),
    [receiptContext],
  );
  const totalPriceSuffix = useMemo(
    () => buildPaymentTotalSuffix(receiptContext, nights),
    [receiptContext, nights],
  );

  // 뒤로가기
  const handleClose = () => {
    if (receiptContext?.guesthouseId) {
      const checkIn = receiptContext?.checkIn
        ? dayjs(receiptContext.checkIn).format('YYYY-MM-DD')
        : undefined;
      const checkOut = receiptContext?.checkOut
        ? dayjs(receiptContext.checkOut).format('YYYY-MM-DD')
        : undefined;
      const guestCount = receiptContext?.guestCount ?? 1;
      const params = {
        id: receiptContext.guesthouseId,
        checkIn,
        checkOut,
        guestCount,
        isFromDeeplink: false,
      };
      const routes = navigation.getState()?.routes || [];
      const hasDetail = routes.some(route => route.name === 'GuesthouseDetail');
      if (hasDetail) {
        navigation.dispatch(StackActions.popTo('GuesthouseDetail', params));
      }
      return;
    }

    navigation.goBack();
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await reservationPaymentApi.getReservationPaymentDetail(
          reservationId,
        );
        setDto(res?.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reservationId]);

  // 복사
  const handleCopy = (text) => {
    Clipboard.setString(text ?? '');

    Toast.show({
      type: 'success',
      text1: '복사되었어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // 숙소 문의
  const handleCall = async () => {
    const digits = String(data?.guesthouse?.phone || '').replace(/[^\d]/g, '');
    if (!digits) return Toast.show({
      type: 'error',
      text1: '통화할 수 있는 번호가 없어요',
      position: 'top',
      visibilityTime: 2500,
    });

    try {
      const url = `tel:${digits}`;
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        return Toast.show({
          type: 'error',
          text1: '전화앱을 열 수 없어요',
          position: 'top',
          visibilityTime: 2500,
        });
      }
      await Linking.openURL(url);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '전화앱을 열 수 없어요',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  // 주소 복사
  const handleCopyAddress = () => {
    const addr = data?.guesthouse?.address || '';
    handleCopy(addr);
  };

  // 지도보기
  const handleOpenMap = async () => {
    Toast.show({
      type: 'success',
      text1: '준비중인 기능이에요',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // 길찾기
  const handleFindWay = async () => {
    Toast.show({
      type: 'success',
      text1: '준비중인 기능이에요',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // 예약취소
  const onPressCancel = () => {
    Alert.alert('예약취소', '예약을 취소할까요?', [
      {text: '닫기', style: 'cancel'},
      {
        text: '취소',
        style: 'destructive',
        onPress: async () => {
          if (!reservationId) {
            Toast.show({
              type: 'error',
              text1: '예약 정보를 찾을 수 없어요.',
              position: 'top',
              visibilityTime: 2500,
            });
            return;
          }

          try {
            await reservationPaymentApi.cancelReservation(
              reservationId,
              'GUESTHOUSE',
            );
            Toast.show({
              type: 'success',
              text1: '예약이 취소되었어요.',
              position: 'top',
              visibilityTime: 2000,
            });
            handleClose();
          } catch (e) {
            Toast.show({
              type: 'error',
              text1: '예약 취소에 실패했어요.',
              position: 'top',
              visibilityTime: 2500,
            });
          }
        },
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
          예약 정보를 찾을 수 없어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.xBtn}
          onPress={handleClose}
        >
          <XBtn width={24} height={24}/>
        </TouchableOpacity>
        {/* 타이틀 */}
        <View style={styles.title}>
          <Text style={[FONTS.fs_20_semibold]}>예약확정</Text>
          <Text style={[FONTS.fs_18_semibold, styles.guesthouseName]}>
            {data.guesthouse.name}
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.address]}>
            {trimJejuPrefix(data.guesthouse.address)}
          </Text>
        </View>

        {/* 액션 버튼 4개 */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <PhoneIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_medium, styles.actionText]}>숙소문의</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleCopyAddress}>
            <CopyIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_medium, styles.actionText]}>주소복사</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleOpenMap}>
            <MapIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_medium, styles.actionText]}>지도보기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleFindWay}>
            <RouteIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_medium, styles.actionText]}>길찾기</Text>
          </TouchableOpacity>
        </View>

        {/* 체크인/아웃 */}
        <View style={styles.dateBoxContainer}>
          <View style={styles.dateBoxCheckIn}>
            <Text style={[FONTS.fs_12_medium, styles.dateLabel]}>체크인</Text>
            <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
              {data.stay.checkIn}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.dateText]}>
              {data.stay.checkInTime}
            </Text>
          </View>

          <View style={styles.nightsBox}>
            <Text style={[FONTS.fs_12_medium]}>{nights}박</Text>
          </View>

          <View style={styles.dateBoxCheckOut}>
            <Text style={[FONTS.fs_12_medium, styles.dateLabel]}>체크아웃</Text>
            <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
              {data.stay.checkOut}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.dateText]}>
              {data.stay.checkOutTime}
            </Text>
          </View>
        </View>

        {/* 구매 정보 */}
        <View style={styles.purchaseWrap}>
          <View style={styles.purchaseLeft}>
            <Text style={[FONTS.fs_16_semibold, styles.purchaseTitle]}>
              구매 정보
            </Text>
          </View>
          <View style={styles.purchaseRight}>
            <Text style={[FONTS.fs_14_medium]}>
              {data.purchase.title}
            </Text>
            <Text style={[FONTS.fs_14_regular, styles.purchaseSub]}>
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
              <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
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
            <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
              {data.reservation.name}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>전화번호</Text>
            <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
              {data.reservation.phone}
            </Text>
          </View>
        </View>

        {/* 결제 정보 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            결제 정보
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
              결제일시 : {formatPaidAt(data.payment.paidAt)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.unitPriceLabel}
              {unitPriceSuffix}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
              {formatPrice(data.payment.unitPrice)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.totalLabel}
              {totalPriceSuffix}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
              {formatPrice(data.payment.totalPrice)}
            </Text>
          </View>

          <View style={styles.divider}/>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>
              {data.payment.finalLabel}
            </Text>
            <Text style={[FONTS.fs_16_medium, styles.rowValue, styles.finalPrice]}>
              {formatPrice(data.payment.finalPrice)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.rowLabel]}>결제 수단</Text>
            <Text style={[FONTS.fs_14_medium, styles.rowValue]}>
              {data.payment.method}
            </Text>
          </View>

        </View>

        {/* 예약취소 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle, {marginTop: 32}]}>
            예약취소
          </Text>

          <Text style={[FONTS.fs_12_medium, styles.cancelNotice]}>
            {data.cancelPolicy.notice}
          </Text>

          <ButtonWhite
            onPress={onPressCancel}
            backgroundColor={COLORS.cancel_btn_bg}
            textColor={COLORS.semantic_red}
            title='예약취소'
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default GuesthousePaymentReceipt;
