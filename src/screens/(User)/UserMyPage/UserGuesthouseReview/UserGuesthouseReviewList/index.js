import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

import StarIcon from '@assets/images/star_white.svg';
import TrashIcon from '@assets/images/x_gray.svg';
import SearchEmpty from '@assets/images/search_empty.svg';

const mockReviews = [
  {
    id: 1,
    guesthouseName: '김군빌리지 게스트하우스',
    roomName: '4인실 여자',
    address: '제주시 애월리 12312312',
    checkIn: '2025. 04. 15 (화)',
    checkOut: '2025. 04. 16 (수)',
    rating: 4.2,
    images: [
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
    ],
    content:
      '숙소 깔끔하고 예쁘고 편했습니다. 의사소통도 빠르게 되고 재미있었어요. 다음에 또 놀러 오고싶어요',
    ownerReply: '멋진 리뷰 감사합니다!',
  },
  {
    id: 2,
    guesthouseName: '김군빌리지 게스트하우스',
    roomName: '4인실 여자',
    address: '제주시 애월리 12312312',
    checkIn: '2025. 04. 15 (화)',
    checkOut: '2025. 04. 16 (수)',
    rating: 4.2,
    images: [
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
      'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
    ],
    content:
      '숙소 깔끔하고 예쁘고 편했습니다. 의사소통도 빠르게 되고 재미있었어요. 다음에 또 놀러 오고싶어요',
    ownerReply: '멋진 리뷰 감사합니다!',
  },
];

const UserGuesthouseReviewList = () => {
  const renderReviewItem = ({ item }) => (
    <View style={styles.card}>
      {/* 상단: 이미지 + 기본정보 */}
      <View style={styles.topRow}>
        <Image source={{ uri: item.images[0] }} style={styles.thumbnail} />
        <View style={{ flex: 1 }}>
          <Text style={[FONTS.fs_16_bold]}>{item.guesthouseName}</Text>
          <Text style={[FONTS.fs_14_regular, { color: COLORS.grayscale_500 }]}>
            {item.roomName}
          </Text>
          <Text style={[FONTS.fs_12_regular, { color: COLORS.grayscale_500 }]}>
            {item.address}
          </Text>
          <Text style={[FONTS.fs_12_regular, { color: COLORS.grayscale_500 }]}>
            {item.checkIn} ~ {item.checkOut}
          </Text>
        </View>
      </View>

      {/* 평점 */}
      <View style={styles.ratingRow}>
        <StarIcon width={14} height={14} />
        <Text style={[FONTS.fs_12_regular, { marginLeft: 4 }]}>{item.rating}</Text>
        <TouchableOpacity style={{ marginLeft: 'auto' }}>
          <TrashIcon width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* 리뷰 내용 */}
      <Text style={[FONTS.fs_14_regular, { marginVertical: 8 }]}>{item.content}</Text>

      {/* 리뷰 이미지 목록 */}
      <View style={styles.imageRow}>
        {item.images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
        ))}
      </View>

      {/* 사장님 한마디 */}
      <View style={styles.ownerReplyBox}>
        <Text style={[FONTS.fs_12_regular, { color: COLORS.grayscale_500 }]}>사장님의 한마디</Text>
        <Text style={[FONTS.fs_14_regular]}>{item.ownerReply}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={mockReviews}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderReviewItem}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export default UserGuesthouseReviewList;

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
    alignSelf: 'center',
  },
});
