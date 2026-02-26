import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import ReservationCancelModal from '@components/modals/HostMy/Guesthouse/ReservationCancelModal';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import EmptyIcon from '@assets/images/search_empty.svg';

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

const STATUS_LABEL_MAP = {
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};
const STATUS_SORT_ORDER = {
  취소: 0,
  확정: 1,
  완료: 2,
};

const normalizeReservation = (reservation) => {
  const status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  const completedTotal = Number(reservation?.completedTotal || 0);
  const canceledTotal = Number(reservation?.canceledTotal || 0);
  const amount = Number(reservation?.amount || 0);
  const checkInDate = reservation?.checkInDate;
  const checkOutDate = reservation?.checkOutDate;
  const period = checkInDate && checkOutDate
    ? `${formatLocalDateToDotWithDay(checkInDate)} ~ ${formatLocalDateToDotWithDay(checkOutDate)}`
    : reservation?.period;
  const birthYear = reservation?.birthDate?.split?.('-')?.[0];

  return {
    ...reservation,
    id: reservation?.reservationId ?? reservation?.id,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    statusText: reservation?.statusText ?? `완료 ${completedTotal}, 취소 ${canceledTotal}`,
    name: reservation?.userName ?? reservation?.name,
    age: reservation?.age ?? (birthYear ? `${birthYear}년생` : ''),
    phone: reservation?.userPhone ?? reservation?.phone,
    reservationNumber: reservation?.reservationCode ?? reservation?.reservationNumber,
    guestCount:
      reservation?.guestCount != null && `${reservation?.guestCount}` !== ''
        ? `${reservation.guestCount}명`
        : reservation?.guestCount,
    email: reservation?.userEmail ?? reservation?.email,
    serviceName: reservation?.guesthouseName ?? reservation?.serviceName,
    room: reservation?.roomName ?? reservation?.room,
    period,
    paymentStatus: reservation?.paymentStatus ?? (status === '취소' ? '환불' : '결제완료'),
    paymentState: reservation?.paymentState ?? (status === '취소' ? '환불' : '결제완료'),
    paymentAmount:
      reservation?.paymentAmount ??
      (Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : ''),
    showCancelButton:
      reservation?.showCancelButton != null
        ? reservation?.showCancelButton
        : status === '확정',
  };
};

const ReservationList = ({ data, totalCount = 0, loading, loadingMore = false, onEndReached }) => {
  const navigation = useNavigation();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const listData = Array.isArray(data)
    ? data
      .map(normalizeReservation)
      .sort((a, b) => {
        const aOrder = STATUS_SORT_ORDER[a.status] ?? Number.MAX_SAFE_INTEGER;
        const bOrder = STATUS_SORT_ORDER[b.status] ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      })
    : [];

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

  const renderItem = ({ item: reservation, index }) => {
    const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;

    return (
      <TouchableOpacity
        key={String(reservation.reservationId || reservation.id || index)}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('MyGuesthouseReservationDetail', {
            reservationId: reservation.reservationId || reservation.id,
            reservation,
          })
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
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={(item, index) => String(item.reservationId || item.id || index)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={(
          <Text style={[FONTS.fs_18_semibold, styles.title]}>
            예약 <Text style={styles.titleHighlight}>{totalCount}</Text>건
          </Text>
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={COLORS.primary_orange} />
            </View>
          ) : null
        }
      />

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
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
