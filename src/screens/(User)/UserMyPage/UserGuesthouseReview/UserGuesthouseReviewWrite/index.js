import React, { useEffect, useState , useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import NoReview from '@assets/images/wa_orange_noreview.svg';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

const UserGuesthouseReviewWrite = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const toLocalDateTime = (date, time) =>
    date ? `${date}T${time ?? '00:00:00'}` : '';

  const fetchReservationList = async () => {
    try {
      setLoading(true);
      const res = await userMyApi.getMyReservations();
      setReservations(res.data);
    } catch (error) {
      console.log('예약 목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservationList();
    }, [])
  );

  // COMPLETED 상태, 리뷰 안 쓴것만
  const completedReservations = reservations.filter(
    (item) => item.reservationStatus === 'COMPLETED' && !item.reviewed
  );

  const renderItem = ({ item, index }) => {
    const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkIn, item.guesthouseCheckIn)
    );
    const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      toLocalDateTime(item.checkOut, item.guesthouseCheckOut)
    );

    return (
      <View style={styles.container}>
        <View style={styles.card}>
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
        </View>

        <TouchableOpacity 
          style={styles.reviewButton} 
          onPress={() => {
            if (!item.reviewed) {
              const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(
                toLocalDateTime(item.checkIn, item.guesthouseCheckIn)
              );
              const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(
                toLocalDateTime(item.checkOut, item.guesthouseCheckOut)
              );

              navigation.navigate('UserGuesthouseReviewForm', {
                guesthouseId: item.guesthouseId,
                guesthouseName: item.guesthouseName,
                roomName: item.roomName,
                guesthouseAddress: item.guesthouseAddress,
                checkInFormatted: checkInFormatted,
                checkOutFormatted: checkOutFormatted,
              });
            }
          }}
        >
          <Text style={[FONTS.fs_16_semibold, styles.reviewText]}>리뷰 작성하기</Text>
        </TouchableOpacity>
  
        {index !== reservations.length - 1 && <View style={styles.devide} />}
      </View>
    );
  };

  return (
    <>
      {loading ? (
          <Loading title="리뷰 목록을 불러오고 있어요." />
        ) : (
        <FlatList
          data={completedReservations}
          keyExtractor={item => item.reservationId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: completedReservations.length === 0 ? 'center' : 'flex-start',
            paddingVertical: 24,
          }}
          ListEmptyComponent={
            <EmptyState
              icon={NoReview}
              iconSize={{ width: 100, height: 60 }}
              title="아직 작성할 리뷰가 없어요"
              description="게스트하우스를 예약하러 가볼까요?"
              buttonText="게스트하우스 찾아보기"
              onPressButton={() => navigation.navigate('MainTabs', { screen: '게하' })}
            />
          }
        />
      )}
    </>
  );
};

export default UserGuesthouseReviewWrite;

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

  // 리뷰 버튼
  reviewButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  reviewText: {
    alignSelf: 'center',
  },
});
