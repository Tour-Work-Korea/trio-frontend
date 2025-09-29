import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import Toast from 'react-native-toast-message';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
// 예약 확정 임시
import userGuesthouseApi from '@utils/api/userGuesthouseApi';

import EmptyIcon from '@assets/images/search_empty.svg';

const statusOrder = (s) =>
  s === 'PENDING' ? 0 :
  s === 'CONFIRMED' ? 1 :
  s === 'COMPLETED' ? 2 : 3;
const statusLabel = (s) =>
  s === 'PENDING' ? '예약대기' :
  s === 'CONFIRMED' ? '이용예정(예약확정)' :
  s === 'COMPLETED' ? '이용완료' : s;

const ReservationList = ({ guesthouseId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [approvingId, setApprovingId] = useState(null); // 예약 확정 중인 아이템 id

  // 예약 목록 조회
  const fetchReservations = useCallback(async () => {
    if (!guesthouseId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await hostGuesthouseApi.getGuesthouseReservations(guesthouseId);
      const raw = Array.isArray(res?.data) ? res.data : [];
      const filtered = raw.filter((r) =>
        ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(r?.reservationStatus)
      );
      const sorted = [...filtered].sort(
        (a, b) => statusOrder(a.reservationStatus) - statusOrder(b.reservationStatus)
      );
      setData(sorted);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [guesthouseId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading title={'예약 내역을 불러오는 중 이에요'}/>
      </View>
    );
  }

  // 예약 확정
  const approveReservation = async (reservationId) => {
    const onConfirm = async () => {
      try {
        setApprovingId(reservationId);
        await userGuesthouseApi.approveTempGuesthouseReservation(reservationId);
        await fetchReservations(); // 성공 후 재조회
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: '예약 확정 실패 잠시 후 다시 시도해주세요.',
          position: 'top',
          visibilityTime: 2000,
        });
      } finally {
        setApprovingId(null);
      }
    };

    Alert.alert(
      '예약 확정',
      '이 예약을 확정하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: onConfirm },
      ],
      { cancelable: true }
    );
  };

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
                  ({
                    PENDING:   styles.statusPending,
                    CONFIRMED: styles.statusConfirmed,
                    COMPLETED: styles.statusCompleted,
                  }[item.reservationStatus] || styles.statusUnknown )
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
                {formatLocalDateToDotWithDay(item.checkInDate)}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.dateText]}>~</Text>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                {formatLocalDateToDotWithDay(item.checkOutDate)}
              </Text>
            </View>

            {/* 예약확정 버튼 */}
            {item.reservationStatus === 'PENDING' && (
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => approveReservation(item.reservationId)}
                disabled={approvingId === item.reservationId}
              >
                {approvingId === item.reservationId ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={[FONTS.fs_16_semibold, styles.approveText]}>예약확정 하기</Text>
                )}
              </TouchableOpacity>
            )}

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
  statusPending: {
    color: COLORS.semantic_yellow,
  },
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

  // 예약확정 버튼
  approveButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_800,
  },
  approveText: {
    color: COLORS.grayscale_0,
  },
});
