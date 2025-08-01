import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import SettingIcon from '@assets/images/Gray_Setting.svg';
import MyGuesthouseIcon from '@assets/images/host-my-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/host-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/host-guesthouse-review-icon.svg';
import StoreApplyIcon from '@assets/images/host-store-apply-icon.svg';
import MyPostIcon from '@assets/images/host-my-post-icon.svg';
import ApplicationCheckIcon from '@assets/images/host-application-check-icon.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './HostMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import {tryLogout} from '@utils/auth/login';

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
          <View style={styles.profileContainer}>
            {host.photoUrl ? (
              <Image
                source={{uri: host.photoUrl}}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <PersonIcon width={32} height={32} />
              </View>
            )}
            <Text style={[FONTS.fs_16_semibold, styles.name]}>{host.name}</Text>
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
            IconComponent={MyGuesthouseIcon}
            label="나의 게스트하우스"
            onPress={() => navigation.navigate('MyGuesthouseList')}
          />
          <MenuItem IconComponent={ReservationCheckIcon} label="예약 조회" />
          <MenuItem
            IconComponent={GuesthouseReviewIcon}
            label="게하 리뷰"
            onPress={() => navigation.navigate('MyGuesthouseReview')}
          />
          <MenuItem
            IconComponent={StoreApplyIcon}
            label="입점 신청"
            onPress={() => navigation.navigate('StoreRegister')}
          />
        </View>
        {/* 공고 섹션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle]}>공고</Text>
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
    <RightArrow width={24} height={24} />
  </TouchableOpacity>
);

export default HostMyPage;
