import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import FavoriteGuesthouseIcon from '@assets/images/user-favorite-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/user-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/user-guesthouse-review-icon.svg';
import FavoritePostIcon from '@assets/images/user-favorite-post-icon.svg';
import MyApplicationIcon from '@assets/images/user-my-application-icon.svg';
import ApplicationStatusIcon from '@assets/images/user-application-status-icon.svg';
import FavoriteMeetIcon from '@assets/images/user-favorite-meet-icon.svg';
import MeetReservationCheckIcon from '@assets/images/user-meet-reservation-check-icon.svg';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

import styles from './UserMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import {tryLogout} from '@utils/auth/login';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';

const UserMyPage = () => {
  const navigation = useNavigation();

  // 저장된 유저 프로필 호출
  const user = useUserStore(state => state.userProfile);

  const goToEditProfile = () => {
    navigation.navigate('UserEditProfile', {
      userInfo: user,
    });
  };

  return (
    <View style={styles.view}>
      <Header title={'마이페이지'} isSetting={true} />
      <ScrollView style={styles.outContainer}>
        <View style={styles.container}>
          {/* 유저 프로필 */}
          <View style={styles.userInfoContainer}>
            <View style={styles.profileHeader}>
              <Text style={[FONTS.fs_16_semibold, styles.name]}>
                {user.nickname}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.age]}>
                {user.gender === 'F' ? '여자' : '남자'} {user.age ?? '00'}세 (
                {user.birthDate?.split('-')[0] ?? '0000'}년생)
              </Text>
              <TouchableOpacity
                style={styles.profileEdit}
                onPress={goToEditProfile}>
                <Text>수정</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.profileContainer}>
              {user.photoUrl ? (
                <Image
                  source={{uri: user.photoUrl}}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImage}>
                  <EmptyImage width={32} height={32} />
                </View>
              )}
              <View style={styles.profilePlaceholder}>
                <View style={styles.profileText}>
                  <Text style={[FONTS.fs_14_medium, styles.profileTitleText]}>
                    연락처
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.profileContentText]}>
                    {user.phone}
                  </Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={[FONTS.fs_14_medium, styles.profileTitleText]}>
                    이메일
                  </Text>
                  <Text
                    style={[FONTS.fs_14_medium, styles.profileContentText]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {user.email}
                  </Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={[FONTS.fs_14_medium, styles.profileTitleText]}>
                    MBTI
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.profileContentText]}>
                    {user.mbti === 'DEFAULT' ? 'MBTI를 추가해주세요' : user.mbti}
                  </Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={[FONTS.fs_14_medium, styles.profileTitleText]}>
                    insta
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.profileContentText]}>
                    @{user.instagramId}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            {/* 숙박 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                숙박
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={FavoriteGuesthouseIcon}
                  label="즐겨찾는 게하"
                  onPress={() => navigation.navigate('UserFavoriteGuesthouse')}
                />
                <MenuItem
                  IconComponent={ReservationCheckIcon}
                  label="예약 내역"
                  onPress={() => navigation.navigate('UserReservationCheck')}
                />
                <MenuItem
                  IconComponent={GuesthouseReviewIcon}
                  label="나의 게하 리뷰"
                  onPress={() => navigation.navigate('UserGuesthouseReview')}
                />
              </View>
            </View>

            <View style={styles.devide} />

            {/* 이벤트 섹션 */}
            <View style={[styles.section]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                이벤트
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={FavoriteMeetIcon}
                  label="즐겨찾는 이벤트"
                  onPress={() => navigation.navigate('UserFavoriteMeet')}
                />
                <MenuItem
                  IconComponent={MeetReservationCheckIcon}
                  label="이벤트 예약내역"
                  onPress={() =>
                    navigation.navigate('UserMeetReservationCheck')
                  }
                />
              </View>
            </View>

            <View style={styles.devide} />

            {/* 공고 섹션 */}
            <View style={[styles.section, {marginBottom: 16}]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                공고
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={FavoritePostIcon}
                  label="즐겨찾는 알바"
                  onPress={() => navigation.navigate('MyLikeRecruitList')}
                />
                <MenuItem
                  IconComponent={MyApplicationIcon}
                  label="나의 이력서"
                  onPress={() => navigation.navigate('MyResumeList')}
                />
                <MenuItem
                  IconComponent={ApplicationStatusIcon}
                  label="지원 현황"
                  onPress={() => navigation.navigate('MyApplicantList')}
                />
              </View>
            </View>

            <ButtonScarlet
              title="로그아웃"
              onPress={async () => {
                await tryLogout();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({IconComponent, label, onPress}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.menuItemIconContainer}>
        <IconComponent width={20} height={20} />
      </View>
      <Text style={[FONTS.fs_14_medium, styles.menuLabel]}>{label}</Text>
    </View>
    <RightArrow width={24} height={24} />
  </TouchableOpacity>
);

export default UserMyPage;
