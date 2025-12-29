import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import styles from './MeetDetail.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import userMeetApi from '@utils/api/userMeetApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import {
  partyDetailDeeplink,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';
import { trimJejuPrefix } from '@utils/formatAddress';
import MeetDetailInfoModal from '@components/modals/Meet/MeetDetailInfoModal';

import ChevronLeft from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import EmptyIcon from '@assets/images/meet_reservation_success.svg';

const TABS = ['이벤트 소개', '상세 안내', '오시는 길'];

const SNACK_TAG_LABEL = {
  PARTY_FOOD: '음식 제공',
  PARTY_DRINK: '음료 제공',
  PARTY_SNACK: '간식 제공',
  PARTY_ALCOHOL: '주류 제공',
  PARTY_INDIVIDUAL: '각자 준비',
  PARTY_TOGETHER: '다함께 준비',
  PARTY_NO_SMOKE: '금연',
};

const PARKING_TAG_LABEL = {
  PARTY_PARKING: '주차 가능',
  PARTY_GUESTHOUSE_PARKING: '전용 주차장',
  PARTY_PUBLIC_PARKING: '공용 주차장',
  PARTY_STREET_PARKING: '대로변 주차',
  PARTY_NO_PARKING: '주차 불가',
};

const MeetDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {partyId} = route.params ?? {};

  const [selectedTab, setSelectedTab] = useState('이벤트 소개');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [detail, setDetail] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 모달
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalType, setInfoModalType] = useState("tag"); // "tag" | "section"
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [infoModalTags, setInfoModalTags] = useState([]);
  const [infoModalContent, setInfoModalContent] = useState("");
  const [infoModalSections, setInfoModalSections] = useState([]);

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
  const formatDateWithDay = dateStr => {
    if (!dateStr) return '-';
    const date = dayjs(dateStr);
    if (!date.isValid()) return '-';
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  // 이벤트 상세 데이터
  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const {data} = await userMeetApi.getPartyDetail(partyId);
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
    guesthouseAddress,
    partyTitle,
    description,
    events,
    partySchedule,
    snackTags,
    snackInfo,
    rules,
    meetingPlace,
    trafficInfo,
    parkingTag,
    parkingPlace,
    location,
    // partyInfo,
    partyStartDateTime,
    partyStartTime,
    partyEndTime,
    numOfAttendance,
    maxAttendance,
    amount, // 숙박객 남자
    femaleAmount, // 숙박객 여자
    maleNonAmount, // 비숙박객 남자
    femaleNonAmount, // 비숙박객 여자
    // partyEvents,
    partyImages,
    coordinate, // 백엔드 확장 시 { latitude, longitude } 형태로 받을 것을 가정
    isGuest,
  } = detail ?? {};

  // 날짜/시간 파생 (끝나는 날짜는 시작 날짜와 동일하다고 가정)
  const checkInDate = partyStartDateTime || null;
  const checkInTime = partyStartTime || partyStartDateTime || null;
  const checkOutDate = partyStartDateTime || null;
  const checkOutTime = partyEndTime || null;

  // 썸네일/갤러리
  const thumbnailSource = useMemo(() => {
    const th = partyImages?.find(i => i.isThumbnail);
    if (th?.imageUrl) return {uri: th.imageUrl};
    // 응답에 없다면 첫 이미지
    if (partyImages?.[0]?.imageUrl) return {uri: partyImages[0].imageUrl};
  }, [partyImages]);

  const gallery = useMemo(
    () => partyImages?.map(p => ({uri: p.imageUrl})) ?? [],
    [partyImages],
  );

  // 가격(라벨 매핑)
  const priceBox = useMemo(
    () => ({
      guest: {
        female: femaleAmount ?? null,
        male: amount ?? null,
      },
      nonGuest: {
        female: femaleNonAmount ?? null,
        male: maleNonAmount ?? null,
      },
    }),
    [amount, femaleAmount, femaleNonAmount, maleNonAmount],
  );

  // 이벤트 좋아요 토글
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
    const deepLinkUrl = partyDetailDeeplink(partyId);
    copyDeeplinkToClipboard(deepLinkUrl);

    Toast.show({
      type: 'success',
      text1: '복사되었어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  // 가격 설정
  const renderPrice = (value) => {
    // 0, null, undefined → 무료
    if (!value || Number(value) === 0) {
      return (
        <Text style={[FONTS.fs_14_semibold, { color: COLORS.primary_orange }]}>
          무료
        </Text>
      );
    }

    // 정상 가격
    return (
      <Text style={[FONTS.fs_14_semibold, styles.priceText]}>
        {Number(value).toLocaleString()}원
      </Text>
    );
  };

  // 음료 음식 태그
  const snackTagTexts = useMemo(() => {
    return snackTags
      ?.map(tag => SNACK_TAG_LABEL[tag])
      ?.filter(Boolean); // 혹시 모를 undefined 제거
  }, [snackTags]);

  // 이용 규칙 제목
  const ruleTitleLine = useMemo(() => {
    return rules?.map(r => r.title)?.filter(Boolean)?.join(' · ') ?? '';
  }, [rules]);

  // 교통 정보 제목
  const trafficTitleLine = useMemo(() => {
    return trafficInfo?.map(t => t.title)?.filter(Boolean)?.join(' · ') ?? '';
  }, [trafficInfo]);

  // 주차 내용
  const parkingContentText = useMemo(() => {
    return parkingPlace
      ?.map(p => `• ${p.title}\n${p.content}`)
      ?.join('\n\n') ?? '';
  }, [parkingPlace]);

  // 주차 태그
  const parkingTagTexts = useMemo(() => {
    return parkingTag
      ?.map(tag => PARKING_TAG_LABEL[tag])
      ?.filter(Boolean);
  }, [parkingTag]);

  // 빈 값일때
  const renderEmptyInfo = () => (
    <View style={styles.emptyContainer}>
      <Image source={EmptyIcon} style={styles.emptyIcon} />
      <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
        더 궁금하신 점은 업체로 문의해 주세요
      </Text>
      {/* 전화번호 */}
      {/* {!!guesthouseAddress && (
        <Text style={[FONTS.fs_14_medium, styles.emptySubText]}>
          {guesthouseAddress}
        </Text>
      )} */}
    </View>
  );

  // 오시는길 값 유무
  const isEmptyWayInfo =
    !meetingPlace &&
    !(trafficInfo?.length > 0) &&
    !parkingContentText;

  return (
    <View style={{flex: 1}}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 썸네일 */}
        <Image source={thumbnailSource} style={styles.thumbnail} />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ChevronLeft width={28} height={28} />
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
            ellipsizeMode="tail">
            {partyTitle}
          </Text>
          <View style={styles.shareHeartContainer}>
            <TouchableOpacity onPress={handleCopyLink}>
              <ShareIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onToggleLike} style={{marginLeft: 12}}>
              {liked ? (
                <HeartFilled width={20} height={20} />
              ) : (
                <HeartEmpty width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressCapacityContainer}>
          {/* 주소 */}
          <Text
            style={[FONTS.fs_14_regular, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {trimJejuPrefix(location)}
          </Text>
          {/* 인원수 */}
          <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
            {numOfAttendance}/{maxAttendance}명
          </Text>
        </View>


        {/* 이벤트금액 */}
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            {/* 숙박객 */}
            <View style={[styles.priceSection, {marginBottom: 8}]}>
              <Text
                style={[
                  FONTS.fs_14_regular,
                  styles.priceSectionTitle,
                ]}>
                숙박객
              </Text>
              <View style={styles.priceTextRow}>
                <Text style={[FONTS.fs_14_semibold, styles.priceText]}>
                  {renderPrice(priceBox.guest.male)}
                </Text>
              </View>
            </View>

            {/* 비숙박객 */}
            <View style={styles.priceSection}>
              <Text
                style={[
                  FONTS.fs_14_regular,
                  styles.priceSectionTitle,
                ]}>
                비숙박객
              </Text>
              {isGuest ? (
                <Text style={[FONTS.fs_14_semibold, styles.priceText]}>
                  참여 불가
                </Text>
              ) : (
                <View style={styles.priceTextRow}>
                  <Text style={[FONTS.fs_14_semibold, styles.priceText]}>
                    {renderPrice(priceBox.nonGuest.male)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.devide}/>

        {/* 사장님 계정 */}
        <View style={styles.profileBox}>
          <Image 
            style={styles.profileImage} 
            source={{uri: hostProfileImage}}
          />
          <View style={styles.profileTextBox}>
            <Text style={[FONTS.fs_14_semibold]}>{guesthouseName}</Text>
            <Text style={[FONTS.fs_14_regular, styles.profileAddr]}>{guesthouseAddress}</Text>
          </View>
        </View>

        {/* 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={[FONTS.fs_14_regular, styles.description]}>
            {description}
          </Text>
        </View>

        {/* 하단 탭 */}
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
            <Pressable
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setSelectedTab(tab)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                  selectedTab === tab && FONTS.fs_14_semibold,
                ]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 탭 콘텐츠 */}
        {/* 이벤트 소개 */}
        {selectedTab === '이벤트 소개' && (
          <View style={styles.tabContent}>
            {(!events || events.length === 0) ? (
              renderEmptyInfo()
            ) : (
            events?.map(ev => {
              const images = ev.partyEventImageUrls ?? [];

              return (
              <View key={ev.id} style={{ marginBottom: 20 }}>
                {/* 이미지(들) */}
                {images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.eventImageRow}
                  >
                    {images.map((url, idx) => (
                      <Image
                        key={`${ev.id}-${idx}`}
                        source={{ uri: url }}
                        style={styles.eventImageBlog}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}
                {/* 제목 */}
                <Text style={[FONTS.fs_16_semibold, styles.eventTitle]}>
                  {ev.eventName}
                </Text>
                {/* 내용 */}
                {!!ev.eventDescription && (
                  <Text style={[FONTS.fs_14_regular, styles.eventBody]}>
                    {ev.eventDescription}
                  </Text>
                )}
              </View>
              );
            })
          )}
          </View>
        )}

        {/* 상세 안내 */}
        {selectedTab === '상세 안내' && (
          <View style={styles.tabContent}>
            <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>일정</Text>
            <View style={styles.infoTextContainer}>
              <Text style={[FONTS.fs_14_regular, styles.infoText]}>
                {partySchedule}
              </Text>
            </View>
            {/* 음식 • 음료 */}
            {!!snackInfo && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>음식 • 음료</Text>
              <View style={styles.detailInfoText}>
                <View style={styles.tagWrapper}>
                  <Text
                    style={[FONTS.fs_14_medium, styles.tagText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {snackTagTexts?.map(tag => `#${tag}`).join('  ')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openTagModal(
                      "음식 • 음료",
                      snackTagTexts?.map(t => `#${t}`),
                      snackInfo
                    )
                  }
                >
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16}/>
                </TouchableOpacity>
              </View>
            </View>
            )}
            {/* 이용규칙 */}
            {rules?.length > 0 && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>이용규칙</Text>
              <View style={styles.detailInfoText}>
                <Text
                  style={[FONTS.fs_14_medium, styles.tagText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {ruleTitleLine}
                </Text>
                <TouchableOpacity
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openSectionModal(
                      '이용규칙',
                      (rules ?? []).map(r => ({
                        subtitle: r.title,
                        body: r.content,
                      }))
                    )
                  }
                >
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16}/>
                </TouchableOpacity>
              </View>
            </View>
            )}
            {/* <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>기타 정보</Text>
              <View style={styles.detailInfoText}>
                <Text style={[FONTS.fs_14_medium, styles.tagText]}>이름들</Text>
                <TouchableOpacity 
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openSectionModal("기타 정보", [
                      {
                        subtitle: "포틀럭 정리",
                        body: `✔ 포틀럭 후 먹은 것 함께 정리
                        ✔ 마무리 청소는 저희가 담당합니다`
                      }
                    ])
                  }
                >
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16}/>
                </TouchableOpacity>
              </View>
            </View> */}
          </View>
        )}

        {/* 오시는 길 */}
        {selectedTab === '오시는 길' && (
          <View style={styles.tabContent}>
            {isEmptyWayInfo ? (
              renderEmptyInfo()
            ) : (
            <>
            <Text style={[FONTS.fs_18_bold, styles.infoMainTitleText]}>위치</Text>
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
            {!!meetingPlace && (
            <Text style={[FONTS.fs_14_regular, styles.infoText]}>
              만나는 장소 : {meetingPlace}
            </Text>
            )}
            {/* 교통정보 */}
            {trafficInfo?.length > 0 && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>교통 정보</Text>
              <View style={styles.detailInfoText}>
                <Text
                  style={[FONTS.fs_14_medium, styles.tagText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {trafficTitleLine}
                </Text>
                <TouchableOpacity
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openSectionModal(
                      '교통 정보',
                      (trafficInfo ?? []).map(it => ({
                        subtitle: it.title,
                        body: it.content,
                      }))
                    )
                  }
                >
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16}/>
                </TouchableOpacity>
              </View>
            </View>
            )}
            {/* 주차정보 */}
            {!!parkingContentText && (
            <View style={styles.detailInfoContainer}>
              <Text style={[FONTS.fs_18_bold, styles.infoTitleText]}>주차 정보</Text>
              <View style={styles.detailInfoText}>
                <Text
                  style={[FONTS.fs_14_medium, styles.tagText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {parkingTagTexts?.map(t => `#${t}`).join('  ')}
                </Text>
                <TouchableOpacity
                  style={styles.detailInfoBtn}
                  onPress={() =>
                    openTagModal(
                      '주차 정보',
                      parkingTagTexts?.map(t => `#${t}`),
                      parkingContentText
                    )
                  }
                >
                  <Text style={[FONTS.fs_14_medium, styles.detailInfoBtnText]}>
                    내용 확인하기
                  </Text>
                  <ChevronRight width={16} height={16}/>
                </TouchableOpacity>
              </View>
            </View>
            )}
            </>
          )}
          </View>
        )}
      </View>

    </ScrollView>

    {/* 하단 고정 영역 */}
    <View style={styles.fixedBottomBar}>
      <View style={styles.bottomLeft}>
        <Text style={[FONTS.fs_16_semibold, styles.bottomPrice]}>
          {Number(priceBox.guest.male || 0).toLocaleString()} ~ {Number(priceBox.nonGuest.male || 0).toLocaleString()}원
        </Text>
        <Text style={[FONTS.fs_14_regular, styles.bottomDate]}>
          {formatDateWithDay(checkInDate)}   {formatTime(checkInTime)}~{formatTime(checkOutTime)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bottomButton}
        onPress={() => navigation.navigate('MeetReservation', {partyId})}
      >
        <Text style={[FONTS.fs_16_semibold, {color: 'white'}]}>참여하기</Text>
      </TouchableOpacity>
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
    </View>
  );
};

export default MeetDetail;
