import React, {useMemo} from 'react';
import {View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './GuesthouseCancelledReceipt.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import XBtn from '@assets/images/x_gray.svg';

const GuesthouseCancelledReceipt = () => {
  const navigation = useNavigation();

  // mock data (나중에 API 붙이면 여기만 교체)
  const data = useMemo(
    () => ({
      statusMessage:
        '예약취소 되었습니다. 환불은 주말/공휴일을 제외한 영업일 기준 3-5일 소요될 수 있습니다.',
      guesthouseName: '김곤빌리지 게스트하우스',
      roomName: '4인실 여자',
      roomDesc: '[4인 도미토리], 여성전용',
      imageUrl: 'https://picsum.photos/200/200', // 임시 이미지
      checkInDate: '2025. 04. 15 (화)',
      checkInTime: '16:00',
      checkOutDate: '2025. 04. 16 (수)',
      checkOutTime: '11:00',
      cancelledAt: '취소일시 2025. 04. 15 (화) 13:00',
      paidAmount: 125000,
      cancelFee: 0,
      refundMethod: '카카오페이 환불',
      refundAmount: 125000,
      cancelReason: '단순변심',
    }),
    [],
  );

  const formatPrice = n => `${Number(n || 0).toLocaleString('ko-KR')}원`;

  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.xBtn}
          onPress={() => navigation.goBack()}
        >
          <XBtn width={24} height={24}/>
        </TouchableOpacity>

        <Text style={[FONTS.fs_20_semibold]}>예약취소</Text>

        {/* 경고 배너 */}
        <View style={styles.banner}>
          <Text style={[FONTS.fs_14_semibold, styles.bannerText]}>
            {data.statusMessage}
          </Text>
        </View>

        {/* 게하 정보 */}
        <View style={styles.summaryCard}>
          <Image
            source={{uri: data.imageUrl}}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          <View style={styles.summaryTextBox}>
            <Text
              style={[FONTS.fs_16_semibold, styles.guesthouseName]}>
              {data.guesthouseName}
            </Text>

            <Text
              style={[FONTS.fs_14_medium, styles.roomName]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {data.roomName}
            </Text>

            <Text
              style={[FONTS.fs_12_medium, styles.roomDesc]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {data.roomDesc}
            </Text>
          </View>
        </View>

        {/* 날짜 */}
        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={[FONTS.fs_16_semibold, styles.dateText]}>
              {data.checkInDate}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {data.checkInTime}
            </Text>
          </View>

          <View style={styles.dateDivider} />

          <View style={styles.dateCol}>
            <Text style={[FONTS.fs_16_semibold, styles.dateText]}>
              {data.checkOutDate}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.timeText]}>
              {data.checkOutTime}
            </Text>
          </View>
        </View>

        <View style={styles.devide}/>

        {/* 취소 내역 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_12_medium, styles.cancelledAt]}>
            {data.cancelledAt}
          </Text>

          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            취소/환불 정보
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>실 결제 금액</Text>
            <View style={styles.valueInline}>
              <Text style={[FONTS.fs_14_regular, styles.valueHint]}>(취소)</Text>
              <Text style={[FONTS.fs_14_semibold, styles.valueStrike]}>
                {formatPrice(data.paidAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>취소 수수료</Text>
            <Text style={[FONTS.fs_14_semibold, styles.value]}>
              {formatPrice(data.cancelFee)}
            </Text>
          </View>

          <View style={[styles.devide, {marginTop: 24, marginBottom: 12}]}/>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>환불 방법</Text>
            <Text style={[FONTS.fs_14_semibold, styles.valueAccent]}>
              {data.refundMethod}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]}>최종 환불 금액</Text>
            <Text style={[FONTS.fs_14_semibold, styles.refundAmount]}>
              {formatPrice(data.refundAmount)}
            </Text>
          </View>
        </View>

        {/* 취소 사유 */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
            취소 사유
          </Text>

          <View style={styles.row}>
            <Text style={[FONTS.fs_14_medium, styles.label]} />
            <Text style={[FONTS.fs_14_medium, styles.value, {color: COLORS.grayscale_400}]}>
              {data.cancelReason}
            </Text>
          </View>
        </View>
    </View>
  );
};

export default GuesthouseCancelledReceipt;
