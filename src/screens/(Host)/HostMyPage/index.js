import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, ImageBackground} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import MyGuesthouseIcon from '@assets/images/host-my-guesthouse-icon.svg';
import ReservationCheckIcon from '@assets/images/host-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/host-guesthouse-review-icon.svg';
import StoreApplyIcon from '@assets/images/host-store-apply-icon.svg';
import MyPostIcon from '@assets/images/host-my-post-icon.svg';
import ApplicationCheckIcon from '@assets/images/host-application-check-icon.svg';
import MyMeetIcon from '@assets/images/host-my-meet-icon.svg';
import MeetReservationCheckIcon from '@assets/images/host-meet-reservation-icon.svg';
import RightArrow from '@assets/images/chevron_right_gray.svg';

import EmptyImage from '@assets/images/wlogo_gray_up.svg';
import styles from './HostMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import Header from '@components/Header';

const HostMyPage = () => {
  const navigation = useNavigation();

  //저장된 호스트 프로필 호출-> 추후 수정
  const host = useUserStore(state => state.hostProfile);
  const hasHeaderImage = Boolean(host?.photoUrl);

  const renderHeaderContent = () => (
    <>
      {hasHeaderImage && <View style={styles.headerOverlay} />}

      <TouchableOpacity
        style={styles.profileEditButton}
        onPress={() => navigation.navigate('HostEditProfile')}
      >
        <Text style={[FONTS.fs_14_medium, styles.profileEditBtnText]}>프로필 편집</Text>
      </TouchableOpacity>

      {/* 프로필 영역 */}
      <View style={styles.profileWrap}>
        <Text style={[FONTS.fs_20_bold, styles.guesthouseNameText]}>
          게하 이름
        </Text>

        <View style={styles.profileImageWrap}>
          {host.photoUrl ? (
            <Image
              source={{uri: host.photoUrl}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage}>
              <EmptyImage width={32} height={32} />
            </View>
          )}
        </View>

        <Text style={[FONTS.fs_16_semibold, styles.hostNameText]}>
          호스트 프로필 닉네임
        </Text>
      </View>
    </>
  );

  return (
    <View style={styles.view}>
      <Header title={'마이페이지'} isSetting={true} role={'HOST'}/>
      <ScrollView style={styles.outContainer}>
        {/* 사장 프로필 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('HostProfilePage')}
        >
          {hasHeaderImage ? (
            <ImageBackground
              source={{uri: host.photoUrl}}
              style={styles.headerBg}
              resizeMode="cover"
            >
              {renderHeaderContent()}
            </ImageBackground>
          ) : (
            <View style={[styles.headerBg, styles.headerBgFallback]}>
              {renderHeaderContent()}
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.container}>
          <View style={styles.bottomSection}>
            {/* 오늘의 게스트하우스 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                오늘의 게스트하우스
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyGuesthouseIcon}
                  label="나의 게스트하우스 소개"
                  onPress={() => navigation.navigate('MyGuesthouseIntroList')}
                />
              </View>
            </View>
            <View style={styles.devide} />
            {/* 숙박 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                게스트하우스
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyGuesthouseIcon}
                  label="나의 게스트하우스"
                  onPress={() => navigation.navigate('MyGuesthouseList')}
                />
                <MenuItem
                  IconComponent={GuesthouseReviewIcon}
                  label="리뷰 관리"
                  onPress={() => navigation.navigate('MyGuesthouseReview')}
                />
                <MenuItem
                  IconComponent={ReservationCheckIcon}
                  label="예약 조회"
                  onPress={() => navigation.navigate('MyGuesthouseReservation')}
                />
                <MenuItem
                  IconComponent={StoreApplyIcon}
                  label="입점 신청"
                  onPress={() => navigation.navigate('StoreRegisterList')}
                />
              </View>
            </View>
            <View style={styles.devide} />
            {/* 공고 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                알바
              </Text>
              <View style={styles.menuContainer}>
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
            </View>
            <View style={styles.devide} />

            {/* 이벤트 섹션 */}
            <View style={[styles.section]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                이벤트
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyMeetIcon}
                  label="나의 이벤트"
                  onPress={() => navigation.navigate('MyMeetList')}
                />
                <MenuItem
                  IconComponent={MeetReservationCheckIcon}
                  label="이벤트 예약 조회"
                  // onPress={() => navigation.navigate('ApplicantList')}
                />
              </View>
            </View>
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
      <Text style={[styles.menuLabel]}>{label}</Text>
    </View>
    <RightArrow width={24} height={24} />
  </TouchableOpacity>
);

export default HostMyPage;
