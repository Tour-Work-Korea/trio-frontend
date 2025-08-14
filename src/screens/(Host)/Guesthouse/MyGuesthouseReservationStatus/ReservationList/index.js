import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';

import EmptyIcon from '@assets/images/search_empty.svg';

const statusOrder = (s) => (s === 'CONFIRMED' ? 0 : s === 'COMPLETED' ? 1 : 2);
const statusLabel = (s) => (s === 'CONFIRMED' ? '이용예정' : '이용완료');

// 임시 데이터
const toISO = (date) => new Date(date).toISOString();
const addDays = (base, d) => {
  const dt = new Date(base);
  dt.setDate(dt.getDate() + d);
  return dt;
};

const makeMockReservations = () => {
  const now = new Date();
  return [
    {
      reservationId: 1,
      roomName: '도미토리 A',
      roomCapacity: 4,
      roomMaxCapacity: 6,
      reservationUserName: '홍길동',
      reservationUserPhone: '010-1111-2222',
      reservationStatus: 'CONFIRMED',
      checkInDate: toISO(addDays(now, 2)),
      checkOutDate: toISO(addDays(now, 3)),
    },
    {
      reservationId: 2,
      roomName: '여성전용 B',
      roomCapacity: 2,
      roomMaxCapacity: 2,
      reservationUserName: '김영희',
      reservationUserPhone: '010-3333-4444',
      reservationStatus: 'CONFIRMED',
      checkInDate: toISO(addDays(now, 5)),
      checkOutDate: toISO(addDays(now, 6)),
    },
    {
      reservationId: 3,
      roomName: '패밀리룸 C',
      roomCapacity: 4,
      roomMaxCapacity: 4,
      reservationUserName: '이철수',
      reservationUserPhone: '010-5555-6666',
      reservationStatus: 'CONFIRMED',
      checkInDate: toISO(addDays(now, 1)),
      checkOutDate: toISO(addDays(now, 2)),
    },
    {
      reservationId: 4,
      roomName: '싱글 D',
      roomCapacity: 1,
      roomMaxCapacity: 1,
      reservationUserName: '박민수',
      reservationUserPhone: '010-7777-8888',
      reservationStatus: 'COMPLETED',
      checkInDate: toISO(addDays(now, -6)),
      checkOutDate: toISO(addDays(now, -5)),
    },
    {
      reservationId: 5,
      roomName: '트윈 E',
      roomCapacity: 2,
      roomMaxCapacity: 2,
      reservationUserName: '정다은',
      reservationUserPhone: '010-9999-0000',
      reservationStatus: 'COMPLETED',
      checkInDate: toISO(addDays(now, -10)),
      checkOutDate: toISO(addDays(now, -9)),
    },
  ];
};

const ReservationList = ({ guesthouseId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guesthouseId) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await hostGuesthouseApi.getGuesthouseReservations(guesthouseId);
        if (cancelled) return;

        const raw = Array.isArray(res?.data) ? res.data : [];
        // 예약상태는 CONFIRMED/COMPLETED만 사용
        const filtered = raw.filter(
          (r) => r?.reservationStatus === 'CONFIRMED' || r?.reservationStatus === 'COMPLETED'
        );

        // 임시데이터 사용
        // const base = filtered.length === 0 ? makeMockReservations() : filtered;
        const base = filtered;

        // CONFIRMED 먼저 정렬
        const sorted = [...base].sort((a, b) => statusOrder(a.reservationStatus) - statusOrder(b.reservationStatus));

        setData(sorted);
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [guesthouseId]);

  if (!guesthouseId) return null;

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading title={'예약 내역을 불러오는 중 이에요'}/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.reservationId)}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.statusContainer}>
               <Text style={[FONTS.fs_16_semibold, styles.name]}>
                {item.roomName} ({item.roomCapacity}인실)
              </Text>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  item.reservationStatus === 'CONFIRMED'
                    ? styles.statusConfirmed
                    : styles.statusCompleted,
                ]}
              >
                {statusLabel(item.reservationStatus)}
              </Text>
            </View>
      
            {/* 예약자 정보 */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={[FONTS.fs_14_medium, {color: COLORS.grayscale_500}]}>예약자</Text>
                <Text style={[FONTS.fs_14_medium]}>{item.reservationUserName}</Text>
              </View>
            </View>
            
            {/* 이용 날짜 */}
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(item.checkInDate).date}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.dateText]}>~</Text>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(item.checkOutDate).date}
              </Text>
            </View>

            {index !== data.length - 1 && <View style={styles.devide} />}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <EmptyState
              icon={EmptyIcon}
              iconSize={{ width: 100, height: 100 }}
              title="예약 내역이 없어요"
              description=""
            />
          </View>
        }
        contentContainerStyle={
          data.length === 0
            ? { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 }
            : { paddingVertical: 8 }
        }
      />
    </View>
  );
};

export default ReservationList;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingVertical: 12,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // 내역 목록
  card: {

  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    marginBottom: 4,
  },
  // 이용 상황
  statusConfirmed: {
    color: COLORS.semantic_red,
  },
  statusCompleted: {
    color: COLORS.semantic_green,
  },
  // 예약자 정보
  infoContainer: {
    gap: 4,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // 이용 날짜
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'space-between',
  },
  dateText: {
    
  },

  devide: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 12,
  },
});
