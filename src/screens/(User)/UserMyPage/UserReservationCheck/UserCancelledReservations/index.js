import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import ButtonWhite from '@components/ButtonWhite';

import SearchEmpty from '@assets/images/search_empty_eye.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import EmptyState from '@components/EmptyState';

export default function UserCancelledReservations({ data }) {
  const navigation = useNavigation();
  const today = dayjs();
  const tomorrow = today.add(1, 'day');
  const genderMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };

  const toLocalDateTime = (date, time) =>
    date ? `${date}T${time ?? '00:00:00'}` : '';

  const buildRoomDetailText = (item) => {
    if (!item) return '';
    const isDormitory = item.roomType === 'DORMITORY';
    const capacityText = item.roomCapacity ? `${item.roomCapacity}인` : '';

    if (isDormitory) {
      const genderText = genderMap[item.dormitoryGenderType] || '';
      const base = capacityText ? `[${capacityText} 도미토리]` : '[도미토리]';
      if (genderText && item.dormitoryGenderType !== 'MIXED') {
        return `${base}, ${genderText}`;
      }
      return base;
    }

    const maxCapacityText = item.roomMaxCapacity
      ? `(최대 ${item.roomMaxCapacity}인)`
      : '';
    const basePrefix = capacityText ? `${capacityText} 기준` : '기준';
    const base = `${basePrefix}${maxCapacityText}`;
    return item.femaleOnly ? `${base}, 여성 전용` : base;
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
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_16_semibold, styles.titleText]}>예약 취소</Text>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() =>
                navigation.navigate('GuesthouseCancelledReceipt', {
                  reservationId: item.reservationId,
                  reservationItem: item,
                })
              }
            >
              <Text style={[FONTS.fs_12_medium, styles.detailText]}>취소 상세</Text>
              <ChevronRight width={16} height={16}/>
            </TouchableOpacity>
          </View>
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
                style={[FONTS.fs_12_medium, styles.roomDetailText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {buildRoomDetailText(item)}
              </Text>
            </View>
          </View>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkInFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkInFormatted.time} </Text>
            </View>
            <View style={[FONTS.fs_14_medium, styles.rowDevide]}/>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkOutFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkOutFormatted.time} </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <ButtonWhite
            title='다시 예약'
            style={{flex:1}}
            onPress={() =>
              navigation.navigate('GuesthouseDetail', {
                id: item.guesthouseId,
                isFromDeeplink: false,
                checkIn: today.format('YYYY-MM-DD'),
                checkOut: tomorrow.format('YYYY-MM-DD'),
                guestCount: 1,
              })
            }
          />
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
            title="취소내역이 없어요"
            description="게스트하우스를 예약하러 가볼까요?"
            buttonText="게스트하우스 찾아보기"
            onPressButton={() => navigation.navigate('MainTabs', { screen: '게하' })}
          />
        }
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
    backgroundColor: COLORS.grayscale_200,
  },  

  // 리스트
  card: {
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    color: COLORS.semantic_red,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: COLORS.semantic_blue,
  },
  // 게하 정보
  guesthouseInfo: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
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
  roomDetailText: {
    color: COLORS.grayscale_500,
    flexShrink: 1,
  },

  // 날짜, 시간
  dateContent: {
    marginTop: 12,
    padding: 4,
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_400,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  rowDevide: {
    marginHorizontal: 16,
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_200,
    height: '100%',
    width: 1,
  },

  // 버튼
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
  },
});
