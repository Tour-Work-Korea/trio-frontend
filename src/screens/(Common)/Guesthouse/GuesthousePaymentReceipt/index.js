import React, {useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import styles from './GuesthousePaymentReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import {mockPaymentReceipt} from './mockPaymentReceipt';

const formatPrice = n => {
  if (typeof n !== 'number') return '';
  return `${n.toLocaleString()}원`;
};

const GuesthousePaymentReceipt = () => {
  // ✅ 나중에 api 붙으면 여기만 교체하면 됨
  const data = useMemo(() => mockPaymentReceipt, []);

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
    // ✅ 간단하게 네이버 지도 검색으로 연결 (원하면 카카오맵/구글맵 분기 가능)
    const q = encodeURIComponent(
      `${data?.guesthouse?.name || ''} ${data?.guesthouse?.address || ''}`,
    );
    const url = `https://m.map.naver.com/search2/search.naver?query=${q}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) return Alert.alert('알림', '지도를 열 수 없어');
    Linking.openURL(url);
  };

  const handleFindWay = async () => {
    // ✅ 길찾기: 일단 네이버 지도 검색으로 동일 연결
    handleOpenMap();
  };

  const onPressCancel = () => {
    Alert.alert('예약취소', '예약을 취소할까?', [
      {text: '아니', style: 'cancel'},
      {
        text: '취소할래',
        style: 'destructive',
        onPress: () => Alert.alert('알림', '(mock) 예약취소 처리됐어'),
      },
    ]);
  };

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
