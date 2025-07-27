import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetDetail.styles';
import ButtonScarlet from '@components/ButtonScarlet';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';

// 임시 데이터
const MOCK_MEET_DETAIL = {
  id: 1,
  placeName: '김군빌리지 게스트하우스',
  thumbnail: require('@assets/images/exphoto.jpeg'),
  title: '오늘 소주한병 무료',
  address: '제주 제주시 여행길 1-1',
  capacity: 10,
  joined: 1,
  price: {
    숙박객: { 여자: 10000, 남자: 20000 },
    비숙박객: { 여자: 20000, 남자: 30000 },
  },
  coordinate: {
    latitude: 33.499621,
    longitude: 126.531188,
  },
  info: `후기로 입소문 난 제주사꼼장어 세 번째 브랜드, 막내네가 따뜻한 쉼과 모임을 엽니다.
낯선 여행지에서 새로운 사람들과 어울리고 싶은 분들을 위한 자유로운 사교 모임이에요.`,
  events: [
    '소주 한 병 무료 제공',
    '막내네 전용 안주 세트 제공',
    '제주감귤막걸리 1잔 서비스',
  ],
  photos: [
    require('@assets/images/exphoto.jpeg'),
    require('@assets/images/exphoto.jpeg'),
    require('@assets/images/exphoto.jpeg'),
    require('@assets/images/exphoto.jpeg'),
    require('@assets/images/exphoto.jpeg'),
  ],
};

const TABS = ['모임안내', '이벤트', '모임사진'];

const MeetDetail = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('모임안내');

  const [liked, setLiked] = useState(false);

  const {
    placeName,
    thumbnail,
    title,
    address,
    joined,
    capacity,
    price,
    coordinate,
    info,
  } = MOCK_MEET_DETAIL;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 썸네일 */}
        <Image source={thumbnail} style={styles.thumbnail} />
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft width={28} height={28} />
          </TouchableOpacity>
          <View style={styles.placePillContainer}>
            <Text style={[FONTS.fs_14_medium, styles.placePill]}>{placeName}</Text>
          </View>
        </View>
      </View>

      {/* 본문 */}
      <View style={styles.contentContainer}>
        {/* 제목 */}
        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_20_semibold]}>{title}</Text>
          <View style={styles.shareHeartContainer}>
            <TouchableOpacity>
              <ShareIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLiked(prev => !prev)} style={{ marginLeft: 12 }}>
              {liked ? <HeartFilled width={20} height={20} /> : <HeartEmpty width={20} height={20} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressCapacityContainer}>
          {/* 주소 */}
          <Text style={[FONTS.fs_14_regular, styles.addressText]}>
            {address}
          </Text>
          {/* 인원수 */}
          <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
            {joined}/{capacity}명
          </Text>
        </View>

        {/* 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={[FONTS.fs_14_regular, styles.description]}>
            {info}
          </Text>
        </View>

        {/* 모임금액 */}
        <View style={styles.priceBox}>
          <Text style={[FONTS.fs_14_semibold, styles.priceTitle]}>모임금액</Text>

          <View style={styles.priceRow}>
            {/* 숙박객 */}
            <View style={styles.priceSection}>
              <Text style={[FONTS.fs_14_regular, styles.priceSectionTitle, { color: COLORS.primary_orange }]}>
                숙박객
              </Text>
              <View style={styles.priceTextRow}>
                <Text style={[FONTS.fs_14_medium, styles.priceText, { marginBottom: 4} ]}>
                  여자 {price['숙박객'].여자.toLocaleString()}원
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                  남자 {price['숙박객'].남자.toLocaleString()}원
                </Text>
              </View>
            </View>

            <View style={styles.devide}/>

            {/* 비숙박객 */}
            <View style={styles.priceSection}>
              <Text style={[FONTS.fs_14_regular, styles.priceSectionTitle, { color: COLORS.primary_blue }]}>
                비숙박객
              </Text>
              <View style={styles.priceTextRow}>
                <Text style={[FONTS.fs_14_medium, styles.priceText, { marginBottom: 4} ]}>
                  여자 {price['비숙박객'].여자.toLocaleString()}원
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                  남자 {price['비숙박객'].남자.toLocaleString()}원
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 지도 */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={coordinate} />
        </MapView>

        <View style={styles.devide}/>

        {/* 하단 탭 */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                  selectedTab === tab && FONTS.fs_14_semibold,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        {/* 모임 안내 */}
        {selectedTab === '모임안내' && (
          <View style={styles.tabContent}>
            <View style={styles.infoTextContainer}>
              <Text style={[FONTS.fs_14_regular, styles.infoText]}>
                후기로 입소문 난 제주사꼼장의 세 번째 브랜드, 막내네가 따뜻한 사교 모임을 엽니다.{"\n"}
                낯선 여행지에서 새로운 사람들과 어울리고 싶었던 적, 있으시죠?{"\n"}
                혼자 떠난 여행이 조금은 허전하게 느껴질 때, 가볍게 어울릴 수 있는 자리가 있다면 어떨까요?{"\n"}
                막내네 사교 모임은 그런 순간을 위해 준비된, 누구에게나 열려 있는 따뜻한 저녁 모임입니다.{"\n"}
                이번 주, 막내네에서 함께해요.
              </Text>
            </View>
          </View>
        )}

        {/* 이벤트 */}
        {selectedTab === '이벤트' && (
          <View style={styles.tabContent}>
            {MOCK_MEET_DETAIL.events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={[FONTS.fs_14_semibold, styles.eventTitle]}>
                  이벤트 {index + 1}
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.eventDesc]}>
                  {event}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 모임 사진 */}
        {selectedTab === '모임사진' && (
          <View style={styles.tabContent}>
            {/* 확대 이미지 */}
            <Image
              source={MOCK_MEET_DETAIL.photos[currentImageIndex]}
              style={styles.mainImageContainer}
            />

            {/* 이미지 리스트 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {MOCK_MEET_DETAIL.photos.map((photo, index) => (
                <TouchableOpacity key={index} onPress={() => setCurrentImageIndex(index)}>
                  <Image
                    source={photo}
                    style={[
                      styles.image,
                      index === currentImageIndex && styles.selectedImage,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.button}>
          <ButtonScarlet
            title="참여하기"
            onPress={() => {
              navigation.navigate('MeetReservation', {
                title,
                checkIn: '2025-07-30T18:00:00', // 임의
                checkOut: '2025-07-30T22:00:00', // 임의
                isGuest: true, // 숙박객 여부
                gender: '남자', // 남자/여자
                meetPrice: price['숙박객']['남자'], // 선택된 성별 기반 가격
              });
            }}
          />
        </View>

      </View>
    </ScrollView>
  );
};

export default MeetDetail;
