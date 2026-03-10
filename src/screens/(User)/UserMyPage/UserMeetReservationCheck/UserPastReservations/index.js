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
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import EmptyState from '@components/EmptyState';
import ReservationDetailModal from '@components/modals/UserMy/Meet/ReservationDetailModal';

export default function UserPastReservations({data}) {
  const navigation = useNavigation();

  // 모달
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = reservationId => {
    setSelectedReservationId(reservationId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReservationId(null);
  };

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
          activeOpacity={0.9}
          // onPress={() => openModal(item.reservationId)}
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
        </TouchableOpacity>
        {index !== data.length - 1 && <View style={styles.devide} />}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.cancelledBtn}
        onPress={() => navigation.navigate('UserMeetReservationCancelled')}
      >
        <Text style={[FONTS.fs_12_medium, styles.cancelledBtnText]}>취소된 이벤트 보기</Text>
        <ChevronRight width={12} height={12} />
      </TouchableOpacity>
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
            title="예약내역이 없어요"
            description="이벤트 예약하러 가볼까요?"
            buttonText="이벤트 찾아보기"
            onPressButton={() =>
              navigation.navigate('MainTabs', {screen: '이벤트'})
            }
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

  // 취소 예약 보기 버튼
  cancelledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 16,
  },
  cancelledBtnText: {
    color: COLORS.grayscale_500,
  },
});
