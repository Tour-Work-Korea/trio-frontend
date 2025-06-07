import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import SettingIcon from '@assets/images/Gray_Setting.svg';
import FavoriteGuesthouseIcon from '@assets/images/user-favorite-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/user-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/user-guesthouse-review-icon.svg';
import FavoritePostIcon from '@assets/images/user-favorite-post-icon.svg';
import MyApplicationIcon from '@assets/images/user-my-application-icon.svg';
import ApplicationStatusIcon from '@assets/images/user-application-status-icon.svg';
import PostReviewIcon from '@assets/images/user-post-review-icon.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './UserMyPage.styles';
import {FONTS} from '@constants/fonts';

const UserMyPage = () => {
  // 가짜 유저 데이터 (사진 없음)
  const user = {
    name: '김이지',
    profileImage: null,
  };

  const navigation = useNavigation();

  const goToEditProfile = () => {
    navigation.navigate('UserEditProfile');
  };

  return (
    <ScrollView style={styles.outContainer}>
      <Header />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            {user.profileImage ? (
              <Image
                source={{uri: user.profileImage}}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <PersonIcon width={32} height={32} />
              </View>
            )}
            <Text style={[FONTS.fs_h1_bold, styles.name]}>{user.name}</Text>
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
          <Text style={[FONTS.fs_h1_bold, styles.sectionTitle]}>숙박</Text>
          <MenuItem
            IconComponent={FavoriteGuesthouseIcon}
            label="즐겨찾는 게하"
          />
          <MenuItem IconComponent={ReservationCheckIcon} label="예약 조회" />
          <MenuItem
            IconComponent={GuesthouseReviewIcon}
            label="나의 게하 리뷰"
          />
        </View>

        {/* 공고 섹션 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_h1_bold, styles.sectionTitle]}>공고</Text>
          <MenuItem
            IconComponent={FavoritePostIcon}
            label="즐겨찾는 공고"
            onPress={() => navigation.navigate('MyLikeRecruitList')}
          />
          <MenuItem
            IconComponent={MyApplicationIcon}
            label="나의 지원서"
            onPress={() => navigation.navigate('MyApplicantList')}
          />
          <MenuItem IconComponent={ApplicationStatusIcon} label="지원 현황" />
          <MenuItem IconComponent={PostReviewIcon} label="나의 공고 리뷰" />
        </View>
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
      <Text style={[FONTS.fs_h1_bold, styles.menuLabel]}>{label}</Text>
    </View>
    <RightArrow width={24} height={24} />
  </TouchableOpacity>
);

export default UserMyPage;
