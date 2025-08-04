import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';

export default function UserUpcomingReservations({ data }) {
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => {
    const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkIn);
    const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(item.checkOut);

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
              <Text style={[FONTS.fs_12_medium, styles.adressText]}>주소</Text>
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
        <Text style={[FONTS.fs_12_medium, styles.cancelText]}>예약취소</Text>
        {index !== data.length - 1 && <View style={styles.devide} />}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.reservationId.toString()}
      renderItem={renderItem}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : 'flex-start',
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    flex: 1,
    alignSelf: 'center',
  },
});
