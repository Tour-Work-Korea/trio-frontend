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
import AlertModal from '@components/modals/AlertModal';

export default function UserUpcomingReservations({data, onRefresh}) {
  const navigation = useNavigation();
  const [contactGuesthouseOpen, setContactGuesthouseOpen] = useState(false);

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
          {/* 상단 상태 및 날짜/시간 */}
          <View style={styles.headerRow}>
            <Text
              style={[
                FONTS.fs_16_semibold,
                styles.statusText,
                item.reservationStatus === 'PENDING' && styles.pendingText,
              ]}>
              {item.reservationStatus === 'PENDING' ? '승인 대기 중' : '신청 확정'}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.dateTimeText]}>
              {startFormatted.date} {startFormatted.time}
            </Text>
          </View>

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
              if (item.reservationStatus === 'PENDING') {
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
              } else {
                setContactGuesthouseOpen(true);
              }
            }}>
            <Text style={[FONTS.fs_12_medium, styles.cancelBtnText]}>
              {item.reservationStatus === 'PENDING' ? '신청취소' : '취소/ 환불 문의'}
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

      <AlertModal
        visible={contactGuesthouseOpen}
        message={`신청이 확정된 콘텐츠입니다.\n취소 및 환불은 해당 게스트하우스로\n직접 문의해주세요.`}
        buttonText="확인"
        onPress={() => setContactGuesthouseOpen(false)}
        onRequestClose={() => setContactGuesthouseOpen(false)}
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

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeText: {
    color: COLORS.grayscale_500,
  },
  statusText: {
    color: COLORS.grayscale_800,
  },
  pendingText: {
    color: COLORS.semantic_red,
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
