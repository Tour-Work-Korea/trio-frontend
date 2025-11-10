import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import Toast from 'react-native-toast-message';
import Carousel from 'react-native-reanimated-carousel';

import styles from './MyGuesthouseDetail.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ServiceInfoModal from '@components/modals/Guesthouse/ServiceInfoModal';
import ImageModal from '@components/modals/ImageModal';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import Loading from '@components/Loading';
import { publicFacilities, roomFacilities, services } from '@data/guesthouseOptions';

import EmptyHeart from '@assets/images/heart_empty.svg';
import LeftArrow from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import EditIcon from '@assets/images/edit_white.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import PersonIcon from '@assets/images/person20_white.svg';
import ReviewIcon from '@assets/images/wa_orange_noreview.svg';

import WifiIcon from '@assets/images/wifi_black.svg';
import UnWifiIcon from '@assets/images/wifi_gray.svg';
import PetFriendlyIcon from '@assets/images/pet_friendly_black.svg';
import UnPetFriendlyIcon from '@assets/images/pet_friendly_gray.svg';
import LuggageIcon from '@assets/images/luggage_storage_black.svg';
import UnLuggageIcon from '@assets/images/luggage_storage_gray.svg';
import LoungeIcon from '@assets/images/shared_lounge_black.svg';
import UnLoungeIcon from '@assets/images/shared_lounge_gray.svg';
import RightChevron from '@assets/images/chevron_right_gray.svg';

const serviceIcons = [
  { id: 10, icon: WifiIcon, label: '무선인터넷', width: 26, height: 26, iconName: 'WIFI' },
  { id: 22, icon: PetFriendlyIcon, label: '반려견동반', width: 24, height: 24, iconName: 'PET_FRIENDLY' },
  { id: 23, icon: LuggageIcon, label: '짐보관', width: 24, height: 24, iconName: 'BAGGAGE_STORAGE' },
  { id: 7, icon: LoungeIcon, label: '공용라운지', width: 28, height: 28, iconName: 'LOUNGE' },
];

// 한글 라벨 → 아이콘 토큰으로 정규화
const normalizeAmenityToken = (v) => {
  const s = String(v || '').trim();
  const koToToken = {
    '무선인터넷': 'WIFI',
    '무선 인터넷': 'WIFI',
    '반려동물 동반': 'PET_FRIENDLY',
    '반려견동반': 'PET_FRIENDLY',
    '짐보관': 'BAGGAGE_STORAGE',
    '라운지': 'LOUNGE',
    '공용라운지': 'LOUNGE',
  };
  // 이미 영문(예: WIFI) 오면 대문자로, 한글 라벨이면 매핑
  return koToToken[s] || s.toUpperCase();
};

const TAB_OPTIONS = ['객실', '소개', '이용규칙', '리뷰'];

const CATEGORY = {
  PUBLIC: '숙소 공용시설',
  ROOM: '객실 내 시설',
  SERVICE: '기타 시설 및 서비스',
};

const inList = (list, name) => list.some(x => x.name === name);
const getCategoryByName = (name) => {
  if (inList(publicFacilities, name)) return CATEGORY.PUBLIC;
  if (inList(roomFacilities, name)) return CATEGORY.ROOM;
  if (inList(services, name)) return CATEGORY.SERVICE;
  return '';
};

const MyGuesthouseDetail = ({ route }) => {
  const navigation = useNavigation();
  // 사진
  const { width: SCREEN_W } = Dimensions.get('window');
  const IMAGE_H = 280;
  const thumbnailIndex = useMemo(() => {
    const idx = (detail?.guesthouseImages ?? []).findIndex(i => i?.isThumbnail);
    return Math.max(idx, 0);
  }, [detail?.guesthouseImages]);

  const [imageIndex, setImageIndex] = useState(thumbnailIndex);
  useEffect(() => {
    setImageIndex(thumbnailIndex);
  }, [thumbnailIndex]);

  const { id, isPreview = false, previewData = null } = route.params || {};

  const [activeTab, setActiveTab] = useState('객실');
  const [detail, setDetail] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // 오늘/내일 날짜 고정
  const today = dayjs();
  const tomorrow = dayjs().add(1, 'day');
  const checkInDateStr = today.format('YYYY-MM-DD');
  const checkOutDateStr = tomorrow.format('YYYY-MM-DD');

  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';

  // 게하 상세 정보 불러오기
  const fetchDetail = useCallback(async () => {
    if (isPreview && previewData) {
      setDetail(previewData);
      return;
    }
    try {
      const response = await hostGuesthouseApi.getGuesthouseDetail(id);
      setDetail(response.data);
    } catch (e) {
      // 에러 처리 필요시 추가
    }
  }, [id, isPreview, previewData]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  // 객실 서비스
  const amenityTokenSet = useMemo(() => {
    const list = detail?.amenities ?? [];
    return new Set(
      list
        .map(a => {
          if (typeof a === 'string') return normalizeAmenityToken(a);
          if (a?.amenityName)     return normalizeAmenityToken(a.amenityName);
          if (a?.amenityType)     return normalizeAmenityToken(a.amenityType);
          return '';
        })
        .filter(Boolean)
    );
  }, [detail?.amenities]);

  // 썸네일을 맨 앞으로 정렬한 이미지 리스트
  const sortedImages = useMemo(() => {
    const imgs = [...(detail?.guesthouseImages ?? [])];
    return imgs.sort((a, b) =>
      a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1
    );
  }, [detail?.guesthouseImages]);
  const hasImages = sortedImages.length > 0;
  const thumbnailImage = hasImages ? sortedImages[0].guesthouseImageUrl : null;
  const modalImages = useMemo(() => (
    sortedImages.map(img => ({ id: img.id, imageUrl: img.guesthouseImageUrl }))
  ), [sortedImages]);

  // 수정 화면이동 시 데이터
  const mapDetailToEdit = (d) => ({
    guesthouseName: d.guesthouseName || '',
    guesthouseAddress: d.guesthouseAddress || '',
    guesthouseDetailAddress: d.guesthouseDetailAddress || '',
    guesthousePhone: d.guesthousePhone || '',
    guesthouseShortIntro: d.guesthouseShortIntro || '',
    guesthouseLongDesc: d.guesthouseLongDesc || '',
    checkIn: d.checkIn || '15:00:00',
    checkOut: d.checkOut || '11:00:00',

    guesthouseImages: (d.guesthouseImages || []).map(img => ({
      id: img.id,
      guesthouseImageUrl: img.guesthouseImageUrl,
      isThumbnail: !!img.isThumbnail,
    })),

    roomInfos: (d.roomInfos || []).map(r => ({
      id: r.id,
      roomName: r.roomName,
      roomCapacity: r.roomCapacity,
      roomMaxCapacity: r.roomMaxCapacity,
      roomDesc: r.roomDesc,
      roomPrice: r.roomPrice,
      roomExtraFees: r.roomExtraFees || [],
      roomImages: (r.roomImages || []).map(ri => ({
        id: ri.id,
        roomImageUrl: ri.roomImageUrl,
        isThumbnail: !!ri.isThumbnail,
      })),
      roomType: r.roomType,
    })),

    // amenityType(한글 라벨)만 넘김
    amenities: (d.amenities || [])
      .map(a => a.amenityType)
      .filter(Boolean),

    // 해시태그 (이름만 넘김)
    hashtags: (d.hashtags || []).map(h => h.hashtag),

    rules: d.rules || '',
  });

  const selectedAmenitiesForModal = useMemo(() => {
    const am = detail?.amenities ?? [];
    if (!isPreview) return am;
    if (am.length && typeof am[0] !== 'string') return am;

    return am.map((name, idx) => ({
      id: idx + 1,
      amenityName: normalizeAmenityToken(name), // WIFI 등
      amenityType: name,                        // 한글 라벨
      category: getCategoryByName(name),
      count: 1,
    }));
  }, [detail?.amenities, isPreview]);

  if (!detail) {
    return <Loading title="게스트하우스를 불러오고 있어요" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* 대표 이미지 */}
        {hasImages ? (
          <Carousel
            width={SCREEN_W}
            height={IMAGE_H}
            data={sortedImages}
            defaultIndex={thumbnailIndex}
            loop={false}
            autoPlay={false}
            pagingEnabled
            onSnapToItem={idx => setImageIndex(idx)}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setImageModalVisible(true)}
              >
                <Image
                  source={{ uri: item.guesthouseImageUrl }}
                  style={styles.mainImage}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={[
              styles.mainImage,
              { backgroundColor: COLORS.grayscale_200 },
            ]}
          />
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <LeftArrow width={28} height={28}/>
        </TouchableOpacity>

        {isPreview ? (
          <View style={styles.previewBox}>
            <Text style={[FONTS.fs_14_medium, styles.previewText]}>임시화면</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              const initialGuesthouse = mapDetailToEdit(detail);
              navigation.navigate('MyGuesthouseEdit', {
                initialGuesthouse,
                guesthouseId: detail.id,
              });
            }}
          >
            <EditIcon width={18} height={18}/>
          </TouchableOpacity>
        )}

        {/* 해시태그 */}
        <View style={styles.tagContainer}>
          {detail.hashtags?.map((tag, index) => (
            <View key={tag.id || index} style={styles.tagBox}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tag.hashtag}
              </Text>
            </View>
          ))}
          <View style={styles.tagBox}>
            <Text style={[FONTS.fs_12_medium, styles.tagText]}>
              #
            </Text>
          </View>
        </View>
      </View>

    <View style={styles.contentWrapper}>
      <View style={styles.contentTopWrapper}>
        <View style={styles.nameIconContainer}>
          <Text style={[FONTS.fs_20_semibold, styles.name]}>
            {detail.guesthouseName}
          </Text>
          <View style={styles.topIcons}>
            <View>
              <ShareIcon width={20} height={20} />
            </View>
            <View>
              <EmptyHeart width={20} height={20} />
            </View>
          </View>
        </View>

        <Text style={[FONTS.fs_14_regular, styles.address]}>
          {detail.guesthouseAddress} {detail.guesthouseDetailAddress}
        </Text>

        <View style={styles.shortIntroContainer}>
          <Text style={[FONTS.fs_14_regular, styles.shortIntroText]}>
            {detail.guesthouseShortIntro}
          </Text>
        </View>

        {/* 객실 서비스 */}
        <View style={styles.iconServiceContainer}>
          <View style={styles.iconServiceRowWithMore}>
            {serviceIcons.map(({ icon: Icon, label, width, height, iconName }, i) => {
              const isEnabled = amenityTokenSet.has(iconName);

              const GrayscaleIcon = {
                WIFI: UnWifiIcon,
                PET_FRIENDLY: UnPetFriendlyIcon,
                BAGGAGE_STORAGE: UnLuggageIcon,
                LOUNGE: UnLoungeIcon,
              }[iconName];

              const DisplayIcon = isEnabled ? Icon : GrayscaleIcon;

              return (
                <View key={i} style={styles.iconWrapper}>
                  <View style={styles.iconServiceWrapper}>
                    <DisplayIcon width={width} height={height} />
                  </View>
                  <Text
                    style={[
                      FONTS.fs_12_medium,
                      styles.iconServiceText,
                      !isEnabled && { color: COLORS.grayscale_400 },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}

            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconWrapper}>
              <View style={styles.iconServiceWrapper}>
                <RightChevron width={24} height={24} />
              </View>
              <Text style={[FONTS.fs_12_medium, styles.readMoreText]}>더보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.devide}/>

        <View style={styles.displayDateGuestRow}>
          <View style={styles.dateInfoContainer}>
            <CalendarIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              {today.format('M.D ddd')} - {tomorrow.format('M.D ddd')}
            </Text>
          </View>
          <View style={styles.guestInfoContainer}>
            <PersonIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              인원 1
            </Text>
          </View>
        </View>
      </View>

      {/* 탭 메뉴 */}
      <View style={styles.tabMenuWrapper}>
        {TAB_OPTIONS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <View style={styles.tabButton}>
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  { color: activeTab === tab ? COLORS.primary_blue : COLORS.grayscale_800 },
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === '객실' && (
        <View style={styles.roomContentWrapper}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>객실</Text>
          {detail.roomInfos?.map(room => {
          const roomTypeMap = {
            MIXED: '혼숙',
            FEMALE_ONLY: '여성전용',
            MALE_ONLY: '남성전용',
          };

          return (
            <View key={room.id}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('MyRoomDetail', {
                    roomId: room.id,
                    roomName: room.roomName,
                    roomPrice: room.roomPrice,
                    roomDesc: room.roomDesc,
                    roomCapacity: room.roomCapacity,
                    roomType: room.roomType,
                    checkIn: `${checkInDateStr}T${detail.checkIn}`,
                    checkOut: `${checkOutDateStr}T${detail.checkOut}`,
                    roomImages: room.roomImages || [],
                  });
                }}
              >
                <View style={styles.roomCard}>
                  {(() => {
                    const thumbnailImage =
                      room.roomImages?.find(img => img.isThumbnail)?.roomImageUrl ||
                      room.roomImages?.[0]?.roomImageUrl;

                    return thumbnailImage ? (
                      <Image
                        source={{ uri: thumbnailImage }}
                        style={styles.roomImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.roomImage,
                          { backgroundColor: COLORS.grayscale_0 },
                        ]}
                      />
                    );
                  })()}
                  <View style={styles.roomInfo}>
                    <View style={styles.roomNameDescContainer}>
                      <Text 
                        style={[FONTS.fs_16_semibold, styles.roomType]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {room.roomName}
                      </Text>
                      <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                        {room.roomCapacity}인실 {roomTypeMap[room.roomType] || ''}
                      </Text>
                      <View style={styles.checkTimeContainer}>
                        <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                          입실 {formatTime(detail.checkIn)}
                        </Text>
                        <Text style={[FONTS.fs_12_medium, styles.checkin]}>
                          퇴실 {formatTime(detail.checkOut)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[FONTS.fs_18_semibold, styles.roomPrice]}>
                      {room.roomPrice?.toLocaleString()}원
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        </View>
      )}

      {activeTab === '소개' && (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>소개</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.guesthouseLongDesc}
            </Text>
          </View>
        </View>
      )}

      {activeTab === '이용규칙' && (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>이용 규칙</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.rules}
            </Text>
          </View>
          
        </View>
      )}

      {activeTab === '리뷰' && (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>리뷰</Text>
          <View style={styles.reviewContainer}>
            <ReviewIcon width={100} height={60}/>
            <Text style={[FONTS.fs_14_medium, styles.reviewText]}>리뷰란 입니다.</Text>
          </View>
        </View>
      )}
    </View>
    
    {/* 편의시설/서비스 모달 */}
    <ServiceInfoModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      selectedAmenities={selectedAmenitiesForModal}
    />

    {/* 이미지 모달 */}
    {hasImages && (
      <ImageModal
        visible={imageModalVisible}
        title={detail.guesthouseName}
        images={modalImages}
        selectedImageIndex={imageIndex}
        onClose={() => setImageModalVisible(false)}
      />
    )}
    </ScrollView>
  );
};

export default MyGuesthouseDetail;