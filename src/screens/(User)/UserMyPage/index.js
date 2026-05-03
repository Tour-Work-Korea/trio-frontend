import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

import ReservationCheckIcon from '@assets/images/user-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/user-guesthouse-review-icon.svg';
import MyApplicationIcon from '@assets/images/user-my-application-icon.svg';
import ApplicationStatusIcon from '@assets/images/user-application-status-icon.svg';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import SettingIcon from '@assets/images/settings_gray.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import CommentIcon from '@assets/images/comment_black.svg';
import CouponIcon from '@assets/images/coupon_black.svg';
import PointIcon from '@assets/images/point_black.svg';
import Avatar from '@components/Avatar';

import styles from './UserMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import notificationApi from '@utils/api/notificationApi';
import {isUserNotification} from '@utils/notifications';

const extractNotificationItems = data =>
  Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

const myPageBannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-6098454400067335/4619471702',
      android: 'ca-app-pub-6098454400067335/5920208998',
    });

const UserMyPage = () => {
  const navigation = useNavigation();
  const [reviewCount, setReviewCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [pointBalance, setPointBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // 저장된 유저 프로필 호출
  const user = useUserStore(state => state.userProfile);
  const hasMbti = user.mbti && user.mbti !== 'DEFAULT';
  const ageValue = Number(user.age);
  const ageGroup =
    Number.isFinite(ageValue) && ageValue > 0
      ? `${Math.floor(ageValue / 10) * 10}대`
      : null;
  const profileMeta = [
    ageGroup,
    user.gender === 'F' ? '여성' : '남성',
    hasMbti ? user.mbti : null,
  ].filter(Boolean);
  const instagramText =
    user.instagramId === '@ID를 추가해주세요'
      ? user.instagramId
      : `@${user.instagramId}`;
  const formattedPointBalance = Number(pointBalance || 0).toLocaleString('ko-KR');

  const goToEditProfile = () => {
    navigation.navigate('UserEditProfile', {
      userInfo: user,
    });
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchMyPageData = async () => {
        try {
          const [reviewsRes, couponsRes, pointRes, notificationsRes] =
            await Promise.all([
              userMyApi.getMyReviews(),
              userMyApi.getMyCoupons(),
              userMyApi.getPointBalance(),
              notificationApi.getMyNotifications(0, 100),
            ]);
          if (!isActive) {
            return;
          }

          setReviewCount(
            Array.isArray(reviewsRes.data) ? reviewsRes.data.length : 0,
          );
          setCouponCount(
            Array.isArray(couponsRes.data) ? couponsRes.data.length : 0,
          );
          setPointBalance(pointRes?.data?.currentPoints ?? 0);
          setUnreadCount(
            extractNotificationItems(notificationsRes.data).filter(
              item => isUserNotification(item) && !item?.isRead,
            ).length,
          );
        } catch (error) {
          if (!isActive) {
            return;
          }
          console.warn('마이페이지 데이터 조회 실패:', error);
          setReviewCount(0);
          setCouponCount(0);
          setPointBalance(0);
          setUnreadCount(0);
        }
      };

      fetchMyPageData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={styles.view}>
      <View style={styles.topBarContainer}>
        <Text style={[FONTS.fs_20_semibold]}>마이페이지</Text>

        <View style={styles.topBarRightIcons}>
          <TouchableOpacity
            style={styles.topBarIconButton}
            onPress={() => navigation.navigate('NotificationCenter')}
            activeOpacity={0.8}>
            <BellIcon width={20} height={20} />
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarIconButton}
            onPress={() => navigation.navigate('Setting')}
            activeOpacity={0.8}>
            <SettingIcon width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.outContainer}>
        <View style={styles.container}>
          {/* 유저 프로필 */}
          <View style={styles.userInfoContainer}>
            <View style={styles.profileContainer}>
              <Avatar
                uri={user.photoUrl}
                size={88}
                iconSize={24}
                borderRadius={58}
                style={styles.profileImage}
              />
              <View style={styles.profileContent}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileTextGroup}>
                    <View style={styles.profileTextSection}>
                      <Text style={[FONTS.fs_12_medium, styles.profileSectionTitle]}>
                        닉네임
                      </Text>
                      <Text style={[FONTS.fs_18_semibold, styles.name]}>
                        {user.nickname}
                      </Text>
                    </View>
                    <View style={styles.profileTextSection}>
                      <Text style={[FONTS.fs_12_medium, styles.profileSectionTitle]}>
                        정보
                      </Text>
                      <Text style={[FONTS.fs_12_medium, styles.profileMeta]}>
                        {profileMeta.join('/')}
                      </Text>
                    </View>
                    <View style={styles.profileTextSection}>
                      <Text style={[FONTS.fs_12_medium, styles.profileSectionTitle]}>
                        insta
                      </Text>
                      <Text
                        style={[FONTS.fs_12_medium, styles.profileInstagram]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {instagramText}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.profileEdit}
                    onPress={goToEditProfile}>
                    <Text style={[FONTS.fs_14_medium, styles.profileEditText]}>
                      내 정보
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* 유저 프로모션 섹션 */}
          <View style={styles.promoContainer}>
            <TouchableOpacity
              style={styles.promoSection}
              onPress={() => navigation.navigate('UserGuesthouseReview')}
            >
              <CommentIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium]}>내 리뷰</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {reviewCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promoSection}
              onPress={() => navigation.navigate('MyCouponList')}
            >
              <CouponIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium]}>쿠폰</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {couponCount}
              </Text>
            </TouchableOpacity>
            <View style={styles.promoSection}>
              <PointIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium]}>포인트</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {formattedPointBalance}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            {/* 예약 내역 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                예약 내역
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={ReservationCheckIcon}
                  label="숙소"
                  onPress={() => navigation.navigate('UserReservationCheck')}
                />
                <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={GuesthouseReviewIcon}
                  label="콘텐츠"
                  onPress={() =>
                    navigation.navigate('UserMeetReservationCheck')
                  }
                />
              </View>
              </View>
            </View>

            <View style={styles.devide} />

            {/* 공고 섹션 */}
            <View style={[styles.section, styles.staffSection]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                스탭
              </Text>
              <View style={styles.menuContainer}>
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
          </View>
        </View>
      </ScrollView>
      <View style={styles.adBannerContainer}>
        <BannerAd
          unitId={myPageBannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>
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
