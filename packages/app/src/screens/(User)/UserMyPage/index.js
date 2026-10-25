import {companionEnabled} from '../../../features/companion/api';
import CompanionIcon from '@assets/images/companion_orange.svg';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import ReservationCheckIcon from '@assets/images/user-reservation-check-icon.svg';
import GuesthouseReviewIcon from '@assets/images/user-guesthouse-review-icon.svg';
import MyApplicationIcon from '@assets/images/user-my-application-icon.svg';
import ApplicationStatusIcon from '@assets/images/user-application-status-icon.svg';
import FavoritePostIcon from '@assets/images/user-favorite-post-icon.svg';
import FavoriteMeetIcon from '@assets/images/user-favorite-meet-icon.svg';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import SettingIcon from '@assets/images/settings_gray.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import CommentIcon from '@assets/images/comment_black.svg';
import CouponIcon from '@assets/images/coupon_black.svg';
import PointIcon from '@assets/images/point_black.svg';
import HeartIcon from '@assets/images/heart_black.svg';
import Avatar from '@components/Avatar';

import styles from './UserMyPage.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import notificationApi from '@utils/api/notificationApi';
import userEmployApi from '@utils/api/userEmployApi';
import userMeetApi from '@utils/api/userMeetApi';
import {isUserNotification} from '@utils/notifications';
import {formatNumber} from '@utils/localeFormat';

const extractNotificationItems = data =>
  Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

const REVIEW_BUBBLE_DISMISSED_COUNT_KEY =
  'trio:my-review-bubble-dismissed-count';

const UserMyPage = () => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewableCount, setReviewableCount] = useState(0);
  const [showReviewBubble, setShowReviewBubble] = useState(
    Platform.OS !== 'web',
  );
  const [couponCount, setCouponCount] = useState(0);
  const [pointBalance, setPointBalance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // 저장된 유저 프로필 호출
  const user = useUserStore(state => state.userProfile);
  const hasMbti = user.mbti && user.mbti !== 'DEFAULT';
  const ageValue = Number(user.age);
  const ageGroup =
    Number.isFinite(ageValue) && ageValue > 0
      ? t('myPage.value', {value1: Math.floor(ageValue / 10) * 10})
      : null;
  const birthYear = String(user.birthDate ?? '').match(/^\d{4}/)?.[0];
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
  const ageOrBirthYear = currentLanguage?.startsWith('en')
    ? birthYear?.slice(-2) ?? ageGroup
    : ageGroup;
  const profileMeta = [
    ageOrBirthYear,
    user.gender === 'F' ? t('common.female') : t('common.male'),
    hasMbti ? user.mbti : null,
  ].filter(Boolean);
  const hasInstagramId =
    user.instagramId &&
    user.instagramId !== '@ID를 추가해주세요' &&
    user.instagramId !== 'ID를 추가해주세요';
  const instagramText = hasInstagramId
    ? `@${user.instagramId}`
    : t('myPage.pleaseAddId');
  const formattedPointBalance = Number(pointBalance || 0).toLocaleString(
    'ko-KR',
  );
  const reviewRewardPoint = formatNumber(reviewableCount * 1000);

  const goToEditProfile = () => {
    navigation.navigate('UserEditProfile', {
      userInfo: user,
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (reviewableCount <= 0) {
      setShowReviewBubble(false);
      return;
    }

    const dismissedCount = Number(
      window.localStorage?.getItem(REVIEW_BUBBLE_DISMISSED_COUNT_KEY) ?? 0,
    );
    setShowReviewBubble(
      !Number.isFinite(dismissedCount) || dismissedCount < reviewableCount,
    );
  }, [reviewableCount]);

  const closeReviewBubble = () => {
    if (Platform.OS === 'web') {
      window.localStorage?.setItem(
        REVIEW_BUBBLE_DISMISSED_COUNT_KEY,
        String(reviewableCount),
      );
    }

    setShowReviewBubble(false);
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchMyPageData = async () => {
        try {
          const [
            reviewsRes,
            couponsRes,
            pointRes,
            notificationsRes,
            favoritesRes,
            favoritePartiesRes,
            favoriteRecruitsRes,
          ] = await Promise.all([
            userMyApi.getMyReviews(),
            userMyApi.getMyCoupons(),
            userMyApi.getPointBalance(),
            notificationApi.getMyNotifications(0, 100),
            userMyApi.getMyFavoriteGuesthouses(),
            userMeetApi.getFavoriteParties(),
            userEmployApi.getLikeRecruits(),
          ]);
          if (!isActive) {
            return;
          }

          const reviewsData = reviewsRes.data;
          const reviewedCount = Number(reviewsData?.reviewedCount);
          const nextReviewableCount = Number(reviewsData?.reviewableCount);
          const reviewItems = Array.isArray(reviewsData?.reviews)
            ? reviewsData.reviews
            : Array.isArray(reviewsData)
            ? reviewsData
            : [];

          setReviewCount(
            Number.isFinite(reviewedCount)
              ? reviewedCount
              : reviewItems.filter(item => item.isReviewed).length,
          );
          setReviewableCount(
            Number.isFinite(nextReviewableCount)
              ? nextReviewableCount
              : reviewItems.filter(item => !item.isReviewed).length,
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

          const totalFavorites =
            (Array.isArray(favoritesRes.data) ? favoritesRes.data.length : 0) +
            (Array.isArray(favoritePartiesRes.data)
              ? favoritePartiesRes.data.length
              : 0) +
            (Array.isArray(favoriteRecruitsRes.data)
              ? favoriteRecruitsRes.data.length
              : 0);

          setFavoriteCount(totalFavorites);
        } catch (error) {
          if (!isActive) {
            return;
          }
          console.warn('마이페이지 데이터 조회 실패:', error);
          setReviewCount(0);
          setReviewableCount(0);
          setCouponCount(0);
          setPointBalance(0);
          setUnreadCount(0);
          setFavoriteCount(0);
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
        <Text style={[FONTS.fs_20_semibold]}>{t('myPage.myPage')}</Text>

        <View style={styles.topBarRightIcons}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.topBarIconButton}
            onPress={() => navigation.navigate('NotificationCenter')}>
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
            activeOpacity={1}
            style={styles.topBarIconButton}
            onPress={() => navigation.navigate('Setting')}>
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
                style={[
                  styles.profileImage,
                  currentLanguage?.startsWith('en') &&
                    styles.englishProfileImage,
                ]}
              />

              <View style={styles.profileContent}>
                <View style={styles.profileHeader}>
                  <View
                    style={[
                      styles.profileTextGroup,
                      currentLanguage?.startsWith('en') &&
                        styles.englishProfileTextGroup,
                    ]}>
                    <View style={styles.profileTextSection}>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.profileSectionTitle,
                          currentLanguage?.startsWith('en') &&
                            styles.englishProfileSectionTitle,
                        ]}>
                        {t('common.nickname')}
                      </Text>
                      <Text style={[FONTS.fs_18_semibold, styles.name]}>
                        {user.nickname}
                      </Text>
                    </View>
                    <View style={styles.profileTextSection}>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.profileSectionTitle,
                          currentLanguage?.startsWith('en') &&
                            styles.englishProfileSectionTitle,
                        ]}>
                        {t('myPage.information')}
                      </Text>
                      <Text style={[FONTS.fs_12_medium, styles.profileMeta]}>
                        {profileMeta.join('/')}
                      </Text>
                    </View>
                    <View style={styles.profileTextSection}>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.profileSectionTitle,
                          currentLanguage?.startsWith('en') &&
                            styles.englishProfileSectionTitle,
                        ]}>
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
                    activeOpacity={1}
                    style={[
                      styles.profileEdit,
                      currentLanguage?.startsWith('en') &&
                        styles.englishProfileEdit,
                    ]}
                    onPress={goToEditProfile}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                      numberOfLines={1}
                      style={[
                        FONTS.fs_14_medium,
                        styles.profileEditText,
                        currentLanguage?.startsWith('en') &&
                          styles.englishProfileEditText,
                      ]}>
                      {t('common.myInformation')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* 유저 프로모션 섹션 */}
          <View style={styles.promoContainer}>
            <View style={styles.reviewPromoWrapper}>
              {reviewableCount > 0 && showReviewBubble ? (
                <View style={styles.reviewBubble}>
                  <View style={styles.reviewBubbleContent}>
                    <Text
                      style={[FONTS.fs_14_semibold, styles.reviewBubbleText]}
                      numberOfLines={2}>
                      {t('myPage.reviewReward', {points: reviewRewardPoint})}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.reviewBubbleClose}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    onPress={closeReviewBubble}>
                    <Text style={styles.reviewBubbleCloseText}>X</Text>
                  </TouchableOpacity>
                  <View style={styles.reviewBubbleTail} />
                </View>
              ) : null}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.promoSection}
                onPress={() => navigation.navigate('UserGuesthouseReview')}>
                <CommentIcon width={20} height={20} />
                <Text style={[FONTS.fs_14_medium]}>{t('common.myReview')}</Text>
                <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                  {reviewCount}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.promoSection}
              onPress={() => navigation.navigate('MyCouponList')}>
              <CouponIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium]}>{t('common.coupon')}</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {couponCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.promoSection}
              onPress={() => navigation.navigate('MyPoint')}>
              <PointIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium]}>{t('common.point')}</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {formattedPointBalance}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.promoSection}
              onPress={() => navigation.navigate('UserFavorite')}>
              <HeartIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium]}>{t('common.steamed')}</Text>
              <Text style={[FONTS.fs_14_semibold, styles.promoSectionText]}>
                {favoriteCount}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSection}>
            {/* 예약 내역 섹션 */}
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                {t('myPage.reservationDetails')}
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={ReservationCheckIcon}
                  label={t('common.accommodation_fe9320')}
                  onPress={() => navigation.navigate('UserReservationCheck')}
                />

                <View style={styles.menuContainer}>
                  <MenuItem
                    IconComponent={GuesthouseReviewIcon}
                    label={t('common.activity')}
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
                {t('common.staff')}
              </Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  IconComponent={MyApplicationIcon}
                  label={t('common.myResume')}
                  onPress={() => navigation.navigate('MyResumeList')}
                />

                <MenuItem
                  IconComponent={ApplicationStatusIcon}
                  label={t('common.supportStatus')}
                  onPress={() => navigation.navigate('MyApplicantList')}
                />
              </View>
            </View>

            <View style={styles.devide} />

            {/* 커뮤니티 섹션 */}
            <View style={[styles.section]}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                {t('common.community')}
              </Text>
              <View style={styles.menuContainer}>
                {companionEnabled && (
                  <MenuItem
                    IconComponent={CompanionIcon}
                    label={t('companion.my')}
                    onPress={() => navigation.navigate('MyCompanions')}
                  />
                )}
                <MenuItem
                  IconComponent={FavoritePostIcon}
                  label={t('common.whatIWrote')}
                  onPress={() => navigation.navigate('MyCommunityPostList')}
                />

                <MenuItem
                  IconComponent={FavoriteMeetIcon}
                  label={t('common.commentIWrote')}
                  onPress={() => navigation.navigate('MyCommunityCommentList')}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.licenseLink}
            onPress={() => navigation.navigate('OpenSourceLicenses')}>
            <Text style={[FONTS.fs_12_medium, styles.licenseLinkText]}>
              {t('common.openSourceLicense')}
            </Text>
            <RightArrow width={14} height={14} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({IconComponent, label, onPress}) => (
  <TouchableOpacity activeOpacity={1} style={styles.menuItem} onPress={onPress}>
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
