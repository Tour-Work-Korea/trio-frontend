import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './HostProfilePage.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';

import HostProfileEvents from './HostProfileEvents';
import HostProfileStaff from './HostProfileStaff';
import HostProfileReviews from './HostProfileReviews';
import useUserStore from '@stores/userStore';
import guesthouseProfileApi from '@utils/api/guesthouseProfileApi';
import Avatar from '@components/Avatar';

import BackBtn from '@assets/images/chevron_left_black';

const TAB = {
  EVENTS: '콘텐츠',
  STAFF: '스탭 공고',
  REVIEWS: '리뷰',
};

const HostProfilePage = ({route}) => {
  const navigation = useNavigation();
  const isHostMy = Boolean(route?.params?.isHostMy);
  const routeGuesthouseId = Number(route?.params?.guesthouseId);
  const {width: screenWidth} = useWindowDimensions();
  const pagerRef = useRef(null);
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedHostGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const [profileCounts, setProfileCounts] = useState({
    postsCount: 0,
    followCount: 0,
    reviewCount: 0,
  });
  const [profileSummary, setProfileSummary] = useState(null);

  const tabs = useMemo(
    () => [
      {key: 'events', label: TAB.EVENTS},
      {key: 'staff', label: TAB.STAFF},
      {key: 'reviews', label: TAB.REVIEWS},
    ],
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const isActive = key => tabs[activeIndex]?.key === key;

  const selectedGuesthouse = useMemo(() => {
    const profiles = Array.isArray(hostProfile?.guesthouseProfiles)
      ? hostProfile.guesthouseProfiles
      : [];

    if (!profiles.length) {
      return null;
    }

    const current =
      profiles.find(
        (item, index) =>
          String(item?.guesthouseId ?? `guesthouse-${index}`) ===
          String(selectedHostGuesthouseId),
      ) || profiles[0];

    return {
      guesthouseId: current?.guesthouseId ?? null,
      guesthouseName: current?.guesthouseName || '이름 없음',
      profileImageUrl: current?.profileImageUrl || null,
    };
  }, [hostProfile?.guesthouseProfiles, selectedHostGuesthouseId]);

  const effectiveGuesthouseId = useMemo(() => {
    if (!isHostMy && Number.isFinite(routeGuesthouseId) && routeGuesthouseId > 0) {
      return routeGuesthouseId;
    }

    const id = Number(selectedGuesthouse?.guesthouseId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [isHostMy, routeGuesthouseId, selectedGuesthouse?.guesthouseId]);

  const displayedGuesthouse = useMemo(() => {
    if (isHostMy) return selectedGuesthouse;

    return {
      guesthouseId: Number(profileSummary?.guesthouseId) || effectiveGuesthouseId || null,
      guesthouseName: profileSummary?.guesthouseName || selectedGuesthouse?.guesthouseName || '이름 없음',
      profileImageUrl: profileSummary?.profileImageUrl || selectedGuesthouse?.profileImageUrl || null,
    };
  }, [isHostMy, selectedGuesthouse, profileSummary, effectiveGuesthouseId]);

  const hasHeaderImage = Boolean(displayedGuesthouse?.profileImageUrl);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileCounts = async () => {
      const guesthouseId = effectiveGuesthouseId;
      if (!guesthouseId) {
        if (isMounted) {
          setProfileSummary(null);
          setProfileCounts({postsCount: 0, followCount: 0, reviewCount: 0});
        }
        return;
      }

      try {
        const res = await guesthouseProfileApi.getGuesthouseProfile(guesthouseId);
        if (!isMounted) return;
        const data = res?.data ?? {};

        setProfileSummary(data?.profileSummary ?? null);
        setProfileCounts({
          postsCount: Number(data?.postsCount ?? 0),
          followCount: Number(data?.followCount ?? 0),
          reviewCount: Number(data?.reviewCount ?? 0),
        });
      } catch (error) {
        if (isMounted) {
          setProfileSummary(null);
          setProfileCounts({postsCount: 0, followCount: 0, reviewCount: 0});
        }
      }
    };

    fetchProfileCounts();

    return () => {
      isMounted = false;
    };
  }, [effectiveGuesthouseId]);

  const renderHeaderContent = () => (
    <>
      {hasHeaderImage && <View style={styles.headerOverlay} />}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <BackBtn width={28} height={28}/>
      </TouchableOpacity>

      {/* 프로필 영역 */}
      <View style={styles.profileWrap}>

        <View style={styles.profileImageWrap}>
          <Avatar uri={displayedGuesthouse?.profileImageUrl} size={80} iconSize={32} />
        </View>

        <Text style={[FONTS.fs_16_semibold, styles.guesthouseNameText]}>
          {displayedGuesthouse?.guesthouseName || '이름 없음'}
        </Text>
      </View>
    </>
  );

  // 유저일 때 객실 예약
  const handlePressReservation = () => {
    const guesthouseId = Number(effectiveGuesthouseId);
    if (!Number.isFinite(guesthouseId) || guesthouseId <= 0) return;

    const formatDate = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkInDate = new Date();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 1);

    navigation.navigate('GuesthouseDetail', {
      id: guesthouseId,
      checkIn: formatDate(checkInDate),
      checkOut: formatDate(checkOutDate),
      guestCount: 1,
      isFromDeeplink: false,
    });
  };

  // 호스트일 때 프로필 편집
  const handlePressEditProfile = () => {
    navigation.navigate('HostEditProfile');
  };

  // 호스트일 때 숙소정보
  const handlePressGuesthouseInfo = () => {
    navigation.navigate('MyGuesthouseList');
  };
  
  const handlePressTab = tabKey => {
    const tabIndex = tabs.findIndex(tab => tab.key === tabKey);
    if (tabIndex < 0) return;
    setActiveIndex(tabIndex);
    pagerRef.current?.scrollTo?.({
      x: tabIndex * screenWidth,
      y: 0,
      animated: true,
    });
  };
  const handleMomentumScrollEnd = event => {
    const offsetX = Number(event?.nativeEvent?.contentOffset?.x ?? 0);
    const nextIndex = Math.round(offsetX / screenWidth);
    if (nextIndex >= 0 && nextIndex < tabs.length) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 프로필 */}
      <View style={[styles.headerBg, styles.headerBgFallback]}>
        {renderHeaderContent()}
      </View>

      {/* 포스트 팔로워 리뷰 */}
      <View style={styles.contentContainer}>
        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={[styles.countText, FONTS.fs_14_medium]}>
              {profileCounts.postsCount}
            </Text>
            <Text style={[styles.sectionText, FONTS.fs_14_medium]}>포스트</Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.countText, FONTS.fs_14_medium]}>
              {profileCounts.followCount}
            </Text>
            <Text style={[styles.sectionText, FONTS.fs_14_medium]}>팔로워</Text>
          </View>
          <View style={styles.section}>
            <Text style={[styles.countText, FONTS.fs_14_medium]}>
              {profileCounts.reviewCount}
            </Text>
            <Text style={[styles.sectionText, FONTS.fs_14_medium]}>리뷰</Text>
          </View>
        </View>
        <View style={styles.hostBtnContainer}>
          {isHostMy ? (
            <>
              <ButtonWhite
                title="프로필 편집"
                onPress={handlePressEditProfile}
                backgroundColor={COLORS.grayscale_100}
                textColor={COLORS.grayscale_700}
                style={{flex: 1}}
              />
              <ButtonWhite
                title="숙소 정보"
                onPress={handlePressGuesthouseInfo}
                backgroundColor={COLORS.grayscale_100}
                textColor={COLORS.grayscale_700}
                style={{flex: 1}}
              />
            </>
          ) : (
            <ButtonWhite
              title="객실 예약"
              onPress={handlePressReservation}
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              style={{flex: 1}}
            />
          )}
        </View>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const active = isActive(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                active && styles.tabItemActive,
              ]}
              onPress={() => handlePressTab(tab.key)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tabText,
                  active && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {active ? <View style={styles.tabIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 탭 내용 */}
      <View style={styles.tabContentWrapper}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={handleMomentumScrollEnd}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View style={[styles.tabPage, {width: screenWidth}]}>
            <HostProfileEvents guesthouseId={effectiveGuesthouseId} />
          </View>
          <View style={[styles.tabPage, {width: screenWidth}]}>
            <HostProfileStaff guesthouseId={effectiveGuesthouseId} />
          </View>
          <View style={[styles.tabPage, {width: screenWidth}]}>
            <HostProfileReviews guesthouseId={effectiveGuesthouseId} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default HostProfilePage;
