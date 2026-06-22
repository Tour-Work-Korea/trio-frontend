import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Carousel from 'react-native-reanimated-carousel';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';

dayjs.locale('ko');

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetDetail.styles';
import Avatar from '@components/Avatar';
import userMeetApi from '@utils/api/userMeetApi';
import { toggleFavorite } from '@utils/toggleFavorite';
import useUserStore from '@stores/userStore';
import { showErrorModal } from '@utils/loginModalHub';
import {
  partyDetailDeeplink,
  partyDetailShareUrl,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';
import {openAppOrStoreFromWeb} from '@utils/webOpenApp';
import useSwipeTabs from '@hooks/useSwipeTabs';
import MeetDetailInfoModal from '@components/modals/Meet/MeetDetailInfoModal';
import ImageModal from '@components/modals/ImageModal';
import {replaceWebPath} from '@web/navigation';
import {WEB_ROUTES} from '@web/routes';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_white.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import EmptyIcon from '@assets/images/meet_reservation_success.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import BellIcon from '@assets/images/warning_alarm_orange.svg';
import HomeIcon from '@assets/images/home_white_filled.svg';

const TABS = [
  { key: 'intro', label: '콘텐츠 소개' },
  { key: 'detail', label: '상세 안내' },
  { key: 'way', label: '오시는 길' },
];

const SNACK_TAG_LABEL = {
  PARTY_FOOD: '음식 제공',
  PARTY_ALCOHOL: '주류 제공',
  PARTY_INDIVIDUAL: '각자 준비',
  PARTY_TOGETHER: '같이 준비',
  PARTY_FREE: '자유',
};

const PARKING_TAG_LABEL = {
  PARTY_PARKING: '주차 가능',
  PARTY_GUESTHOUSE_PARKING: '전용 주차장',
  PARTY_PUBLIC_PARKING: '공용 주차장',
  PARTY_STREET_PARKING: '대로변 주차',
  PARTY_NO_PARKING: '주차 불가',
};

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_H = 280;
const TAB_CONTENT_HORIZONTAL_PADDING = 20;

const PARTY_STATUS_LABEL = {
  RECRUIT_BEFORE: '모집 예정',
  RECRUIT: '신청하기',
  RECRUIT_END: '모집 마감',
  PARTY_END: '종료된 파티',
  CANCELED: '취소된 파티',
  DELETED: '삭제된 파티',
};

const getPartyImageUrl = image =>
  image?.imageUrl
  ?? image?.partyImageUrl
  ?? image?.url
  ?? image?.adminImageUrl
  ?? image?.thumbnailUrl
  ?? null;

const toArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
};

const PartyEventImage = ({ uri, width }) => {
  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    if (!uri) {
      setAspectRatio(null);
      return;
    }

    let mounted = true;
    Image.getSize(
      uri,
      (imageWidth, imageHeight) => {
        if (mounted && imageWidth > 0 && imageHeight > 0) {
          setAspectRatio(imageWidth / imageHeight);
        }
      },
      () => {
        if (mounted) {
          setAspectRatio(null);
        }
      },
    );

    return () => {
      mounted = false;
    };
  }, [uri]);

  return (
    <Image
      source={{ uri }}
      style={[
        styles.eventImageBlog,
        {
          width,
          aspectRatio: aspectRatio || 1,
        },
      ]}
      resizeMode="cover"
    />
  );
};

const MeetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { partyId } = route.params ?? {};

  const navigateWebHome = useCallback(() => {
    replaceWebPath(WEB_ROUTES.HOME);
    navigation.navigate('MainTabs', {screen: '홈'});
  }, [navigation]);

  const navigateWebContents = useCallback(() => {
    replaceWebPath(WEB_ROUTES.CONTENTS);
    navigation.navigate('MainTabs', {
      screen: '콘텐츠',
      params: {
        screen: 'MeetMain',
      },
    });
  }, [navigation]);

  const [detail, setDetail] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // 모달
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState("tag"); // "tag" | "section"
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalTags, setInfoModalTags] = useState([]);
  const [infoModalContent, setInfoModalContent] = useState("");
  const [infoModalSections, setInfoModalSections] = useState([]);
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: 'intro',
  });

  const openTagModal = (title, tags, content) => {
    setInfoModalTitle(title);
    setInfoModalType("tag");
    setInfoModalTags(tags);
    setInfoModalContent(content);
    setInfoModalSections([]);
    setInfoModalVisible(true);
  };

  const openSectionModal = (title, sections) => {
    setInfoModalTitle(title);
    setInfoModalType("section");
    setInfoModalSections(sections);
    setInfoModalTags([]);
    setInfoModalContent("");
    setInfoModalVisible(true);
  };

  // 날짜 처리
  const formatTime = timeStr => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };

  // 콘텐츠 상세 데이터
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return undefined;
    }

    const handleBrowserBack = () => {
      setTimeout(
        route.params?.webBackToHome ? navigateWebHome : navigateWebContents,
        0,
      );
    };

    window.addEventListener('popstate', handleBrowserBack);

    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
    };
  }, [navigateWebContents, navigateWebHome, route.params?.webBackToHome]);

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const { data } = await userMeetApi.getPartyDetail(partyId);
        if (!mounted) return;
        setDetail(data);
        setLiked(!!data?.isLiked);
      } catch (e) {
        console.warn('getPartyDetail error', e?.response?.data || e?.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (partyId != null) fetchDetail();
    return () => {
      mounted = false;
    };
  }, [partyId]);

  const {
    guesthouseName,
    hostProfileImage,
    partyTitle,
    partyTags,
    partyAnnouncements,
    description,
    events,
    partySchedule,
    snackTags,
    snackInfo,
    rules,
    latitude,
    longitude,
    location,
    meetingPlace,
    trafficInfo,
    parkingTag,
    parkingPlace,
    // partyInfo,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
    partyStatus,
    isApplyOpen,
    amount, // 숙박객 남자
    maleNonAmount, // 비숙박객 남자
    partyImages,
    profileSummary,
  } = detail ?? {};

  // 썸네일/갤러리
  const sortedImages = useMemo(() => {
    return [...toArray(partyImages)]
      .map(img => ({
        ...img,
        imageUrl: getPartyImageUrl(img),
      }))
      .filter(img => !!img?.imageUrl)
      .sort((a, b) =>
        a.isThumbnail === b.isThumbnail ? 0 : a.isThumbnail ? -1 : 1,
      );
  }, [partyImages]);
  const hasImages = sortedImages.length > 0;
  const hideHeaderCarouselForImageModal =
    Platform.OS === 'android' && imageModalVisible;
  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );
  const modalImages = sortedImages;
  const thumbnailSource = useMemo(() => {
    if (sortedImages[thumbnailIndex]?.imageUrl) {
      return { uri: sortedImages[thumbnailIndex].imageUrl };
    }
    if (sortedImages[0]?.imageUrl) {
      return { uri: sortedImages[0].imageUrl };
    }
  }, [sortedImages, thumbnailIndex]);

  useEffect(() => {
    setImageIndex(thumbnailIndex);
  }, [thumbnailIndex]);

  const tagList = useMemo(() => {
    const tags = Array.isArray(partyTags) ? partyTags : `${partyTags ?? ''}`.split(/\s+/);
    return tags
      .map(tag => tag.trim())
      .map(tag => tag.replace(/^#+/, ''))
      .filter(Boolean)
      .filter(tag => tag !== '#');
  }, [partyTags]);

  const displayGuesthouseName =
    guesthouseName ?? profileSummary?.guesthouseName ?? '게스트하우스';
  const displayHostImage =
    hostProfileImage ?? profileSummary?.ownerProfileImageUrl;
  const eventList = useMemo(() => toArray(events), [events]);
  const ruleList = useMemo(() => toArray(rules), [rules]);
  const trafficInfoList = useMemo(() => toArray(trafficInfo), [trafficInfo]);
  const parkingPlaceList = useMemo(() => toArray(parkingPlace), [parkingPlace]);

  const scheduleText = useMemo(() => {
    const date = dayjs(partyStartDateTime);
    const dateLabel = date.isValid()
      ? `${date.format('MM.DD')} ${date.isSame(dayjs(), 'day') ? '오늘' : date.format('dd')
      }`
      : '-';
    return `${dateLabel} ${formatTime(partyStartTime)}~${formatTime(partyEndTime)}`;
  }, [partyStartDateTime, partyStartTime, partyEndTime]);
  const isRecruiting = partyStatus === 'RECRUIT';
  const showReservationButton = isApplyOpen !== false;
  const reservationButtonText = PARTY_STATUS_LABEL[partyStatus] ?? '신청하기';

  // 콘텐츠 좋아요 토글
  const onToggleLike = async () => {
    try {
      await toggleFavorite({
        type: 'party',
        id: detail?.partyId ?? partyId,
        isLiked: liked,
        setList: updater => {
          setLiked(prev => !prev);
        },
      });
    } catch (e) {
      console.warn('toggle like error', e?.response?.data || e?.message);
    }
  };

  //  공유 링크
  const handleCopyLink = () => {
    const shareUrl =
      Platform.OS === 'web'
        ? partyDetailShareUrl(partyId)
        : partyDetailDeeplink(partyId);

    copyDeeplinkToClipboard(shareUrl);

    Toast.show({
      type: 'success',
      text1: '복사되었어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const handlePressGuesthouse = () => {
    const guesthouseId = detail?.guesthouseId ?? detail?.guesthouse?.id ?? detail?.profileSummary?.guesthouseId;
    if (!guesthouseId) {
      return;
    }
    navigation.navigate('GuesthouseDetail', {
      id: guesthouseId,
      checkIn: dayjs().format('YYYY-MM-DD'),
      checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      guestCount: 1,
    });
  };

  const handlePressReservation = () => {
    if (!isRecruiting || !showReservationButton) {
      return;
    }

    if (openAppOrStoreFromWeb(partyDetailDeeplink(partyId))) {
      return;
    }

    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      showErrorModal({
        message: '콘텐츠는\n 로그인 후 사용해주세요',
        buttonText2: '취소',
        buttonText: '로그인하기',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => { },
      });
      return;
    }

    navigation.navigate('MeetReservation', {
      partyId,
      partyTitle,
      partyStartDateTime,
      partyStartTime,
      partyEndTime,
      amount,
      maleNonAmount,
      thumbnailUrl: thumbnailSource?.uri,
      partyAnnouncements,
    });
  };

  const handlePressBack = () => {
    if (Platform.OS === 'web') {
      if (route.params?.webBackToHome) {
        navigateWebHome();
        return;
      }

      navigateWebContents();
      return;
    }

    navigation.goBack();
  };

  // 음료 음식 태그
  const snackTagTexts = useMemo(() => {
    return toArray(snackTags)
      .map(tag => SNACK_TAG_LABEL[tag])
      ?.filter(Boolean); // 혹시 모를 undefined 제거
  }, [snackTags]);

  // 교통 정보 제목
  const trafficTitleLine = useMemo(() => {
    return trafficInfoList.map(t => t.title).filter(Boolean).join(' · ');
  }, [trafficInfoList]);

  // 주차 내용
  const parkingContentText = useMemo(() => {
    return parkingPlaceList
      .map(p => {
        if (typeof p === 'string') {
          return p;
        }
        return `• ${p.title ?? ''}\n${p.content ?? ''}`.trim();
      })
      .filter(Boolean)
      .join('\n\n');
  }, [parkingPlaceList]);

  // 주차 태그
  const parkingTagTexts = useMemo(() => {
    return toArray(parkingTag)
      .map(tag => PARKING_TAG_LABEL[tag])
      ?.filter(Boolean);
  }, [parkingTag]);
  const eventImageWidth = Math.max(
    (pageWidth || SCREEN_W) - TAB_CONTENT_HORIZONTAL_PADDING * 2,
    0,
  );
  const mapCoordinate = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  }, [latitude, longitude]);
  const mapCamera = useMemo(() => {
    if (!mapCoordinate) {
      return null;
    }

    return {
      ...mapCoordinate,
      zoom: 16,
    };
  }, [mapCoordinate]);
  const displayLocation = meetingPlace || location;

  const handlePressLocationMap = () => {
    if (!mapCoordinate) {
      return;
    }

    navigation.navigate('GuesthouseLocationMap', {
      guesthouseName: partyTitle || '오시는 길',
      guesthouseAddress: displayLocation,
      latitude: mapCoordinate.latitude,
      longitude: mapCoordinate.longitude,
    });
  };

  const renderLocationMap = () => {
    if (!mapCoordinate || !mapCamera) {
      return null;
    }

    return (
      <View style={styles.locationMapContainer}>
        <NaverMapView
          style={styles.locationMap}
          initialCamera={mapCamera}
          onTapMap={handlePressLocationMap}
          isScrollGesturesEnabled={false}
          isZoomGesturesEnabled={false}
          isRotateGesturesEnabled={false}
          isTiltGesturesEnabled={false}>
          <NaverMapMarkerOverlay
            latitude={mapCoordinate.latitude}
            longitude={mapCoordinate.longitude}
            width={44}
            height={56}
            anchor={{x: 0.5, y: 1}}
            onTap={handlePressLocationMap}>
            <View
              collapsable={false}
              style={styles.markerContainer}>
              <View style={styles.homeMarker}>
                <HomeIcon width={24} height={24} />
              </View>
              <View style={styles.markerTail} />
            </View>
          </NaverMapMarkerOverlay>
        </NaverMapView>
      </View>
    );
  };

  // 빈 값일때
  const renderEmptyInfo = () => (
    <View style={styles.emptyContainer}>
      <EmptyIcon style={styles.emptyIcon} />
      <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
        더 궁금하신 점은 업체로 문의해 주세요
      </Text>
    </View>
  );

  // 오시는길 값 유무
  const isEmptyWayInfo =
    !displayLocation &&
    !(trafficInfoList.length > 0) &&
    !parkingContentText;

  const renderTabContent = tabKey => {
    if (tabKey === 'intro') {
      return (
        <View style={styles.tabContent}>
          {eventList.length === 0 ? (
            renderEmptyInfo()
          ) : (
            eventList.map((ev, evIndex) => {
              const images = toArray(ev.partyEventImageUrls);

              return (
                <View key={ev.id ?? evIndex} style={styles.eventBlock}>
                  {images.length > 0 && (
                    <ScrollView
                      horizontal
                      nestedScrollEnabled
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.eventImageRow}>
                      {images.map((url, idx) => (
                        <PartyEventImage
                          key={`${ev.id ?? evIndex}-${idx}`}
                          uri={url}
                          width={eventImageWidth}
                        />
                      ))}
                    </ScrollView>
                  )}
                  <Text style={[FONTS.fs_18_semibold, styles.eventTitle]}>
                    {ev.eventName}
                  </Text>
                  {!!ev.eventDescription && (
                    <Text style={[FONTS.fs_16_regular, styles.eventBody]}>
                      {ev.eventDescription}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      );
    }

    if (tabKey === 'detail') {
      return (
        <View style={styles.tabContent}>
          <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>일정</Text>
          <View style={styles.infoTextContainer}>
            <Text style={[FONTS.fs_16_regular, styles.infoText]}>
              {partySchedule}
            </Text>
          </View>
          {!!snackInfo && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>음식 • 음료</Text>
              {snackTagTexts.length > 0 && (
                <View style={styles.tagChipRow}>
                  {snackTagTexts.map((tag, idx) => (
                    <View key={idx} style={styles.tagChip}>
                      <Text style={[FONTS.fs_12_medium, styles.tagChipText]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={[FONTS.fs_14_regular, styles.detailContentText]}>
                {snackInfo}
              </Text>
            </View>
          )}
          {ruleList.length > 0 && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>이용규칙</Text>
              <View style={styles.ruleList}>
                {ruleList.map((rule, index) => (
                  <View key={rule.id ?? `${rule.title ?? 'rule'}-${index}`} style={styles.ruleItem}>
                    {!!rule.title && (
                      <Text style={[FONTS.fs_14_semibold, styles.ruleTitle]}>
                        {rule.title}
                      </Text>
                    )}
                    {!!rule.content && (
                      <Text style={[FONTS.fs_14_regular, styles.ruleContent]}>
                        {rule.content}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {isEmptyWayInfo ? (
          <>
            {renderLocationMap()}
            {renderEmptyInfo()}
          </>
        ) : (
          <>
            <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>위치</Text>
            {!!displayLocation && (
              <Text style={[FONTS.fs_16_regular, styles.infoText]}>
                만나는 장소 : {displayLocation}
              </Text>
            )}
            {renderLocationMap()}
            {trafficInfoList.length > 0 && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>교통 정보</Text>
                <View style={styles.detailInfoText}>
                  <View style={styles.tagWrapper}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.tagText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {trafficTitleLine}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.detailInfoBtn}
                    onPress={() =>
                      openSectionModal(
                        '교통 정보',
                        trafficInfoList.map(it => ({
                          subtitle: it.title,
                          body: it.content,
                        })),
                      )
                    }>
                    <Text
                      style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      내용 확인하기
                    </Text>
                    <ChevronRight width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {!!parkingContentText && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>주차 정보</Text>
                <View style={styles.detailInfoText}>
                  <View style={styles.tagWrapper}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.tagText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {parkingTagTexts?.map(t => `#${t}`).join('  ')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.detailInfoBtn}
                    onPress={() =>
                      openTagModal(
                        '주차 정보',
                        parkingTagTexts?.map(t => `#${t}`),
                        parkingContentText,
                      )
                    }>
                    <Text
                      style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      내용 확인하기
                    </Text>
                    <ChevronRight width={16} height={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading && !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          {hasImages && Platform.OS === 'web' ? (
            <TouchableOpacity
              style={styles.thumbnail}
              activeOpacity={1}
              onPress={() => setImageModalVisible(true)}>
              <Image
                source={{ uri: sortedImages[thumbnailIndex]?.imageUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : hasImages && !hideHeaderCarouselForImageModal ? (
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
                  style={styles.thumbnail}
                  activeOpacity={1}
                  onPress={() => setImageModalVisible(true)}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.thumbnail} />
          )}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.backButton}
              onPress={handlePressBack}>
              <ChevronLeft width={28} height={28} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1} style={styles.shareButton} onPress={handleCopyLink}>
              <ShareIcon width={20} height={20} />
            </TouchableOpacity>
            {tagList.length > 0 && (
              <View style={styles.heroTagRow}>
                {tagList.map(tag => (
                  <View key={tag} style={styles.heroTagChip}>
                    <Text style={[FONTS.fs_12_medium, styles.heroTagText]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                <View style={styles.heroTagChip}>
                  <Text style={[FONTS.fs_12_medium, styles.heroTagText]}>#</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 본문 */}
        <View style={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePressGuesthouse}
              style={styles.guesthousePressArea}
            >
              <Avatar uri={displayHostImage} size={40} iconSize={16} style={styles.summaryAvatar} />
              <Text style={[FONTS.fs_16_semibold, styles.summaryGuesthouseName]}>
                {displayGuesthouseName}
              </Text>
            </TouchableOpacity>
            <Text
              style={[FONTS.fs_20_semibold, styles.titleText]}
              numberOfLines={2}
              ellipsizeMode="tail">
              {partyTitle}
            </Text>
          </View>

          <View style={styles.scheduleBar}>
            <CalendarIcon width={18} height={18} />
            <Text style={[FONTS.fs_14_regular, styles.scheduleText]}>
              {scheduleText}
            </Text>
          </View>

          {/* 설명 */}
          {!!description && (
            <View style={styles.descriptionContainer}>
              <Text style={[FONTS.fs_14_regular, styles.description]}>
                {description}
              </Text>
            </View>
          )}

          {/* 하단 탭 */}
          <View style={styles.tabContainer}>
            {TABS.map((tab, index) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive(tab.key) && styles.tabButtonActive,
                ]}
                onPress={() => onTabPress(index)}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.tabText,
                    isActive(tab.key) && styles.tabTextActive,
                    isActive(tab.key) && FONTS.fs_14_semibold,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
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
            {TABS.map(tab => (
              <View
                key={tab.key}
                style={[styles.tabPage, pageWidth > 0 && { width: pageWidth }]}>
                {renderTabContent(tab.key)}
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {isRecruiting && showReservationButton && (
        <View style={styles.fixedNotice}>
          <BellIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.fixedNoticeText]}>
            게스트하우스 파티는 당일에만 신청이 가능해요!
          </Text>
        </View>
      )}

      {/* 하단 고정 영역 */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          activeOpacity={1} style={styles.bottomLikeButton} onPress={onToggleLike}>
          {liked ? (
            <HeartFilled width={28} height={28} />
          ) : (
            <HeartEmpty width={28} height={28} />
          )}
        </TouchableOpacity>

        {showReservationButton && (
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.bottomButton,
              !isRecruiting && styles.bottomButtonDisabled,
            ]}
            disabled={!isRecruiting}
            onPress={handlePressReservation}>
            <Text style={[FONTS.fs_16_semibold, { color: COLORS.grayscale_0 }]}>
              {reservationButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 모달 */}
      <MeetDetailInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalTitle}
        type={infoModalType}
        tags={infoModalTags}
        content={infoModalContent}
        sections={infoModalSections}
      />
      {hasImages && (
        <ImageModal
          visible={imageModalVisible}
          images={modalImages}
          selectedImageIndex={imageIndex}
          onClose={() => setImageModalVisible(false)}
        />
      )}
    </View>
  );
};

export default MeetDetail;
