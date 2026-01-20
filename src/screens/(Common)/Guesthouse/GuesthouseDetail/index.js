import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import Carousel from 'react-native-reanimated-carousel';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ServiceInfoModal from '@components/modals/Guesthouse/ServiceInfoModal';
import ImageModal from '@components/modals/ImageModal';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import GuesthouseReview from '@screens/(Common)/BottomTabs/Guesthouse/GuesthouseReview';
import {
  guesthouseDetailDeeplink,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';
import Loading from '@components/Loading';
import {genderOptions} from '@constants/guesthouseOptions';
import DateGuestModal from '@components/modals/Guesthouse/DateGuestModal';
import { toggleFavorite } from '@utils/toggleFavorite';
import { trimJejuPrefix } from '@utils/formatAddress';

import RoomList from './RoomList';

import EmptyHeart from '@assets/images/heart_empty.svg';
import FilledHeart from '@assets/images/heart_filled.svg';
import LeftArrow from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import Star from '@assets/images/star_white.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import PersonIcon from '@assets/images/person20_white.svg';

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
  {
    icon: WifiIcon,
    label: '무선인터넷',
    width: 26,
    height: 26,
    iconName: 'WIFI',
  },
  {
    icon: PetFriendlyIcon,
    label: '반려견동반',
    width: 24,
    height: 24,
    iconName: 'PET_FRIENDLY',
  },
  {
    icon: LuggageIcon,
    label: '짐보관',
    width: 24,
    height: 24,
    iconName: 'BAGGAGE_STORAGE',
  },
  {
    icon: LoungeIcon,
    label: '공용라운지',
    width: 28,
    height: 28,
    iconName: 'LOUNGE',
  },
];

const TAB_OPTIONS = ['객실', '소개', '이용규칙', '리뷰'];

// 안심번호 일 경우만 공개
const is050Number = phone => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('050');
};

const GuesthouseDetail = ({route}) => {
  const navigation = useNavigation();
  const {id, checkIn, checkOut, guestCount, isFromDeeplink, onLikeChange} =
    route.params;
  const [activeTab, setActiveTab] = useState('객실');
  const [detail, setDetail] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const rawImages = detail?.guesthouseImages ?? [];
  // 썸네일을 맨 앞으로 정렬한 이미지 리스트
  const sortedImages = [...rawImages].sort((a, b) =>
    a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
  );
  const hasImages = sortedImages.length > 0;
  const thumbnailImage = hasImages ? sortedImages[0].guesthouseImageUrl : null;
  const modalImages = sortedImages.map(img => ({
    id: img.id,
    imageUrl: img.guesthouseImageUrl,
  }));

  const {width: SCREEN_W} = Dimensions.get('window');
  const IMAGE_H = 280;

  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );
  const [imageIndex, setImageIndex] = useState(thumbnailIndex);
  useEffect(() => {
    // detail이 갱신되어 썸네일 위치가 달라져도 현재 인덱스를 맞춰줌
    setImageIndex(thumbnailIndex);
  }, [thumbnailIndex]);

  // 날짜, 인원 변경
  const [dateGuestModalVisible, setDateGuestModalVisible] = useState(false);
  // 화면 내부 표시/전달용 로컬 상태
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localAdults, setLocalAdults] = useState(
    typeof guestCount === 'number' ? Math.max(1, guestCount) : 1,
  );
  const [localChildren, setLocalChildren] = useState(0); // 기본 아이 0
  const [hasChanged, setHasChanged] = useState(false);

  // 게하 상세 정보 불러오기
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await userGuesthouseApi.getGuesthouseDetail({
          guesthouseId: id,
          checkIn,
          checkOut,
          guestCount,
        });
        const data = response.data;
        setDetail({
          ...data,
          isLiked: typeof data.isLiked === 'boolean' ? data.isLiked : !!data.isFavorite,
        });
      } catch (e) {
        console.warn('게스트하우스 상세 조회 실패', e);
      }
    };
    fetchDetail();
  }, [id]);

  const fetchDetailWith = async (ci, co, totalGuests) => {
    try {
      const res = await userGuesthouseApi.getGuesthouseDetail({
        guesthouseId: id,
        checkIn: dayjs(ci).format('YYYY-MM-DD'),
        checkOut: dayjs(co).format('YYYY-MM-DD'),
        guestCount: totalGuests,
      });
      const data = res.data;
      setDetail(prev => ({
        ...data,
        isLiked: typeof data.isLiked === 'boolean'
          ? data.isLiked
          : (typeof prev?.isLiked === 'boolean' ? prev.isLiked : !!data.isFavorite),
      }));
    } catch (e) {
      console.warn('게스트하우스 상세 재조회 실패', e);
    }
  };

  // 게하 좋아요, 좋아요 취소
  const handleToggleFavorite = async () => {
    const current = !!detail?.isLiked;
    const next = !current;
    try {
      await toggleFavorite({
        type: 'guesthouse',
        id,
        isLiked: current,
        setItem: setDetail,
      });
      onLikeChange?.(id, next);
    } catch (e) {
      console.warn('좋아요 토글 실패', e?.response?.data || e?.message);
    }
  };

  // 로딩처리
  if (!detail) {
    return <Loading title="게스트하우스를 불러오고 있어요" />;
  }

  //  공유 링크
  const handleCopyLink = () => {
    const deepLinkUrl = guesthouseDetailDeeplink(id);
    copyDeeplinkToClipboard(deepLinkUrl);

    Toast.show({
      type: 'success',
      text1: '복사되었어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // 객실 서비스
  const amenityNames = detail.amenities.map(a => a.amenityName);

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* 대표 이미지 */}
        {hasImages ? (
          <Carousel
            width={SCREEN_W}
            height={IMAGE_H}
            data={sortedImages}
            defaultIndex={thumbnailIndex} // 썸네일부터 시작
            loop={false}
            autoPlay={false}
            pagingEnabled
            onSnapToItem={idx => setImageIndex(idx)}
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setImageModalVisible(true)}>
                <Image
                  source={{uri: item.guesthouseImageUrl}}
                  style={styles.mainImage}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={[styles.mainImage, {backgroundColor: COLORS.grayscale_200}]}
          />
        )}

        <TouchableOpacity
          style={styles.backButton}
          // onPress={() => {
          //   console.log('isFromDeeplink:', isFromDeeplink);
          //   if (isFromDeeplink) {
          //     navigation.navigate('MainTabs', {
          //       screen: '게하',
          //       params: {
          //         screen: 'GuesthouseSearch',
          //       },
          //     });
          //   } else {
          //     navigation.goBack(); // 일반 뒤로가기
          //   }
          // }}
          onPress={() => {
            console.log('isFromDeeplink:', isFromDeeplink);
            if (isFromDeeplink) {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    state: {
                      routes: [
                        {
                          name: '게하',
                          state: {
                            routes: [{name: 'GuesthouseSearch'}],
                          },
                        },
                      ],
                    },
                  },
                ],
              });
            } else {
              // 변경된 값이 있으면 먼저 부모 콜백 호출
              if (
                hasChanged &&
                typeof route.params?.onDateGuestChange === 'function'
              ) {
                route.params.onDateGuestChange({
                  checkIn: localCheckIn,
                  checkOut: localCheckOut,
                  adults: localAdults,
                  children: localChildren,
                });
              }
              navigation.goBack(); // 일반 뒤로가기
            }
          }}>
          <LeftArrow width={28} height={28} />
        </TouchableOpacity>
        <View style={styles.tagContainer}>
          {detail.hashtags?.map((tag, index) => (
            <View key={tag.id || index} style={styles.tagBox}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tag.hashtag}
              </Text>
            </View>
          ))}
          <View style={styles.tagBox}>
            <Text style={[FONTS.fs_12_medium, styles.tagText]}>#</Text>
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
              <TouchableOpacity onPress={handleCopyLink}>
                <ShareIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleFavorite}>
                {detail?.isLiked ? (
                  <FilledHeart width={20} height={20} />
                ) : (
                  <EmptyHeart width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[FONTS.fs_14_regular, styles.address]}>
            {trimJejuPrefix(detail.guesthouseAddress)} {detail.guesthouseAddressDetail}
          </Text>

          {is050Number(detail.guesthousePhone) && (
            <Text style={[FONTS.fs_14_regular, styles.phone]}>
              숙소 문의 : {detail.guesthousePhone}
            </Text>
          )}

          <View style={[styles.reviewRow, {marginTop: 20}]}>
            <View style={styles.reviewBox}>
              <Star width={14} height={14} />
              <Text style={[FONTS.fs_12_medium, styles.rating]}>
                {detail.averageRating?.toFixed(1) ?? '0.0'}
              </Text>
              <Text style={styles.ratingDevide}>·</Text>
              <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
                {detail.reviewCount} 리뷰
              </Text>
            </View>
          </View>

          <View style={styles.shortIntroContainer}>
            <Text style={[FONTS.fs_14_regular, styles.shortIntroText]}>
              {detail.guesthouseShortIntro}
            </Text>
          </View>

          {/* 객실 서비스 */}
          <View style={styles.iconServiceContainer}>
            <View style={styles.iconServiceRowWithMore}>
              {serviceIcons.map(
                ({icon: Icon, label, width, height, iconName}, i) => {
                  const isEnabled = detail.amenities
                    .map(a => a.amenityName)
                    .includes(iconName);

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
                          !isEnabled && {color: COLORS.grayscale_400},
                        ]}>
                        {label}
                      </Text>
                    </View>
                  );
                },
              )}

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.iconWrapper}>
                <View style={styles.iconServiceWrapper}>
                  <RightChevron width={24} height={24} />
                </View>
                <Text style={[FONTS.fs_12_medium, styles.readMoreText]}>
                  더보기
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.devide} />

          <TouchableOpacity
            style={styles.displayDateGuestRow}
            onPress={() => setDateGuestModalVisible(true)}>
            <View style={styles.dateInfoContainer}>
              <CalendarIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
                {dayjs(localCheckIn).format('M.D ddd')} -{' '}
                {dayjs(localCheckOut).format('M.D ddd')}
              </Text>
            </View>
            <View style={styles.guestInfoContainer}>
              <PersonIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
                인원 {localAdults + localChildren}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 탭 메뉴 */}
        <View style={styles.tabMenuWrapper}>
          {TAB_OPTIONS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <View style={styles.tabButton}>
                <Text
                  style={[
                    FONTS.fs_14_semibold,
                    {
                      color:
                        activeTab === tab
                          ? COLORS.primary_blue
                          : COLORS.grayscale_800,
                    },
                  ]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === '객실' && (
          <RoomList
            detail={detail}
            localCheckIn={localCheckIn}
            localCheckOut={localCheckOut}
            localAdults={localAdults}
            localChildren={localChildren}
          />
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
            <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>
              이용 규칙
            </Text>
            <View style={styles.longTextContainer}>
              <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
                {detail.rules}
              </Text>
            </View>
          </View>
        )}

        {activeTab === '리뷰' && (
          <View style={styles.introductionContainer}>
            <View style={styles.reviewRowContainer}>
              <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>리뷰</Text>
              <View style={styles.reviewRow}>
                <View style={styles.reviewBoxBlue}>
                  <Star width={14} height={14} />
                  <Text style={[FONTS.fs_12_medium, styles.rating]}>
                    {detail.averageRating?.toFixed(1) ?? '0.0'}
                  </Text>
                  <Text style={styles.ratingDevide}>·</Text>
                  <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
                    {detail.reviewCount} 리뷰
                  </Text>
                </View>
              </View>
            </View>
            <GuesthouseReview
              guesthouseId={id}
              averageRating={detail.averageRating}
              totalCount={detail.reviewCount}
            />
          </View>
        )}
      </View>

      {/* 편의시설/서비스 모달 */}
      <ServiceInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAmenities={detail.amenities}
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

      {/* 날짜, 인원 모달 */}
      <DateGuestModal
        visible={dateGuestModalVisible}
        onClose={() => setDateGuestModalVisible(false)}
        onApply={(newCheckIn, newCheckOut, adults, children) => {
          setLocalCheckIn(dayjs(newCheckIn).format('YYYY-MM-DD'));
          setLocalCheckOut(dayjs(newCheckOut).format('YYYY-MM-DD'));
          setLocalAdults(adults);
          setLocalChildren(children);
          setHasChanged(true);
          setDateGuestModalVisible(false);

          fetchDetailWith(newCheckIn, newCheckOut, adults + children);
        }}
        initCheckInDate={dayjs(localCheckIn).format('YYYY-MM-DD')}
        initCheckOutDate={dayjs(localCheckOut).format('YYYY-MM-DD')}
        initAdultGuestCount={localAdults}
        initChildGuestCount={localChildren}
      />
    </ScrollView>
  );
};

export default GuesthouseDetail;
