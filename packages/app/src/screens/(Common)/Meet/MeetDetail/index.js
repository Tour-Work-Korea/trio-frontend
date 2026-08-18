import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Carousel from 'react-native-reanimated-carousel';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';

dayjs.locale('ko');

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import styles from './MeetDetail.styles';
import Avatar from '@components/Avatar';
import AppImage from '@components/AppImage';
import userMeetApi from '@utils/api/userMeetApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {trimJejuPrefix} from '@utils/formatAddress';
import {
  partyDetailDeeplink,
  partyDetailShareUrl,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';
import {openAppOrStoreFromWeb} from '@utils/webOpenApp';
import useSwipeTabs from '@hooks/useSwipeTabs';
import ImageModal from '@components/modals/ImageModal';
import PartyApplicationAppPromptModal from '@components/modals/PartyApplicationAppPromptModal';
import {replaceWebPath} from '@web/navigation';
import {WEB_ROUTES} from '@web/routes';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_white.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import EmptyIcon from '@assets/images/meet_reservation_success.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import BellIcon from '@assets/images/warning_alarm_orange.svg';
import HomeIcon from '@assets/images/home_white_filled.svg';
import PartyInfoCategoryIcon from '@assets/images/party_info_category.svg';
import PartyInfoCapacityIcon from '@assets/images/party_info_capacity.svg';
import PartyInfoPriceIcon from '@assets/images/party_info_price.svg';
import PartyInfoEligibilityIcon from '@assets/images/party_info_eligibility.svg';
import ChevroRight from '@assets/images/chevron_right_blue.svg';

const TABS = [
  {key: 'intro', label: '콘텐츠 소개'},
  {key: 'detail', label: '상세 안내'},
  {key: 'way', label: '오시는 길'},
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

const CONTENT_TYPE_LABEL = {
  POTLUCK: '포틀럭',
  DINNER_PARTY: '디너파티',
  BOOK: '독서',
  WALK: '산책',
};

const {width: SCREEN_W} = Dimensions.get('window');
const IMAGE_H = 280;
const TAB_CONTENT_HORIZONTAL_PADDING = 20;

const PARTY_STATUS_LABEL = {
  RECRUIT_BEFORE: '모집 예정',
  RECRUIT: '신청하기',
  RECRUIT_END: '모집 마감',
  RECRUIT_BLOCK: '따로 문의해 주세요',
  PARTY_END: '종료된 파티',
  CANCELED: '취소된 파티',
  DELETED: '삭제된 파티',
};

const UNKNOWN_PARTY_STATUS_NOTICE =
  '파티 상태를 확인할 수 없어요. 업체로 문의해 주세요';
const NO_RECRUIT_NOTICE = '신청은 업체로 문의해주세요';

const isPartyDateOpen = option =>
  option?.partyStatus === 'RECRUIT' &&
  option?.isApplyOpen !== false &&
  option?.isClosed !== true &&
  dayjs(option?.partyStartDateTime).isAfter(dayjs());

const getPartyDateStatusLabel = option => {
  if (isPartyDateOpen(option)) {
    return '신청 가능';
  }

  const statusLabel = {
    CANCELED: '취소',
    DELETED: '삭제',
    PARTY_END: '종료',
    RECRUIT_BEFORE: '모집 예정',
    RECRUIT_BLOCK: '문의',
    RECRUIT_END: '마감',
  }[option?.partyStatus];

  if (statusLabel) {
    return statusLabel;
  }

  const startDateTime = dayjs(option?.partyStartDateTime);
  if (startDateTime.isValid() && !startDateTime.isAfter(dayjs())) {
    return '마감';
  }

  if (
    option?.isClosed === true ||
    option?.isApplyOpen === false ||
    Number(option?.numOfAttendance) >= Number(option?.maxAttendance)
  ) {
    return '마감';
  }

  return '신청 불가';
};

const getPartyImageUrl = image =>
  image?.imageUrl ??
  image?.partyImageUrl ??
  image?.url ??
  image?.adminImageUrl ??
  image?.thumbnailUrl ??
  null;

const toArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
};

const PartyEventImage = ({uri, width}) => {
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
    <AppImage
      uri={uri}
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
  const {partyId} = route.params ?? {};

  const navigateWebHome = useCallback(() => {
    replaceWebPath(WEB_ROUTES.HOME);
    navigation.navigate('MainTabs', {screen: '홈'});
  }, [navigation]);

  const [detail, setDetail] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [appPromptVisible, setAppPromptVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageSourceRect, setImageSourceRect] = useState(null);
  const [selectedPartyDateId, setSelectedPartyDateId] = useState(null);
  const headerCarouselRef = useRef(null);
  const imageSourceRefs = useRef(new Map());
  const measureImageSource = useCallback(index => {
    const target = imageSourceRefs.current.get(index);
    if (!target) {
      return;
    }

    if (Platform.OS === 'web' && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setImageSourceRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        imageIndex: index,
      });
      return;
    }

    target.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setImageSourceRect({x, y, width, height, imageIndex: index});
      }
    });
  }, []);
  const syncHeaderImageIndex = useCallback(
    index => {
      setImageIndex(index);
      headerCarouselRef.current?.scrollTo({index, animated: false});
      requestAnimationFrame(() => measureImageSource(index));
    },
    [measureImageSource],
  );
  const openImageModal = useCallback(
    index => {
      setImageIndex(index);
      setImageSourceRect(null);
      setImageModalVisible(true);
      requestAnimationFrame(() => measureImageSource(index));
    },
    [measureImageSource],
  );

  const [renderedTabs, setRenderedTabs] = useState(
    () => new Set([TABS[0].key]),
  );
  const {
    pagerRef,
    activeKey,
    isActive,
    onTabPress,
    pageWidth,
    swipeEnabled,
    onPagerLayout,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    webSwipeHandlers,
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: 'intro',
  });

  useEffect(() => {
    setRenderedTabs(prev => {
      if (prev.has(activeKey)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(activeKey);
      return next;
    });
  }, [activeKey]);

  // 날짜 처리
  const formatTime = timeStr => {
    if (!timeStr) {
      return '시간 없음';
    }

    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };

  // 콘텐츠 상세 데이터
  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const {data} = await userMeetApi.getPartyDetail(partyId);
        if (!mounted) {
          return;
        }

        setDetail(data);
        setLiked(!!data?.isLiked);
      } catch (e) {
        console.warn('getPartyDetail error', e?.response?.data || e?.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    if (partyId != null) {
      fetchDetail();
    }

    return () => {
      mounted = false;
    };
  }, [partyId]);

  const {
    guesthouseAddress,
    guesthouseName,
    guesthousePhone,
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
    applicationType,
    partyStatus,
    isApplyOpen,
    contentType,
    chargeType,
    isGuest,
    maxAttendance,
    amount, // 숙박객 남자
    femaleAmount,
    maleNonAmount, // 비숙박객 남자
    femaleNonAmount,
    partyImages,
    profileSummary,
  } = detail ?? {};

  const partyDateOptions = useMemo(() => {
    const list =
      applicationType === 'ADVANCE'
        ? Array.isArray(detail?.applicationStatuses)
          ? detail.applicationStatuses
          : []
        : [detail].filter(Boolean);

    return list
      .map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `${item}-${index}`,
            partyStartDateTime: item,
            partyStartTime,
            partyEndTime,
            partyId,
          };
        }

        return {
          id:
            item?.partyId ?? item?.id ?? `${item?.partyStartDateTime ?? index}`,
          partyId: item?.partyId ?? item?.id ?? partyId,
          partyStartDateTime:
            item?.partyStartDateTime ??
            item?.startDateTime ??
            item?.dateTime ??
            item?.date ??
            partyStartDateTime,
          partyStartTime:
            item?.partyStartTime ?? item?.startTime ?? partyStartTime,
          partyEndTime:
            item?.partyEndDateTime ??
            item?.partyEndTime ??
            item?.endTime ??
            partyEndTime,
          partyStatus: item?.partyStatus ?? item?.status ?? partyStatus,
          isApplyOpen: item?.isApplyOpen ?? isApplyOpen,
          isClosed: item?.isClosed ?? false,
          numOfAttendance: item?.numOfAttendance,
          maxAttendance: item?.maxAttendance,
        };
      })
      .filter(item => !!item.partyStartDateTime);
  }, [
    applicationType,
    detail,
    isApplyOpen,
    partyEndTime,
    partyId,
    partyStartDateTime,
    partyStartTime,
    partyStatus,
  ]);
  const firstOpenPartyDate =
    partyDateOptions.find(isPartyDateOpen) ?? partyDateOptions[0];
  const selectedPartyDate =
    partyDateOptions.find(option => option.id === selectedPartyDateId) ??
    firstOpenPartyDate;

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
  const thumbnailIndex = Math.max(
    sortedImages.findIndex(i => i?.isThumbnail),
    0,
  );
  const modalImages = sortedImages;
  const thumbnailSource = useMemo(() => {
    if (sortedImages[thumbnailIndex]?.imageUrl) {
      return {uri: sortedImages[thumbnailIndex].imageUrl};
    }
    if (sortedImages[0]?.imageUrl) {
      return {uri: sortedImages[0].imageUrl};
    }
  }, [sortedImages, thumbnailIndex]);

  useEffect(() => {
    setImageIndex(thumbnailIndex);
  }, [thumbnailIndex]);

  const tagList = useMemo(() => {
    const tags = Array.isArray(partyTags)
      ? partyTags
      : `${partyTags ?? ''}`.split(/\s+/);
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
    const primaryDateTime =
      selectedPartyDate?.partyStartDateTime ?? partyStartDateTime;
    const date = dayjs(primaryDateTime);
    const dateLabel = date.isValid()
      ? `${date.format('MM.DD')} ${
          date.isSame(dayjs(), 'day') ? '오늘' : date.format('dd')
        }`
      : '-';
    const timeLabel = `${formatTime(
      selectedPartyDate?.partyStartTime ?? primaryDateTime ?? partyStartTime,
    )}~${formatTime(selectedPartyDate?.partyEndTime ?? partyEndTime)}`;

    return `${dateLabel} ${timeLabel}`;
  }, [
    selectedPartyDate,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
  ]);
  const openAdvanceDate =
    applicationType === 'ADVANCE'
      ? selectedPartyDate
      : null;
  const effectivePartyStatus = openAdvanceDate
    ? isPartyDateOpen(openAdvanceDate)
      ? 'RECRUIT'
      : openAdvanceDate?.partyStatus === 'RECRUIT'
        ? 'RECRUIT_END'
        : openAdvanceDate?.partyStatus
    : partyStatus;
  const effectiveIsApplyOpen = openAdvanceDate
    ? isPartyDateOpen(openAdvanceDate)
    : isApplyOpen;
  const isNoRecruit = effectivePartyStatus === 'NO_RECRUIT';
  const isKnownPartyStatus = PARTY_STATUS_LABEL[effectivePartyStatus] != null;
  const hasRecognizedPartyStatus = isKnownPartyStatus || isNoRecruit;
  const isRecruiting =
    effectivePartyStatus === 'RECRUIT' && effectiveIsApplyOpen !== false;
  const showReservationButton = isKnownPartyStatus && !isNoRecruit;
  const isSameDayApplication = applicationType === 'SAME_DAY';
  const isAdvanceApplication = applicationType === 'ADVANCE';
  const showPartyDateSelector =
    showReservationButton &&
    isAdvanceApplication &&
    partyDateOptions.length > 0;
  const selectedStartDateTime = dayjs(
    selectedPartyDate?.partyStartDateTime ?? partyStartDateTime,
  );
  const hasApplicationEnded =
    (isSameDayApplication || isAdvanceApplication) &&
    selectedStartDateTime.isValid() &&
    !selectedStartDateTime.isAfter(dayjs());
  const canApply = isRecruiting && !hasApplicationEnded;
  const applicationNoticeText = isSameDayApplication
    ? '이 콘텐츠는 당일에만 신청할 수 있어요!'
    : isAdvanceApplication
    ? '이 파티는 진행일 7일 전부터 참여 신청이 가능해요!'
    : '';
  const reservationButtonText =
    hasApplicationEnded
      ? '신청 마감'
      : effectivePartyStatus === 'RECRUIT_BLOCK'
      ? '따로 문의해 주세요'
      : PARTY_STATUS_LABEL[effectivePartyStatus];
  const infoPriceText = useMemo(() => {
    if (chargeType === 'FREE') {
      return '무료';
    }

    const prices = [amount, femaleAmount, maleNonAmount, femaleNonAmount]
      .map(Number)
      .filter(price => Number.isFinite(price) && price > 0);

    if (prices.length === 0) {
      return '무료';
    }

    return `${Math.min(...prices).toLocaleString()}원`;
  }, [amount, chargeType, femaleAmount, femaleNonAmount, maleNonAmount]);
  const detailInfoItems = useMemo(
    () => [
      {
        key: 'category',
        Icon: PartyInfoCategoryIcon,
        text: CONTENT_TYPE_LABEL[contentType] ?? '콘텐츠',
      },
      {
        key: 'capacity',
        Icon: PartyInfoCapacityIcon,
        text: maxAttendance
          ? `최대인원 ${maxAttendance}명`
          : '최대인원 정보 없음',
      },
      {
        key: 'price',
        Icon: PartyInfoPriceIcon,
        text: infoPriceText,
      },
      {
        key: 'eligibility',
        Icon: PartyInfoEligibilityIcon,
        text: isGuest ? '숙박객 전용' : '누구나 참여 가능',
      },
    ],
    [contentType, infoPriceText, isGuest, maxAttendance],
  );

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

  const handleCopyGuesthousePhone = useCallback(() => {
    const phone = guesthousePhone?.trim();
    if (!phone) {
      return;
    }

    Clipboard.setString(phone);
    Toast.show({
      type: 'success',
      text1: '전화번호를 복사했어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  }, [guesthousePhone]);

  const handlePressGuesthouse = () => {
    const guesthouseId =
      detail?.guesthouseId ??
      detail?.guesthouse?.id ??
      detail?.profileSummary?.guesthouseId;
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
    if (!canApply) {
      return;
    }

    if (Platform.OS === 'web') {
      setAppPromptVisible(true);
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
        onPress2: () => {},
      });
      return;
    }

    navigation.navigate('MeetReservation', {
      partyId: selectedPartyDate?.partyId ?? partyId,
      partyTitle,
      partyStartDateTime:
        selectedPartyDate?.partyStartDateTime ?? partyStartDateTime,
      partyStartTime:
        selectedPartyDate?.partyStartTime ??
        selectedPartyDate?.partyStartDateTime ??
        partyStartTime,
      partyEndTime: selectedPartyDate?.partyEndTime ?? partyEndTime,
      applicationType,
      partyDateOptions,
      amount,
      maleNonAmount,
      thumbnailUrl: thumbnailSource?.uri,
      partyAnnouncements,
      guesthousePhone,
    });
  };

  const handlePressBack = () => {
    if (Platform.OS === 'web' && route.params?.webBackToHome) {
      navigateWebHome();
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
  const displayLocation = trimJejuPrefix(meetingPlace || location);
  const displayGuesthouseAddress = trimJejuPrefix(
    guesthouseAddress || location,
  );
  const guesthouseId =
    detail?.guesthouseId ??
    detail?.guesthouse?.id ??
    detail?.profileSummary?.guesthouseId;

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
    if (Platform.OS === 'web' && activeKey !== 'way') {
      return null;
    }

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
            <View collapsable={false} style={styles.markerContainer}>
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

  const renderGuesthouseLink = () => (
    <View style={styles.guesthouseLinkCard}>
      <View style={styles.guesthouseLinkTopRow}>
        <View style={styles.guesthouseLinkTitleBox}>
          <Text
            style={styles.guesthouseLinkTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {displayGuesthouseName}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.guesthouseLinkActionButton}
          onPress={handlePressGuesthouse}
          disabled={!guesthouseId}>
          <Text style={styles.guesthouseLinkAction}>게하 보러가기</Text>
          <ChevroRight width={14} height={14} />
        </TouchableOpacity>
      </View>
      {!!displayGuesthouseAddress && (
        <Text
          style={styles.guesthouseLinkAddress}
          numberOfLines={1}
          ellipsizeMode="tail">
          {displayGuesthouseAddress}
        </Text>
      )}
    </View>
  );

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
    !displayLocation && !(trafficInfoList.length > 0) && !parkingContentText;

  const renderTabContent = tabKey => {
    if (tabKey === 'intro') {
      return (
        <View style={styles.tabContent}>
          {eventList.length === 0
            ? renderEmptyInfo()
            : eventList.map((ev, evIndex) => {
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
              })}
        </View>
      );
    }

    if (tabKey === 'detail') {
      return (
        <View style={styles.tabContent}>
          <View style={styles.partyInfoSummary}>
            <Text style={[FONTS.fs_20_bold, styles.partyInfoSummaryTitle]}>
              안내사항
            </Text>
            <Text
              style={[FONTS.fs_14_regular, styles.partyInfoSummarySubTitle]}>
              자세한 정보를 알려드릴게요
            </Text>
            <View style={styles.partyInfoSummaryList}>
              {detailInfoItems.map(({key, Icon, text}) => (
                <View key={key} style={styles.partyInfoSummaryRow}>
                  <Icon width={16} height={16} />
                  <Text
                    style={[FONTS.fs_14_medium, styles.partyInfoSummaryText]}>
                    {text}
                  </Text>
                </View>
              ))}
              {!!guesthousePhone?.trim() && (
                <View style={styles.partyInfoPhoneRow}>
                  <Text
                    style={[FONTS.fs_14_medium, styles.partyInfoPhoneLabel]}>
                    문의하기
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCopyGuesthousePhone}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.partyInfoPhoneNumber,
                      ]}>
                      {guesthousePhone}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>일정</Text>
          <View style={styles.infoTextContainer}>
            <Text style={[FONTS.fs_16_regular, styles.infoText]}>
              {partySchedule}
            </Text>
          </View>
          {!!snackInfo && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                음식 • 음료
              </Text>
              {snackTagTexts.length > 0 && (
                <View style={styles.tagChipRow}>
                  {snackTagTexts.map((tag, idx) => (
                    <View key={idx} style={styles.tagChip}>
                      <Text style={[FONTS.fs_12_medium, styles.tagChipText]}>
                        {tag}
                      </Text>
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
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                이용규칙
              </Text>
              <View style={styles.ruleList}>
                {ruleList.map((rule, index) => (
                  <View
                    key={rule.id ?? `${rule.title ?? 'rule'}-${index}`}
                    style={styles.ruleItem}>
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
            {renderGuesthouseLink()}
            {renderEmptyInfo()}
          </>
        ) : (
          <>
            <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>
              위치
            </Text>
            {!!displayLocation && (
              <Text style={[FONTS.fs_16_regular, styles.infoText]}>
                만나는 장소 : {displayLocation}
              </Text>
            )}
            {renderLocationMap()}
            {renderGuesthouseLink()}
            {trafficInfoList.length > 0 && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                  교통 정보
                </Text>
                <View style={styles.ruleList}>
                  {trafficInfoList.map((item, index) => {
                    if (typeof item === 'string') {
                      return (
                        <Text
                          key={`${item}-${index}`}
                          style={[
                            FONTS.fs_14_regular,
                            styles.detailContentText,
                          ]}>
                          {item}
                        </Text>
                      );
                    }

                    return (
                      <View
                        key={item.id ?? `${item.title ?? 'traffic'}-${index}`}
                        style={styles.ruleItem}>
                        {!!item.title && (
                          <Text
                            style={[FONTS.fs_14_semibold, styles.ruleTitle]}>
                            {item.title}
                          </Text>
                        )}
                        {!!item.content && (
                          <Text
                            style={[FONTS.fs_14_regular, styles.ruleContent]}>
                            {item.content}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {!!parkingContentText && (
              <View style={styles.detailInfoContainer}>
                <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>
                  주차 정보
                </Text>
                {parkingTagTexts.length > 0 && (
                  <View style={styles.tagChipRow}>
                    {parkingTagTexts.map((tag, idx) => (
                      <View key={idx} style={styles.tagChip}>
                        <Text style={[FONTS.fs_12_medium, styles.tagChipText]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.ruleList}>
                  {parkingPlaceList.map((item, index) => {
                    if (typeof item === 'string') {
                      return (
                        <Text
                          key={`${item}-${index}`}
                          style={[
                            FONTS.fs_14_regular,
                            styles.detailContentText,
                          ]}>
                          {item}
                        </Text>
                      );
                    }

                    return (
                      <View
                        key={item.id ?? `${item.title ?? 'parking'}-${index}`}
                        style={styles.ruleItem}>
                        {!!item.title && (
                          <Text
                            style={[FONTS.fs_14_semibold, styles.ruleTitle]}>
                            {item.title}
                          </Text>
                        )}
                        {!!item.content && (
                          <Text
                            style={[FONTS.fs_14_regular, styles.ruleContent]}>
                            {item.content}
                          </Text>
                        )}
                      </View>
                    );
                  })}
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
              ref={node => {
                if (node) {
                  imageSourceRefs.current.set(imageIndex, node);
                } else {
                  imageSourceRefs.current.delete(imageIndex);
                }
              }}
              style={styles.thumbnail}
              activeOpacity={1}
              onPress={() => openImageModal(imageIndex)}>
              <AppImage
                uri={sortedImages[imageIndex]?.imageUrl}
                style={[styles.thumbnail, imageModalVisible && {opacity: 0}]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : hasImages ? (
            <Carousel
              ref={headerCarouselRef}
              width={SCREEN_W}
              height={IMAGE_H}
              data={sortedImages}
              defaultIndex={thumbnailIndex}
              loop={false}
              autoPlay={false}
              pagingEnabled
              onSnapToItem={idx => setImageIndex(idx)}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  ref={node => {
                    if (node) {
                      imageSourceRefs.current.set(index, node);
                    } else {
                      imageSourceRefs.current.delete(index);
                    }
                  }}
                  style={styles.thumbnail}
                  activeOpacity={1}
                  onPress={() => openImageModal(index)}>
                  <AppImage
                    uri={item.imageUrl}
                    style={[
                      styles.thumbnail,
                      imageModalVisible && imageIndex === index && {opacity: 0},
                    ]}
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
              activeOpacity={1}
              style={styles.shareButton}
              onPress={handleCopyLink}>
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
                  <Text style={[FONTS.fs_12_medium, styles.heroTagText]}>
                    #
                  </Text>
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
              style={styles.guesthousePressArea}>
              <Avatar
                uri={displayHostImage}
                size={40}
                iconSize={16}
                style={styles.summaryAvatar}
              />
              <Text
                style={[FONTS.fs_16_semibold, styles.summaryGuesthouseName]}>
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

          {isNoRecruit && (
            <Text style={[FONTS.fs_14_semibold, styles.noRecruitNotice]}>
              {NO_RECRUIT_NOTICE}
            </Text>
          )}

          {!hasRecognizedPartyStatus && (
            <Text style={[FONTS.fs_14_semibold, styles.unknownStatusNotice]}>
              {UNKNOWN_PARTY_STATUS_NOTICE}
            </Text>
          )}

          <View style={styles.scheduleBar}>
            <CalendarIcon width={18} height={18} />
            <Text style={[FONTS.fs_14_regular, styles.scheduleText]}>
              {scheduleText}
            </Text>
          </View>

          {showPartyDateSelector && (
            <View style={styles.partyDateSection}>
              <View style={styles.partyDateHeader}>
                <Text style={[FONTS.fs_16_semibold, styles.partyDateTitle]}>
                  참여 일정 선택
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.partyDateGuide]}>
                  * 일주일 단위 신청 가능
                </Text>
              </View>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.partyDateList}>
                {partyDateOptions.map(option => {
                  const open = isPartyDateOpen(option);
                  const selected = option.id === selectedPartyDate?.id;
                  const date = dayjs(option.partyStartDateTime);

                  return (
                    <TouchableOpacity
                      key={String(option.id)}
                      activeOpacity={0.8}
                      disabled={!open}
                      onPress={() => setSelectedPartyDateId(option.id)}
                      style={[
                        styles.partyDateCard,
                        selected && styles.partyDateCardSelected,
                        !open && styles.partyDateCardDisabled,
                      ]}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.partyDateCardDate,
                          !open && styles.partyDateCardTextDisabled,
                        ]}>
                        {date.isValid() ? date.format('YYYY.MM.DD (dd)') : '-'}
                      </Text>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.partyDateCardStatus,
                          !open && styles.partyDateCardTextDisabled,
                        ]}>
                        {getPartyDateStatusLabel(option)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 설명 */}
          {!!description && (
            <View style={styles.descriptionContainer}>
              <Text style={[FONTS.fs_14_regular, styles.description]}>
                {description}
              </Text>
            </View>
          )}

          {/* 하단 탭 */}
          <View
            style={[
              styles.tabContainer,
              showPartyDateSelector && styles.tabContainerAdvance,
            ]}>
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
            scrollEnabled={swipeEnabled}
            directionalLockEnabled
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onPagerLayout}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={styles.tabPagerContent}
            {...webSwipeHandlers}
            style={styles.tabPager}>
            {TABS.map(tab => (
              <View
                key={tab.key}
                style={[styles.tabPage, pageWidth > 0 && {width: pageWidth}]}>
                {renderedTabs.has(tab.key) ? renderTabContent(tab.key) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {canApply && showReservationButton && !!applicationNoticeText && (
        <View style={styles.fixedNotice}>
          <BellIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.fixedNoticeText]}>
            {applicationNoticeText}
          </Text>
        </View>
      )}

      {/* 하단 고정 영역 */}
      <View style={styles.fixedBottomBar}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.bottomLikeButton}
          onPress={onToggleLike}>
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
              !canApply && styles.bottomButtonDisabled,
            ]}
            disabled={!canApply}
            onPress={handlePressReservation}>
            <Text style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_0}]}>
              {reservationButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {hasImages && (
        <ImageModal
          visible={imageModalVisible}
          images={modalImages}
          selectedImageIndex={imageIndex}
          sourceRect={imageSourceRect}
          onImageIndexChange={syncHeaderImageIndex}
          onClose={() => setImageModalVisible(false)}
        />
      )}
      <PartyApplicationAppPromptModal
        visible={appPromptVisible}
        onClose={() => setAppPromptVisible(false)}
      />
    </View>
  );
};

export default MeetDetail;
