import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import Header from '@components/Header';
import ReservationCancelModal from '@components/modals/HostMy/Guesthouse/ReservationCancelModal';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import styles from './MyGuesthouseReservationDetail.styles';

const DEFAULT_RESERVATION = {
  status: '확정',
  statusText: '완료 1, 취소 1',
  name: '이하늘',
  age: '1999년생',
  phone: '010-4123-0075',
  reservationNumber: 'WA_sddfei13',
  email: 'leesky0075@naver.com',
  guestCount: '2',
  serviceName: '김닝기억',
  room: '여 6인 도미토리',
  period: '2025.04.15(화) ~ 2025.04.16(수)',
  checkInDate: '2025-04-15',
  checkOutDate: '2025-04-16',
  reservationId: 1,
  paymentState: '결제완료',
  paymentMethod: '카카오페이',
  paymentAmount: '30,000원',
  showCancelButton: true,
};

const STATUS_STYLE = {
  취소: {
    badgeBackground: COLORS.secondary_red,
    badgeText: COLORS.semantic_red,
  },
  확정: {
    badgeBackground: COLORS.secondary_blue,
    badgeText: COLORS.semantic_blue,
  },
  완료: {
    badgeBackground: COLORS.grayscale_300,
    badgeText: COLORS.grayscale_0,
  },
};

const MyGuesthouseReservationDetail = ({ route }) => {
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const reservation = {
    ...DEFAULT_RESERVATION,
    ...(route?.params?.reservation || {}),
  };
  const cancelModalReservation = {
    reservationId: reservation.reservationId || reservation.id,
    roomName: reservation.room,
    reservationUserName: reservation.name,
    reservationUserPhone: reservation.phone,
    age: reservation.age,
    reservationNumber: reservation.reservationNumber,
    guestCount: reservation.guestCount,
    period: reservation.period,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
  };

  const isCancelled = reservation.status === '취소';
  const isCompleted = reservation.status === '완료';
  const isConfirmed = reservation.status === '확정';

  const paymentLabel = isCancelled ? '환불 금액' : '결제금액';
  const paymentAmountText = isCancelled
    ? reservation.refundAmount || reservation.paymentAmount
    : reservation.paymentAmount;

  const paymentStatusText = reservation.paymentStatus || reservation.paymentState;
  const paymentStatusColor = isCancelled ? styles.highlightText : null;
  const paymentAmountColor = isCancelled ? styles.highlightText : null;

  const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;

  return (
    <View style={styles.container}>
      <Header title="예약 상세정보" />

      <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBackground }]}>
            <Text style={[FONTS.fs_14_semibold, { color: statusStyle.badgeText }]}>
              {reservation.status}
            </Text>
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{reservation.name}</Text>
            <Text style={[FONTS.fs_12_medium, styles.highlightText]}>{reservation.statusText}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <InfoRow label="예약자" value={reservation.name} />
          <InfoRow label="나이" value={reservation.age} />
          <InfoRow label="전화번호" value={reservation.phone} />
          <InfoRow label="예약번호" value={reservation.reservationNumber} />
          <InfoRow label="이메일" value={reservation.email} />
          <InfoRow label="인원수" value={reservation.guestCount} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>예약내역</Text>
          <InfoRow label="서비스" value={reservation.serviceName} />
          <InfoRow label="객실" value={reservation.room} highlight />
          <InfoRow label="이용기간" value={reservation.period} highlight />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>결제정보</Text>
          <InfoRow
            label="결제상태"
            value={paymentStatusText}
            valueStyle={paymentStatusColor}
          />
          <InfoRow label="결제수단" value={reservation.paymentMethod} />
          <InfoRow
            label={paymentLabel}
            value={paymentAmountText}
            valueStyle={paymentAmountColor}
          />
        </View>

        {isConfirmed && reservation.showCancelButton ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCancelModalVisible(true)}
            >
              <Text style={[FONTS.fs_14_medium, styles.cancelButtonText]}>예약취소</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isCancelled || isCompleted ? <View style={styles.bottomSpacing} /> : null}
      </ScrollView>

      <ReservationCancelModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        reservation={cancelModalReservation}
        onSubmit={async () => {}}
      />
    </View>
  );
};

const InfoRow = ({ label, value, highlight = false, valueStyle = null }) => {
  if (!value && value !== 0) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>{label}</Text>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.infoValue,
          highlight ? styles.highlightText : null,
          valueStyle,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

export default MyGuesthouseReservationDetail;
