import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import SettingIcon from '@assets/images/Gray_Setting.svg';
import MyGuesthouseIcon from '@assets/images/host-my-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/host-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/host-guesthouse-review-icon.svg';
import StoreApplyIcon from '@assets/images/host-store-apply-icon.svg';
import MyPostIcon from '@assets/images/host-my-post-icon.svg';
import ApplicationCheckIcon from '@assets/images/host-application-check-icon.svg';
import PostReviewIcon from '@assets/images/host-post-review-icon.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './HostMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';

const HostMyPage = () => {
  const navigation = useNavigation();

  //저장된 호스트 프로필 호출
  const host = useUserStore(state => state.hostProfile);

  const goToEditProfile = () => {
    navigation.navigate('HostEditProfile', {hostInfo: host});
  };

  return (
    <ScrollView style={styles.outContainer}>
      <Header />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[FONTS.fs_h1_bold, styles.name]}>김사장</Text>
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
            IconComponent={MyGuesthouseIcon}
            label="나의 게스트하우스"
            onPress={() => navigation.navigate('MyGuesthouseList')}
          />
          <MenuItem IconComponent={ReservationCheckIcon} label="예약 조회" />
          <MenuItem IconComponent={GuesthouseReviewIcon} label="게하 리뷰" />
          <MenuItem
            IconComponent={StoreApplyIcon}
            label="입점 신청"
            onPress={() => navigation.navigate('StoreRegister')}
          />
        </View>

        {/* 공고 섹션 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_h1_bold, styles.sectionTitle]}>공고</Text>
          <MenuItem
            IconComponent={MyPostIcon}
            label="나의 공고"
            onPress={() => navigation.navigate('MyRecruitmentList')}
          />
          <MenuItem
            IconComponent={ApplicationCheckIcon}
            label="지원서 조회"
            onPress={() => navigation.navigate('ApplicantList')}
          />
          <MenuItem IconComponent={PostReviewIcon} label="공고 리뷰" />
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

export default HostMyPage;
