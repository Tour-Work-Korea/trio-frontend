import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';
import ReservationDetailModal from '@components/modals/UserMy/Guesthouse/ReservationDetailModal';

export default function UserPastReservations({ data }) {
  const navigation = useNavigation();

  // 모달
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReservationId(null);
  };

  const renderItem = ({ item, index }) => {
    const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkIn);
    const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkOut);

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

        <View style={styles.buttonContent}>
          <TouchableOpacity style={styles.buttonContainer}>
            <Text style={[FONTS.fs_16_semibold, styles.buttonText]}>다시 예약하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonContainer,
            ]}
            disabled={item.reviewed}
            onPress={() => {
              if (!item.reviewed) {
                const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkIn);
                const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkOut);

                navigation.navigate('UserGuesthouseReviewForm', {
                  guesthouseId: item.guesthouseId,
                  guesthouseName: item.guesthouseName,
                  roomName: item.roomName,
                  guesthouseAddress: item.guesthouseAddress,
                  checkInFormatted,
                  checkOutFormatted,
                });
              }
            }}
          >
            <Text
              style={[
                FONTS.fs_16_semibold,
                styles.buttonText,
                item.reviewed && { color: COLORS.grayscale_400 },
              ]}
            >
              {item.reviewed ? '리뷰 완료' : '리뷰 작성하기'}
            </Text>
          </TouchableOpacity>
        </View>
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
            description="게스트하우스를 예약하러 가볼까요?"
            buttonText="게스트하우스 찾아보기"
            onPressButton={() => navigation.navigate('MainTabs', { screen: '게하' })}
          />
        }
      />

      {/* 상세 모달 */}
      <ReservationDetailModal
        visible={modalVisible}
        onClose={closeModal}
        reservationId={selectedReservationId}
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
  buttonContent: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  buttonContainer: {
    flex: 1,
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
