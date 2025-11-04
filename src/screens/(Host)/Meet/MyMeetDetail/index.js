import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MyMeetDetail.styles';
import hostMeetApi from '@utils/api/hostMeetApi';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';

const TABS = ['모임안내', '이벤트', '모임사진'];

const MyMeetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { partyId } = route.params ?? {};

  const [selectedTab, setSelectedTab] = useState('모임안내');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid()
        ? date.format('HH:mm')
        : timeStr.slice(0, 5);
  };
  const formatDateWithDay = (dateStr) => {
    if (!dateStr) return '-';
    const date = dayjs(dateStr);
    if (!date.isValid()) return '-';
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  // 모임 상세 데이터
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const { data } = await hostMeetApi.getPartyDetail(partyId);
        setDetail(data);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: '상세 조회에 실패했어요',
          text2: err?.response?.data?.message || err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    if (partyId != null) fetchDetail();
  }, [partyId]);

  const {
    guesthouseName,
    partyTitle,
    description,
    location,
    partyInfo,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
    numOfAttendance,
    maxAttendance,
    amount,             // 숙박객 남자
    femaleAmount,       // 숙박객 여자
    maleNonAmount,      // 비숙박객 남자
    femaleNonAmount,    // 비숙박객 여자
    partyEvents,
    partyImages,
    coordinate,         // 백엔드 확장 시 { latitude, longitude } 형태로 받을 것을 가정
  } = detail ?? {};

  // 날짜/시간 파생 (끝나는 날짜는 시작 날짜와 동일하다고 가정)
  const checkInDate  = partyStartDateTime || null;
  const checkInTime  = partyStartTime || partyStartDateTime || null;
  const checkOutDate = partyStartDateTime || null;
  const checkOutTime = partyEndTime || null;

  // 썸네일/갤러리
  const thumbnailSource = useMemo(() => {
    const th = partyImages?.find(i => i.isThumbnail);
    if (th?.imageUrl) return { uri: th.imageUrl };
    // 응답에 없다면 첫 이미지
    if (partyImages?.[0]?.imageUrl) return { uri: partyImages[0].imageUrl };
  }, [partyImages]);

  const gallery = useMemo(
    () => (partyImages?.map(p => ({ uri: p.imageUrl })) ?? []),
    [partyImages]
  );

  // 가격(라벨 매핑)
  const priceBox = useMemo(() => ({
    guest: {
      female: femaleAmount ?? null,
      male: amount ?? null,
    },
    nonGuest: {
      female: femaleNonAmount ?? null,
      male: maleNonAmount ?? null,
    },
  }), [amount, femaleAmount, femaleNonAmount, maleNonAmount]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 썸네일 */}
        <Image source={thumbnailSource} style={styles.thumbnail} />
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft width={28} height={28} />
          </TouchableOpacity>
          <View style={styles.placePillContainer}>
            <Text style={[FONTS.fs_14_medium, styles.placePill]}>{guesthouseName}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}> 
          <TouchableOpacity style={styles.editButton}>
            <Text style={[FONTS.fs_14_medium, styles.editText]}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.showReservationButton}>
            <Text style={[FONTS.fs_14_medium, styles.showReservationText]}>
              예약 현황 보러 가기 {numOfAttendance}/{maxAttendance}명
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 본문 */}
      <View style={styles.contentContainer}>
        {/* 제목 */}
        <View style={styles.titleRow}>
          <Text
            style={[FONTS.fs_20_semibold, styles.titleText]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {partyTitle}
          </Text>
          <View style={styles.shareHeartContainer}>
            <View>
              <ShareIcon width={20} height={20} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <HeartEmpty width={20} height={20} />
            </View>
          </View>
        </View>

        <View style={styles.addressCapacityContainer}>
          {/* 주소 */}
          <Text 
            style={[FONTS.fs_14_regular, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
          {/* 인원수 */}
          <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
            {numOfAttendance}/{maxAttendance}명
          </Text>
        </View>

        {/* 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={[FONTS.fs_14_regular, styles.description]}>
            {description}
          </Text>
        </View>

        {/* 날짜 */}
        <View style={styles.dateBoxContainer}>
            <View style={styles.dateBoxCheckIn}>
                <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>모임 시작</Text>
                <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkInDate)}</Text>
                <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkInTime)}</Text>
            </View>
            <View style={styles.dateBoxCheckOut}>
                <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>모임 종료</Text>
                <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkOutDate)}</Text>
                <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkOutTime)}</Text>
            </View>
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
                  여자 {Number(priceBox.guest.female).toLocaleString()}원
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                  남자 {Number(priceBox.guest.male).toLocaleString()}원
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
                  여자 {Number(priceBox.nonGuest.female).toLocaleString()}원
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.priceText]}>
                  남자 {Number(priceBox.nonGuest.male).toLocaleString()}원
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 지도 */}
        {/* <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={coordinate} />
        </MapView> */}

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
                {partyInfo}
              </Text>
            </View>
          </View>
        )}

        {/* 이벤트 */}
        {selectedTab === '이벤트' && (
          <View style={styles.tabContent}>
             {(partyEvents?.length ? partyEvents : []).map((ev, idx) => (
              <View key={ev.id ?? idx} style={styles.eventItem}>
                <Text style={[FONTS.fs_14_semibold, styles.eventTitle]}>
                  이벤트 {idx + 1}
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.eventDesc]}>
                  {ev.eventName}
                </Text>
              </View>
            ))}
            {!partyEvents?.length && (
              <Text style={[FONTS.fs_14_regular]}>등록된 이벤트가 없습니다.</Text>
            )}
          </View>
        )}

        {/* 모임 사진 */}
        {selectedTab === '모임사진' && (
          <View style={styles.tabContent}>
            {/* 확대 이미지 */}
            <Image
              source={gallery[currentImageIndex]}
              style={styles.mainImageContainer}
            />

            {/* 이미지 리스트 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {(gallery.length ? gallery : [PLACEHOLDER]).map((photo, index) => (
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

      </View>
    </ScrollView>
  );
};

export default MyMeetDetail;
