import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import styles from './GuesthouseDetail.styles';
import { FONTS } from '@constants/fonts';
import { rooms, reviews } from './mockData';
import Header from '@components/Header';

import ThinEmptyHeart from '@assets/images/Thin_Empty_Heart.svg';
import ShareIcon from '@assets/images/Share.svg';
import LocationPin from '@assets/images/Gray_Location_Pin.svg';
import Star from '@assets/images/Star.svg';
import WifiIcon from '@assets/images/Wifi.svg';
import PetFriendlyIcon from '@assets/images/Pet_Friendly.svg';
import LuggageIcon from '@assets/images/Luggage_Storage.svg';
import LoungeIcon from '@assets/images/Shared_Lounge.svg';
import ParkingIcon from '@assets/images/Free_Parking.svg';
import CalendarIcon from '@assets/images/Calendar.svg';
import PersonIcon from '@assets/images/Person.svg';
import YellowStar from '@assets/images/Yellow_Star.svg';

const serviceIcons = [
  { icon: WifiIcon, label: '무선인터넷' },
  { icon: PetFriendlyIcon, label: '반려견동반' },
  { icon: LuggageIcon, label: '짐보관' },
  { icon: LoungeIcon, label: '공용라운지' },
  { icon: ParkingIcon, label: '무료주차' },
];

const GuesthouseDetail = ({ route }) => {
  const { id, name } = route.params;
  
  return (
    <ScrollView style={styles.container}>
      <Header title="게스트하우스 목록" />

      <View>
        <View>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.mainImage}
          />
          <View style={styles.topIcons}>
            <View style={styles.shareIconContainer}>
              <ShareIcon width={16} height={16}/>
            </View>
            <View style={styles.heartIconContainer}>
              <ThinEmptyHeart width={16} height={16}/>
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.contentTopWrapper}>
            <Text style={[FONTS.fs_h1_bold, styles.name]}>
              {name}
            </Text>
            <View style={styles.rowWithIcon}>
              <LocationPin width={16} height={16} />
              <Text style={[FONTS.fs_body, styles.address]}>
                제주특별자치도 서귀포시 남원읍 위미중앙로300번길 24
              </Text>
            </View>

            <View style={styles.sectionSpacing}>
              <Text style={FONTS.fs_body}>간단 소개글</Text>
              <Text style={FONTS.fs_body}>블라블라블라라라~</Text>
            </View>

            <View style={styles.reviewRow}>
              <View style={styles.ratingBox}>
                <Star width={16} height={16} />
                <Text style={[FONTS.fs_body, styles.rating]}>3.7</Text>
              </View>
              <Text style={[FONTS.fs_body, styles.reviewCount]}>226 reviews</Text>
            </View>
          </View>

          <View style={styles.iconServiceRow}>
            {serviceIcons.map(({ icon: Icon, label }, i) => (
              <View key={i} style={styles.iconWrapper}>
                <Icon width={24} height={24} />
                <Text style={[FONTS.fs_body, styles.iconServiceText]}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dateInfoRow}>
            <View style={styles.dateInfoContainer}>
              <CalendarIcon width={20} height={20} />
              <Text style={FONTS.fs_body_bold}>3.28 금 - 3.29 토</Text>
            </View>
            <View style={styles.dateInfoContainer}>
              <PersonIcon width={18} height={18} style={{ marginLeft: 16 }} />
              <Text style={FONTS.fs_body_bold}>인원 1, 객실 1</Text>
            </View>
          </View>

          {rooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <Image source={room.image} style={styles.roomImage} />
              <View style={styles.roomInfo}>
                <Text style={[FONTS.fs_h1_bold, styles.roomType]}>{room.type}</Text>
                <Text style={[FONTS.fs_body, styles.checkin]}>{room.checkin}</Text>
                <Text style={[FONTS.fs_h2_bold, styles.roomPrice]}>
                {room.price.toLocaleString()}원
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>숙소 소개</Text>
          <Text style={[FONTS.fs_body, styles.introductionText]}>
            환영합니다!^^ 숙소는 한옥마을 안에 있습니다. {'\n'}방, 욕실은 예약자 전용입니다.{'\n'}...
            환영합니다!^^{'\n'}
            숙소는 한옥마을 안에 있습니다.{'\n'}
            방.욕실은 예약자.예약자 일행.전용 입니다.{'\n'}
            모르는 사람과 방.욕실 같이 사용하지 않습니다.{'\n'}
            원룸 생각 하시면 됩니다.{'\n'}
            수건은 1인당 2장씩 제공합니다.{'\n'}
            부족하시면 공용 공간에서 셀프로 가져다 사용 하시면 됩 니다.{'\n'}
            3층 입니다.{'\n'}
            야간 전망 괜찮습니다.{'\n'}
            1개의 방.욕실은 예약자 개인 전용 입니다.{'\n'}
            원룸식 으로 생각 하시면 됩니다.{'\n'}
            공용공간에 정수기.커피포트.전자렌지.냉장고.종이컵. 있습니다.{'\n'}
            모든 개인 방 에는 에어컨.TV. 드라이기. 샴푸.린스.바디.{'\n'}
            치약.비누.수건. 있습니다.{'\n'}
            칫솔만 가져 오시면 됩니다.{'\n'}
            숙소의 부족한 부분 감안해서 추가요금와 가격에 반영 했습니다^^
          </Text>
        </View>
        
        <View style={styles.introductionContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>숙소 이용규칙</Text>
          <Text style={[FONTS.fs_body, styles.introductionText]}>
          숙소 이용 규칙 {'\n'}
          -전 객실 금연 (금연건물로 흡연 시 미환불 강제퇴실) {'\n'}
          -흡연은 옥상과 테라스에서만 가능 {'\n'}
          -타인에게 피해나 불쾌감을 주는 행위 또는 게스트하우스 이용규정을 지키지 않을 경우 강제 퇴실 조치 {'\n'}
          -시설물을 파손하거나 침구류 훼손 및 오염 (세탁 불가능) 시 전액 배상 {'\n'}
          -보호자 동반 없는 미성년자 입실 불가 (업체문의 필수) {'\n'}
          주차장 정보 {'\n'}
          • 한옥마을 공용 주차장 약150m {'\n'}
          취소 및 환불 규정 {'\n'}
          -체크인일 기준 7일 전 : 100% 환불 {'\n'}
          -체크인일 기준 6~ 4일 전 : 50% 환불 {'\n'}
          -체크인일 기준 3일 전~ 당일 및 No-Show : 환불 불가 {'\n'}
          -취소, 환불 시 수수료가 발생할 수 있습니다 {'\n'}
          확인 사항 및 기타 {'\n'}
          • 시즌별 객실 가격 상이하오니 확인바랍니다
          </Text>
        </View>

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
                    {Array(review.rating).fill().map((_, i) => (
                      <YellowStar key={i} width={16} height={16} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.reviewImages}>
                {review.images.map((img, i) => (
                  <Image
                    key={i}
                    source={img}
                    style={styles.reviewImageThumb}
                  />
                ))}
              </View>
              <Text style={FONTS.fs_body}>{review.comment}</Text>
              {index !== reviews.length - 1 && (
                <View style={styles.devideLine} />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default GuesthouseDetail;
