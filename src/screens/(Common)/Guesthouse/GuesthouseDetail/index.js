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
import Clipboard from '@react-native-clipboard/clipboard';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
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
import useSwipeTabs from '@hooks/useSwipeTabs';
import {addRecentGuesthouse} from '@utils/recentGuesthouses';

import RoomList from './RoomList';
import ServiceInfoContent from './ServiceInfoContent';

import EmptyHeart from '@assets/images/heart_empty.svg';
import FilledHeart from '@assets/images/heart_filled.svg';
import LeftArrow from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import Star from '@assets/images/star_white.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import PersonIcon from '@assets/images/person20_white.svg';
import PeopleIcon from '@assets/images/people_gray.svg';
import MapPinIcon from '@assets/images/map_pin_fill_black.svg';
import RightChevronBlack from '@assets/images/chevron_right_black.svg';

const TAB_OPTIONS = [
  {key: 'room', label: '객실'},
  {key: 'intro', label: '소개'},
  {key: 'service', label: '시설/서비스'},
  {key: 'rule', label: '이용규칙'},
  {key: 'review', label: '리뷰'},
  {key: 'refund', label: '취소규정'},
];

// 안심번호 일 경우만 공개
const is050Number = phone => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('050');
};

const getDisplayRating = rating => {
  const ratingNumber = Number(rating);
  return Number.isFinite(ratingNumber) && ratingNumber > 0
    ? ratingNumber.toFixed(1)
    : null;
};

const formatTodayPartyTime = startDateTime => {
  const start = dayjs(startDateTime);

  if (!start.isValid()) {
    return '';
  }

  const meridiem = start.hour() < 12 ? '오전' : '오후';
  return `${start.format('M/D')} 오늘, ${meridiem} ${start.format('h:mm')}`;
};

const GuesthouseDetail = ({route}) => {
  const navigation = useNavigation();
  const {id, checkIn, checkOut, guestCount, isFromDeeplink, onLikeChange} =
    route.params;
  const [detail, setDetail] = useState(null);
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: TAB_OPTIONS,
    initialKey: 'room',
  });

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
        addRecentGuesthouse({...data, guesthouseId: id}).catch(error => {
          console.warn('최근 본 게하 저장 실패', error);
        });
      } catch (e) {
        console.warn('게스트하우스 상세 조회 실패', e);
      }
    };
    fetchDetail();
  }, [checkIn, checkOut, guestCount, id]);

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
      const success = await toggleFavorite({
        type: 'guesthouse',
        id,
        isLiked: current,
        setItem: setDetail,
      });
      if (success === false) {
        return;
      }
      addRecentGuesthouse({
        ...detail,
        guesthouseId: id,
        isLiked: next,
      }).catch(error => {
        console.warn('최근 본 게하 좋아요 저장 실패', error);
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

  const handlePressAddress = () => {
    navigation.navigate('GuesthouseLocationMap', {
      guesthouseName: detail?.guesthouseName,
      guesthouseAddress: [
        trimJejuPrefix(detail?.guesthouseAddress),
        detail?.guesthouseAddressDetail,
      ].filter(Boolean).join(' '),
      latitude: detail?.lat,
      longitude: detail?.lng,
    });
  };

  const handleCopyPhone = () => {
    Clipboard.setString(detail?.guesthousePhone ?? '');

    Toast.show({
      type: 'success',
      text1: '복사되었어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const refundPolicies = [...(detail?.refundPolicies ?? [])].sort(
    (a, b) => a.daysBeforeCheckin - b.daysBeforeCheckin,
  );
  const displayRating = getDisplayRating(detail.averageRating);
  const todayParties = Array.isArray(detail?.todayParties)
    ? detail.todayParties
    : [];

  const renderTodayParty = party => {
    const partyTime = formatTodayPartyTime(party.startDateTime);

    return (
      <TouchableOpacity
        key={String(party.partyId)}
        activeOpacity={1}
        style={styles.todayPartyCard}
        onPress={() => navigation.navigate('MeetDetail', {partyId: party.partyId})}
      >
        {party.partyImage ? (
          <Image source={{uri: party.partyImage}} style={styles.todayPartyImage} />
        ) : (
          <View style={styles.todayPartyImagePlaceholder}>
            <Text style={[FONTS.fs_12_medium, styles.todayPartyImageText]}>
              콘텐츠
            </Text>
          </View>
        )}

        <View style={styles.todayPartyInfo}>
          <View style={styles.todayPartyTopRow}>
            <View style={styles.todayPartyTitleWrapper}>
              <Text
                style={[FONTS.fs_14_semibold, styles.todayPartyTitle]}
                numberOfLines={2}
              >
                {party.partyTitle || '게스트하우스 콘텐츠'}
              </Text>
              <View style={styles.todayPartyPeopleRow}>
                <PeopleIcon width={12} height={12} />
                <Text style={[FONTS.fs_12_medium, styles.todayPartyPeopleText]}>
                  최대인원 {party.maxAttendees ?? 0}명
                </Text>
              </View>
            </View>
          </View>

          {!!partyTime && (
            <Text style={[FONTS.fs_14_medium, styles.todayPartyTime]}>
              {partyTime}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabContent = tabKey => {
    if (tabKey === 'room') {
      return (
        <RoomList
          detail={detail}
          guesthouseId={id}
          localCheckIn={localCheckIn}
          localCheckOut={localCheckOut}
          localAdults={localAdults}
          localChildren={localChildren}
        />
      );
    }

    if (tabKey === 'intro') {
      return (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>소개</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.guesthouseLongDesc}
            </Text>
          </View>
        </View>
      );
    }

    if (tabKey === 'rule') {
      return (
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>이용 규칙</Text>
          <View style={styles.longTextContainer}>
            <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
              {detail.rules}
            </Text>
          </View>
        </View>
      );
    }

    if (tabKey === 'service') {
      return <ServiceInfoContent selectedAmenities={detail.amenities} />;
    }

    if (tabKey === 'refund') {
      return (
        <View style={styles.introductionContainer}>
          {!!detail.refundPolicyAdditionalNotice && (
            <>
              <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>
                추가 안내사항
              </Text>
              <View style={styles.longTextContainer}>
                <Text style={[FONTS.fs_14_regular, styles.introductionText]}>
                  {detail.refundPolicyAdditionalNotice}
                </Text>
              </View>
            </>
          )}
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>취소 수수료</Text>
          {refundPolicies.length > 0 ? (
            <View style={styles.refundPolicyContainer}>
              {refundPolicies.map((policy, index) => (
                <View
                  key={`${policy.daysBeforeCheckin}-${index}`}
                  style={styles.refundPolicyRow}
                >
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    방문 {policy.daysBeforeCheckin}일 전
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    총금액의
                  </Text>
                  <Text style={[FONTS.fs_14_semibold, styles.refundRateText]}>
                    {policy.refundRate}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.refundPolicyText]}>
                    % 환불
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.refundEmptyBox}>
              <Text style={[FONTS.fs_14_regular, styles.refundEmptyText]}>
                등록된 취소규정이 없어요.
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.introductionContainer}>
        <View style={styles.reviewRowContainer}>
          <Text style={[FONTS.fs_18_semibold, styles.tabTitle]}>리뷰</Text>
          {displayRating && (
            <View style={styles.reviewRow}>
              <View style={styles.reviewBoxBlue}>
                <Star width={14} height={14} />
                <Text style={[FONTS.fs_12_medium, styles.rating]}>
                  {displayRating}
                </Text>
                <Text style={styles.ratingDevide}>·</Text>
                <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
                  {detail.reviewCount} 리뷰
                </Text>
              </View>
            </View>
          )}
        </View>
        <GuesthouseReview
          guesthouseId={id}
          averageRating={detail.averageRating}
          totalCount={detail.reviewCount}
        />
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
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
                activeOpacity={1}
                onPress={() => setImageModalVisible(true)}
              >
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
          activeOpacity={1}
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
            <View>
              <Text style={[FONTS.fs_20_semibold, styles.name]}>
                {detail.guesthouseName}
              </Text>
            </View>
            <View style={styles.topIcons}>
              <TouchableOpacity
                activeOpacity={1} onPress={handleCopyLink}>
                <ShareIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1} onPress={handleToggleFavorite}>
                {detail?.isLiked ? (
                  <FilledHeart width={20} height={20} />
                ) : (
                  <EmptyHeart width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={1}
            onPress={handlePressAddress}
            style={styles.addressSection}
          >
            <MapPinIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_regular, styles.address]}>
              {trimJejuPrefix(detail.guesthouseAddress)} {detail.guesthouseAddressDetail}
            </Text>
            <RightChevronBlack width={12} height={12}/>
          </TouchableOpacity>

          {is050Number(detail.guesthousePhone) && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleCopyPhone}
              style={styles.phoneButton}>
              <Text style={[FONTS.fs_14_regular, styles.phone]}>
                숙소 문의 : <Text style={styles.copyableText}>{detail.guesthousePhone}</Text>
              </Text>
            </TouchableOpacity>
          )}

          {displayRating && (
            <View style={[styles.reviewRow, {marginTop: 20}]}>
              <View style={styles.reviewBox}>
                <Star width={14} height={14} />
                <Text style={[FONTS.fs_12_medium, styles.rating]}>
                  {displayRating}
                </Text>
                <Text style={styles.ratingDevide}>·</Text>
                <Text style={[FONTS.fs_12_medium, styles.reviewCount]}>
                  {detail.reviewCount} 리뷰
                </Text>
              </View>
            </View>
          )}

          <View style={styles.shortIntroContainer}>
            <Text style={[FONTS.fs_14_regular, styles.shortIntroText]}>
              {detail.guesthouseShortIntro}
            </Text>
          </View>

          {todayParties.length > 0 && (
            <View style={styles.todayPartiesContainer}>
              <Text style={[FONTS.fs_16_semibold, styles.todayContentTitle]}>
                오늘의 콘텐츠
              </Text>
              <View style={styles.todayPartyList}>
                {todayParties.map(renderTodayParty)}
              </View>
            </View>
          )}

          <View style={styles.devide} />

          <TouchableOpacity
            activeOpacity={1}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabMenuWrapper}
          contentContainerStyle={styles.tabMenuContent}
        >
          {TAB_OPTIONS.map((tab, index) => (
            <TouchableOpacity
              activeOpacity={1} key={tab.key} onPress={() => onTabPress(index)}>
              <View style={styles.tabButton}>
                <Text
                  style={[
                    FONTS.fs_14_semibold,
                    {
                      color:
                        isActive(tab.key)
                          ? COLORS.primary_blue
                          : COLORS.grayscale_800,
                    },
                  ]}>
                  {tab.label}
                </Text>
                {isActive(tab.key) && <View style={styles.tabUnderline} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onLayout={onPagerLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          style={styles.tabPager}>
          {TAB_OPTIONS.map(tab => (
            <View
              key={tab.key}
              style={[styles.tabPage, pageWidth > 0 && {width: pageWidth}]}>
              {renderTabContent(tab.key)}
            </View>
          ))}
        </ScrollView>
      </View>

      </ScrollView>
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
      {dateGuestModalVisible && (
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
      )}
    </View>
  );
};

export default GuesthouseDetail;
