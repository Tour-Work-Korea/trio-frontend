import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import ReservationCancelModal from '@components/modals/HostMy/Guesthouse/ReservationCancelModal';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import EmptyIcon from '@assets/images/search_empty.svg';

// TODO
// 취소, 확정, 완료 순으로 나오게 하기

const reservations = [
  {
    id: '1',
    reservationId: 1,
    status: '취소',
    statusText: '신규예약',
    name: '이하늘',
    age: '1999년생',
    phone: '010-4123-0075',
    reservationNumber: 'WA_sddfei13',
    guestCount: '2',
    room: '여 6인 도미토리',
    period: '2025.04.15(화) ~ 2025.04.16(수)',
    checkInDate: '2025-04-15',
    checkOutDate: '2025-04-16',
    paymentStatus: '환불',
  },
  {
    id: '2',
    reservationId: 2,
    status: '확정',
    statusText: '완료 1, 취소 1',
    name: '이하늘',
    age: '1999년생',
    phone: '010-4123-0075',
    reservationNumber: 'WA_sddfei13',
    guestCount: '2',
    room: '여 6인 도미토리',
    period: '2025.04.15(화) ~ 2025.04.16(수)',
    checkInDate: '2025-04-15',
    checkOutDate: '2025-04-16',
    showCancelButton: true,
  },
  {
    id: '3',
    reservationId: 3,
    status: '완료',
    statusText: '완료 1',
    name: '이하늘',
    age: '1999년생',
    phone: '010-4123-0075',
    reservationNumber: 'WA_sddfei13',
    guestCount: '2',
    room: '여 6인 도미토리',
    period: '2025.04.15(화) ~ 2025.04.16(수)',
    checkInDate: '2025-04-15',
    checkOutDate: '2025-04-16',
  },
];

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

const ReservationList = ({ data, loading }) => {
  const navigation = useNavigation();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const listData = Array.isArray(data) && data.length > 0 ? data : reservations;

  const handleOpenCancelModal = (reservation) => {
    setSelectedReservation({
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
    });
    setCancelModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading title={'예약 내역을 불러오는 중 이에요'} />
      </View>
    );
  }

  if (Array.isArray(data) && data.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={EmptyIcon}
          iconSize={{ width: 100, height: 100 }}
          title="예약 내역이 없어요"
          description=""
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_18_semibold, styles.title]}>
        예약 <Text style={styles.titleHighlight}>{listData.length}</Text>건
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {listData.map((reservation, index) => {
          const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;

          return (
            <TouchableOpacity
              key={reservation.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('MyGuesthouseReservationDetail', { reservation })
              }
            >
              <View style={styles.headerRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBackground }]}>
                  <Text style={[FONTS.fs_14_semibold, { color: statusStyle.badgeText }]}>
                    {reservation.status}
                  </Text>
                </View>

                <View style={styles.headerTextBox}>
                  <Text style={[FONTS.fs_16_semibold, styles.userName]}>{reservation.name}</Text>
                  <Text style={[FONTS.fs_12_medium, styles.subText]}>{reservation.statusText}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <InfoRow label="예약자" value={reservation.name} />
                <InfoRow label="나이" value={reservation.age} />
                <InfoRow label="전화번호" value={reservation.phone} />
                <InfoRow label="예약번호" value={reservation.reservationNumber} />
                <InfoRow label="인원수" value={reservation.guestCount} />
                <InfoRow label="객실" value={reservation.room} isHighlight />
                <InfoRow label="이용기간" value={reservation.period} isHighlight />
                {reservation.paymentStatus ? (
                  <InfoRow label="결제상태" value={reservation.paymentStatus} isHighlight />
                ) : null}
              </View>

              {reservation.showCancelButton ? (
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOpenCancelModal(reservation);
                    }}
                  >
                    <Text style={[FONTS.fs_14_medium, styles.cancelButtonText]}>예약취소</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {index !== listData.length - 1 ? <View style={styles.divider} /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ReservationCancelModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation || {}}
        onSubmit={async () => {}}
      />
    </View>
  );
};

const InfoRow = ({ label, value, isHighlight = false }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>{label}</Text>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.infoValue,
          isHighlight && styles.infoValueHighlight,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

export default ReservationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 14,
  },
  titleHighlight: {
    color: COLORS.primary_orange,
  },
  listContent: {
    paddingBottom: 24,
  },

  card: {
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  // 예약 내용
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBox: {
    flex: 1,
  },
  userName: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  subText: {
    color: COLORS.primary_orange,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.grayscale_500,
  },
  infoValue: {
    color: COLORS.grayscale_900,
  },
  infoValueHighlight: {
    color: COLORS.primary_orange,
  },

  // 취소 버튼
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  cancelButtonText: {
    color: COLORS.grayscale_900,
  },

  divider: {
    marginTop: 20,
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
});
