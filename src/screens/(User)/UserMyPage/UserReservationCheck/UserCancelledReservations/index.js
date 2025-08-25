import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty_eye.svg';
import EmptyState from '@components/EmptyState';
import ReservationCancelDetailModal from '@components/modals/UserMy/Guesthouse/ReservationCancelDetailModal';

export default function UserCancelledReservations({ data }) {
  const navigation = useNavigation();

  const toLocalDateTime = (date, time) =>
    date ? `${date}T${time ?? '00:00:00'}` : '';
  
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  // 모달
  const [selectedCancelledId, setSelectedCancelledId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (cancelledId) => {
    setSelectedCancelledId(cancelledId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCancelledId(null);
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
          <TouchableOpacity style={styles.card} onPress={() => openModal(item.reservationId)}>
            <View style={styles.guesthouseInfo}>
              <Image
                source={{ uri: item.guesthouseImage }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.infoContent}>
                <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{item.guesthouseName}</Text>
                <Text style={[FONTS.fs_14_medium, styles.roomText]}>{item.roomName}</Text>
                <Text style={[FONTS.fs_12_medium, styles.adressText]}>{item.guesthouseAddress}</Text>
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

          <TouchableOpacity 
            style={styles.reservationButton}
            onPress={() => {
              navigation.navigate('GuesthouseDetail', {
                id: item.guesthouseId,
                isFromDeeplink: true,
                checkIn: today.format('YYYY-MM-DD'),
                checkOut: tomorrow.format('YYYY-MM-DD'),
                guestCount: 1,
              });
            }}
          >
            <Text style={[FONTS.fs_16_semibold, styles.buttonText]}>다시 예약하기</Text>
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
            title="취소내역이 없어요"
            description="게스트하우스를 예약하러 가볼까요?"
            buttonText="게스트하우스 찾아보기"
            onPressButton={() => navigation.navigate('MainTabs', { screen: '게하' })}
          />
        }
      />

      {/* 상세 모달 */}
      <ReservationCancelDetailModal
        visible={modalVisible}
        onClose={closeModal}
        reservationId={selectedCancelledId}
      />

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
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
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {

  },
  roomText: {
    color: COLORS.grayscale_800,
  },
  adressText: {
    color: COLORS.grayscale_500,
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

  // 버튼
  reservationButton: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_200,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {

  },
});
