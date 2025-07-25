import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import SettingIcon from '@assets/images/Gray_Setting.svg';
import FavoriteGuesthouseIcon from '@assets/images/user-favorite-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/user-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/user-guesthouse-review-icon.svg';
import FavoritePostIcon from '@assets/images/user-favorite-post-icon.svg';
import MyApplicationIcon from '@assets/images/user-my-application-icon.svg';
import ApplicationStatusIcon from '@assets/images/user-application-status-icon.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './UserMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import {tryLogout} from '@utils/auth/login';

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
    <ScrollView style={styles.outContainer}>
      <Header />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            {user.photoUrl ? (
              <Image
                source={{uri: user.photoUrl}}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <PersonIcon width={32} height={32} />
              </View>
            )}
            <Text style={[FONTS.fs_16_semibold, styles.name]}>
              {user.nickname}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <PersonIcon
              width={26}
              height={26}
              style={styles.icon}
              onPress={goToEditProfile}
            />
            <SettingIcon width={26} height={26} style={styles.icon} />
          </View>
        </View>

        {/* 숙박 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>숙박</Text>
          <MenuItem
            IconComponent={FavoriteGuesthouseIcon}
            label="즐겨찾는 게하"
            onPress={() => navigation.navigate('UserFavoriteGuesthouse')}
          />
          <MenuItem
            IconComponent={ReservationCheckIcon}
            label="예약 조회"
            onPress={() => navigation.navigate('UserReservationCheck')}
          />
          <MenuItem
            IconComponent={GuesthouseReviewIcon}
            label="나의 게하 리뷰"
          />
        </View>

        {/* 공고 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>공고</Text>
          <MenuItem
            IconComponent={FavoritePostIcon}
            label="즐겨찾는 공고"
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
        <ButtonScarlet
          title="로그아웃"
          onPress={async () => {
            await tryLogout();
            navigation.reset({
              index: 0,
              routes: [{name: 'EXLogin'}],
            });
          }}
        />
      </View>
    </ScrollView>
  );
};

const MenuItem = ({IconComponent, label, onPress}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.menuItemIconContainer}>
        <IconComponent width={28} height={28} />
      </View>
      <Text style={[styles.menuLabel]}>{label}</Text>
    </View>
    <RightArrow width={24} height={24} style={styles.icon} />
  </TouchableOpacity>
);

export default UserMyPage;
