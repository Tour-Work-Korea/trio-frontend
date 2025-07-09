import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ServiceInfoModal from '@components/modals/Guesthouse/ServiceInfoModal';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import GuesthouseReview from '@screens/(Common)/BottomTabs/Guesthouse/GuesthouseReview';
import { guesthouseDetailDeeplink, copyDeeplinkToClipboard } from '@utils/deeplinkGenerator';

import EmptyHeart from '@assets/images/heart_empty.svg';
import FilledHeart from '@assets/images/heart_filled.svg';
import LeftArrow from '@assets/images/chevron_left_white.svg';
import ShareIcon from '@assets/images/share_gray.svg';
import Star from '@assets/images/star_white.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import PersonIcon from '@assets/images/person20_white.svg';

import WifiIcon from '@assets/images/wifi_black.svg';
import PetFriendlyIcon from '@assets/images/pet_friendly_black.svg';
import LuggageIcon from '@assets/images/luggage_storage_black.svg';
import LoungeIcon from '@assets/images/shared_lounge_black.svg';
import ParkingIcon from '@assets/images/free_parking_black.svg';

const serviceIcons = [
  { icon: WifiIcon, label: '무선인터넷', width: 26, height: 26 },
  { icon: PetFriendlyIcon, label: '반려견동반', width: 24, height: 24 },
  { icon: LuggageIcon, label: '짐보관', width: 24, height: 24 },
  { icon: LoungeIcon, label: '공용라운지', width: 28, height: 28 },
  { icon: ParkingIcon, label: '무료주차', width: 23, height: 23 },
];

const TAB_OPTIONS = ['객실', '소개', '이용규칙', '리뷰'];

const GuesthouseDetail = ({route}) => {
  const navigation = useNavigation();
  const { id, checkIn, checkOut, guestCount } = route.params;
  const [activeTab, setActiveTab] = useState('객실');
  const [detail, setDetail] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';

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
        setDetail(response.data);
        setIsFavorite(response.data.isFavorite ?? false);
      } catch (e) {
        console.warn('게스트하우스 상세 조회 실패', e);
      }
    };
    fetchDetail();
  }, [id]);

  // 게하 좋아요, 좋아요 취소
  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await userGuesthouseApi.unfavoriteGuesthouse(id);
      } else {
        await userGuesthouseApi.favoriteGuesthouse(id);
      }
      setIsFavorite(prev => !prev); // 상태 토글
    } catch (error) {
      console.warn('좋아요 토글 실패', error);
    }
  };

  // 로딩처리 or 데이터 없을 때 예외처리
  if (!detail) {
    return (
      <View style={[styles.container, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
        <Text>로딩중...</Text>
      </View>
    );
  }

  const thumbnailImage = detail.guesthouseImages?.find(img => img.isThumbnail)?.guesthouseImageUrl;

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* 이미지 처리 */}
        {thumbnailImage ? (
          <Image
            source={{ uri: thumbnailImage }}
            style={styles.mainImage}
          />
        ) : (
          <View style={[styles.mainImage, { backgroundColor: COLORS.grayscale_200 }]} />
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <LeftArrow width={28} height={28}/>
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
            <TouchableOpacity onPress={() => {
                const deepLinkUrl = guesthouseDetailDeeplink(id);
                copyDeeplinkToClipboard(deepLinkUrl);
                Alert.alert('복사가 완료되었습니다. 바로 공유해볼까요?');
            }}>
              <ShareIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavorite}>
              {isFavorite ? (
                <FilledHeart width={20} height={20} />
              ) : (
                <EmptyHeart width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[FONTS.fs_14_regular, styles.address]}>
          {detail.guesthouseAddress}
        </Text>

        <View style={styles.reviewRow}>
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

        <View style={styles.iconServiceContainer}>
          <View style={styles.iconServiceRow}>
            {serviceIcons.map(({ icon: Icon, label, width, height }, i) => (
              <View key={i} style={styles.iconWrapper}>
                <Icon width={width} height={height} />
                <Text style={[FONTS.fs_12_medium, styles.iconServiceText]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[FONTS.fs_12_medium, styles.readMoreText]}>더보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.devide}/>

        <View style={styles.displayDateGuestRow}>
          <View style={styles.dateInfoContainer}>
            <CalendarIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              {dayjs(checkIn).format('M.D ddd')} - {dayjs(checkOut).format('M.D ddd')}
            </Text>
          </View>
          <View style={styles.guestInfoContainer}>
            <PersonIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateGuestText]}>
              인원 {guestCount}
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
          {detail.roomInfos?.map(room => (
          <TouchableOpacity
            key={room.id}
            onPress={() =>
              navigation.navigate('RoomDetail', {
                roomId: room.id,
                roomName: room.roomName,
                roomPrice: room.roomPrice,
                roomDesc: room.roomDesc,
                guesthouseName: detail.guesthouseName,
                checkIn: `${checkIn}T${detail.checkIn}`,
                checkOut: `${checkOut}T${detail.checkOut}`,
                guestCount: guestCount,
                roomImage: (
                  room.roomImages?.find(img => img.isThumbnail)?.roomImageUrl ||
                  room.roomImages?.[0]?.roomImageUrl ||
                  null
                ),
              })
            }>
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
                  <Text style={[FONTS.fs_16_semibold, styles.roomType]}>
                    {room.roomName}
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
          ))}
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
              숙소 이용 규칙 {'\n'}
              -전 객실 금연 (금연건물로 흡연 시 미환불 강제퇴실) {'\n'}
              -흡연은 옥상과 테라스에서만 가능 {'\n'}
              -타인에게 피해나 불쾌감을 주는 행위 또는 게스트하우스 이용규정을
              지키지 않을 경우 강제 퇴실 조치 {'\n'}
              -시설물을 파손하거나 침구류 훼손 및 오염 (세탁 불가능) 시 전액 배상{' '}
              {'\n'}
              -보호자 동반 없는 미성년자 입실 불가 (업체문의 필수) {'\n'}
              주차장 정보 {'\n'}• 한옥마을 공용 주차장 약150m {'\n'}
              취소 및 환불 규정 {'\n'}
              -체크인일 기준 7일 전 : 100% 환불 {'\n'}
              -체크인일 기준 6~ 4일 전 : 50% 환불 {'\n'}
              -체크인일 기준 3일 전~ 당일 및 No-Show : 환불 불가 {'\n'}
              -취소, 환불 시 수수료가 발생할 수 있습니다 {'\n'}
              확인 사항 및 기타 {'\n'}• 시즌별 객실 가격 상이하오니 확인바랍니다
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
          <
            GuesthouseReview guesthouseId={id}
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
    </ScrollView>
  );
};

export default GuesthouseDetail;
