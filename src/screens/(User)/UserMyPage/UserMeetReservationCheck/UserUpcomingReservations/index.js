import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';


import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';

export default function UserUpcomingReservations({data, onRefresh}) {
  const navigation = useNavigation();

  const renderItem = ({item, index}) => {
    const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      item.startDateTime,
    );

    const imageSource =
      typeof item.partyImage === 'string'
        ? {uri: item.partyImage}
        : item.partyImage;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('MeetPaymentReceipt', {
              reservationId: item.reservationId,
              partyId: item.partyId,
            })
          }
        >
          {/* 상단 날짜/시간 */}
          <Text style={[FONTS.fs_14_medium, styles.dateTimeText]}>
            {startFormatted.date} {startFormatted.time}
          </Text>

          <View style={styles.divide} />

          {/* 파티명 */}
          <Text
            style={[FONTS.fs_18_medium, styles.partyTitle]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.partyName}
          </Text>

          {/* 주소 */}
          <Text
            style={[FONTS.fs_12_medium, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.guesthouseAddress || '주소 정보 없음'}
          </Text>

          {/* 썸네일 */}
          <View style={styles.imageWrap}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          </View>

          {/* 예약취소 */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              navigation.navigate('MeetCancelConfirm', {
                reservationId: item.reservationId,
                cancelContext: {
                  partyTitle: item.partyName,
                  partyImage: item.partyImage,
                  guesthouseName: item.guesthouseName,
                  startDateTime: item.startDateTime,
                  endDateTime: item.endDateTime,
                  partyLocation: item.guesthouseAddress,
                  ...(typeof item.amount === 'number'
                    ? {paidAmount: item.amount}
                    : {}),
                  ...(typeof item.cancelFee === 'number'
                    ? {cancelFee: item.cancelFee}
                    : {}),
                  ...(typeof item.refundAmount === 'number'
                    ? {refundAmount: item.refundAmount}
                    : {}),
                  ...(item.refundMethod
                    ? {refundMethod: item.refundMethod}
                    : {}),
                },
              });
            }}>
            <Text style={[FONTS.fs_12_medium, styles.cancelBtnText]}>
              신청취소
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

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
            iconSize={{width: 120, height: 120}}
            title="신청내역이 없어요"
            description="콘텐츠 신청하러 가볼까요?"
            buttonText="콘텐츠 찾아보기"
            onPressButton={() =>
              navigation.navigate('MainTabs', {screen: '콘텐츠'})
            }
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

  // 리스트
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16,

    // iOS shadow
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},

    // Android shadow
    elevation: 3,
  },

  dateTimeText: {
    color: COLORS.grayscale_700,
    marginBottom: 8,
  },
  divide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 8,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  addressText: {
    color: COLORS.grayscale_500,
    marginBottom: 16,
  },
  imageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },

  // 예약취소
  cancelBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  cancelBtnText: {
    color: COLORS.grayscale_400,
  },
});
