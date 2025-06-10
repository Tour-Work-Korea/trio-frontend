import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './GuesthouseDetail.styles';
import {FONTS} from '@constants/fonts';
import {rooms, reviews} from './mockData';
import { COLORS } from '@constants/colors';
import Header from '@components/Header';
import ServiceInfoModal from '@components/modals/ServiceInfoModal';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';

import ThinEmptyHeart from '@assets/images/Empty_Heart.svg';
import ShareIcon from '@assets/images/Share.svg';
import LocationPin from '@assets/images/Gray_Location_Pin.svg';
import Star from '@assets/images/Star.svg';
import WifiIcon from '@assets/images/wifi_black.svg';
import PetFriendlyIcon from '@assets/images/pet_friendly_black.svg';
import LuggageIcon from '@assets/images/luggage_storage_black.svg';
import LoungeIcon from '@assets/images/shared_lounge_black.svg';
import ParkingIcon from '@assets/images/free_parking_black.svg';
import CalendarIcon from '@assets/images/Calendar.svg';
import PersonIcon from '@assets/images/Person.svg';
import YellowStar from '@assets/images/Yellow_Star.svg';

const serviceIcons = [
  {icon: WifiIcon, label: '무선인터넷'},
  {icon: PetFriendlyIcon, label: '반려견동반'},
  {icon: LuggageIcon, label: '짐보관'},
  {icon: LoungeIcon, label: '공용라운지'},
  {icon: ParkingIcon, label: '무료주차'},
];

const TAB_OPTIONS = ['객실', '소개', '이용규칙', '리뷰'];

const GuesthouseDetail = ({route}) => {
  const navigation = useNavigation();
  const {id} = route.params;
  const [activeTab, setActiveTab] = useState('객실');
  const [detail, setDetail] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  // 게하 상세 정보 불러오기
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await userGuesthouseApi.getGuesthouseDetail({
          guesthouseId: id,
          checkIn: '2025-05-20',      // 임시값
          checkOut: '2025-05-21',     // 임시값
          guestCount: 2,              // 임시값
        });
        setDetail(response.data);
      } catch (e) {
        console.warn('게스트하우스 상세 조회 실패', e);
      }
    };
    fetchDetail();
  }, [id]);

  // 로딩처리 or 데이터 없을 때 예외처리
  if (!detail) {
    return (
      <View style={[styles.container, {flex: 1, justifyContent: 'center', alignItems: 'center'}]}>
        <Text>로딩중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="게스트하우스 목록" />

      <View>
        <View>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.mainImage}
          />
          {/* 실제 이미지 데이터 사용할 때 */}
          {/* <Image
            source={{ uri: detail.guesthouseImageUrl }}
            style={styles.image}
          /> */}
          <View style={styles.topIcons}>
            <View style={styles.shareIconContainer}>
              <ShareIcon width={16} height={16} />
            </View>
            <View style={styles.heartIconContainer}>
              <ThinEmptyHeart width={16} height={16} />
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.contentTopWrapper}>
            <Text style={[FONTS.fs_h1_bold, styles.name]}>
              {detail.guesthouseName}
            </Text>
            <View style={styles.rowWithIcon}>
              <LocationPin width={16} height={16} />
              <Text style={[FONTS.fs_body, styles.address]}>
                {detail.guesthouseAddress}
              </Text>
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={FONTS.fs_body}>간단 소개글</Text>
              <Text style={FONTS.fs_body}>
                {detail.guesthouseShortIntro}
              </Text>
            </View>

            <View style={styles.reviewRow}>
              <View style={styles.ratingBox}>
                <Star width={16} height={16} />
                <Text style={[FONTS.fs_body, styles.rating]}>
                  {detail.averageRating?.toFixed(1) ?? '0.0'}
                </Text>
              </View>
              {/* <Text style={[FONTS.fs_body, styles.reviewCount]}>
                226 reviews
              </Text> */}
            </View>
          </View>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={styles.iconServiceRow}>
              {serviceIcons.map(({icon: Icon, label}, i) => (
                <View key={i} style={styles.iconWrapper}>
                  <Icon width={24} height={24} />
                  <Text style={[FONTS.fs_body, styles.iconServiceText]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          <View style={styles.dateInfoRow}>
            <View style={styles.dateInfoContainer}>
              <CalendarIcon width={20} height={20} />
              <Text style={FONTS.fs_body_bold}>3.28 금 - 3.29 토</Text>
            </View>
            <View style={styles.dateInfoContainer}>
              <PersonIcon width={18} height={18} style={{marginLeft: 16}} />
              <Text style={FONTS.fs_body_bold}>인원 1, 객실 1</Text>
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
                      { color: activeTab === tab ? COLORS.primary_blue : COLORS.black },
                    ]}>
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.tabUnderline} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {activeTab === '객실' && (
          <View style={styles.contentWrapper}>
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
                  checkIn: detail.checkIn,
                  checkOut: detail.checkOut,
                })
              }>
              <View style={styles.roomCard}>
                <Image source={require('@assets/images/exphoto.jpeg')} style={styles.roomImage} />
                <View style={styles.roomInfo}>
                  <Text style={[FONTS.fs_h1_bold, styles.roomType]}>
                    {room.roomName}
                  </Text>
                  <Text style={[FONTS.fs_body, styles.checkin]}>
                    {room.roomDesc}
                  </Text>
                  <Text style={[FONTS.fs_h2_bold, styles.roomPrice]}>
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
            <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>숙소 소개</Text>
            <Text style={[FONTS.fs_body, styles.introductionText]}>
              {detail.guesthouseLongDesc}
            </Text>
          </View>
        )}

        {activeTab === '이용규칙' && (
          <View style={styles.introductionContainer}>
            <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>
              숙소 이용규칙
            </Text>
            <Text style={[FONTS.fs_body, styles.introductionText]}>
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
        )}

        {activeTab === '리뷰' && (
          <View style={styles.reviewContainer}>
            <View style={styles.reviewRow}>
              <View style={styles.ratingBox}>
                <Star width={20} height={20} />
                <Text style={[FONTS.fs_h2_bold, styles.rating]}>3.7</Text>
              </View>
              <Text style={[FONTS.fs_h2, styles.reviewCount]}>226개 리뷰</Text>
            </View>
            {reviews.map((review, index) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={require('@assets/images/exphoto.jpeg')}
                    style={styles.profileImage}
                  />
                  <View>
                    <Text style={FONTS.fs_body_bold}>{review.name}</Text>
                    <View style={styles.starRow}>
                      {Array(review.rating)
                        .fill()
                        .map((_, i) => (
                          <YellowStar key={i} width={16} height={16} />
                        ))}
                    </View>
                  </View>
                </View>

                <View style={styles.reviewImages}>
                  {review.images.map((img, i) => (
                    <Image key={i} source={img} style={styles.reviewImageThumb} />
                  ))}
                </View>
                <Text style={FONTS.fs_body}>{review.comment}</Text>
                {index !== reviews.length - 1 && (
                  <View style={styles.devideLine} />
                )}
              </View>
            ))}
          </View>
        )}

      </View>
      <ServiceInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
};

export default GuesthouseDetail;
