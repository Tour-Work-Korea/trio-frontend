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
import SearchEmpty from '@assets/images/search_empty_eye.svg';
import EmptyState from '@components/EmptyState';
import ReservationCancelDetailModal from '@components/modals/UserMy/Meet/ReservationCancelDetailModal';

export default function UserCancelledReservations({data}) {
  const navigation = useNavigation();

  // 모달
  const [selectedCancelledId, setSelectedCancelledId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = cancelledId => {
    setSelectedCancelledId(cancelledId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCancelledId(null);
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
          onPress={() => openModal(item.reservationId)}>
          {/* 상단 날짜/시간 */}
          <Text style={[FONTS.fs_14_medium, styles.dateTimeText]}>
            {startFormatted.date} {startFormatted.time}
          </Text>

          <View style={styles.divide} />

          <View style={styles.infoRow}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
            <View style={styles.infoContent}>
              <Text
                style={[FONTS.fs_16_semibold, styles.partyTitle]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.partyName}
              </Text>
              <Text
                style={[FONTS.fs_12_medium, styles.guesthouseText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName || '게스트하우스 정보 없음'}
              </Text>
            </View>
          </View>
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
            iconSize={{width: 120, height: 120}}
            title="취소내역이 없어요"
            description="이벤트을 예약하러 가볼까요?"
            buttonText="이벤트 찾아보기"
            onPressButton={() =>
              navigation.navigate('MainTabs', {screen: '이벤트'})
            }
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
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
  },
  guesthouseText: {
    color: COLORS.grayscale_800,
    flexShrink: 1,
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
  buttonText: {},
});
