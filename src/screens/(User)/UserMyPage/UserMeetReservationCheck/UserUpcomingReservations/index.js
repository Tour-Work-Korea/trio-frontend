import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';
import ReservationDetailModal from '@components/modals/UserMy/Guesthouse/ReservationDetailModal';
import ReservationCancelModal from '@components/modals/UserMy/Guesthouse/ReservationCancelModal'; // 추가

export default function UserUpcomingReservations({ data, onRefresh }) {
  const navigation = useNavigation();

  const toLocalDateTime = (date, time) =>
    date ? `${date}T${time ?? '00:00:00'}` : '';

  // 상세 모달
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 예약 취소 모달
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState(null);

  const openDetailModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedReservationId(null);
  };

  const openCancelModal = (reservationId) => {
    setCancelReservationId(reservationId);
    setCancelModalVisible(true);
  };

  const closeCancelModal = () => {
    setCancelModalVisible(false);
    setCancelReservationId(null);
  };

  const renderItem = ({ item, index }) => {
    const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkIn, item.guesthouseCheckIn)
    );
    const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkOut, item.guesthouseCheckOut)
    );

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item.reservationId)}>
          <View style={styles.guesthouseInfo}>
            <Image
              source={{ uri: item.guesthouseImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoContent}>
              <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{item.guesthouseName}</Text>
              <Text
                style={[FONTS.fs_14_medium, styles.roomText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.roomName}
              </Text>
              <Text
                style={[FONTS.fs_12_medium, styles.adressText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.guesthouseAddress}
              </Text>
            </View>
          </View>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkInFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkInFormatted.time} </Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.devideText]}>~</Text>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkOutFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkOutFormatted.time} </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openCancelModal(item.reservationId)}>
          <Text style={[FONTS.fs_12_medium, styles.cancelText]}>예약취소</Text>
        </TouchableOpacity>
  
        {index !== data.length - 1 && <View style={styles.devide} />}
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item.reservationId.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: data.length === 0 ? 'center' : 'flex-start',
          paddingVertical: 24,
        }}
        ListEmptyComponent={
          <EmptyState
            icon={SearchEmpty}
            iconSize={{ width: 120, height: 120 }}
            title="예약내역이 없어요"
            description="모임 예약하러 가볼까요?"
            buttonText="모임 찾아보기"
            onPressButton={() => navigation.navigate('MainTabs', { screen: '모임' })}
          />
        }
      />

      {/* 상세 모달 */}
      <ReservationDetailModal
        visible={modalVisible}
        onClose={closeDetailModal}
        reservationId={selectedReservationId}
      />

      {/* 예약 취소 모달 */}
      <ReservationCancelModal
        visible={cancelModalVisible}
        onClose={() => {
          closeCancelModal();
          onRefresh && onRefresh();
        }}
        reservationId={cancelReservationId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  cancelText: {
    color: COLORS.grayscale_400,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  devide: {
    marginVertical: 16,
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },  

  // 리스트
  card: {
  },
  // 게하 정보
  guesthouseInfo: {
    flexDirection: 'row',
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: 4,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {

  },
  roomText: {
    color: COLORS.grayscale_800,
    flexShrink: 1,
  },
  adressText: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
  },

  // 날짜, 시간
  dateContent: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  devideText: {
    marginHorizontal: 16,
    alignSelf: 'center',
  },
});
