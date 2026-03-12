import React, {useMemo} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
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
import useSwipeTabs from '@hooks/useSwipeTabs';

import MapIcon from '@assets/images/map_blue';
import BackBtn from '@assets/images/chevron_left_black';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

const TAB = {
  EVENTS: '이벤트 목록',
  STAFF: '스탭 공고',
  REVIEWS: '리뷰',
};

const HostProfilePage = () => {
  const navigation = useNavigation();
  const {width: screenWidth} = useWindowDimensions();

  const tabs = useMemo(
    () => [
      {key: 'events', label: TAB.EVENTS},
      {key: 'staff', label: TAB.STAFF},
      {key: 'reviews', label: TAB.REVIEWS},
    ],
    [],
  );
  const {
    pagerRef,
    isActive,
    setKey,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs,
    initialKey: 'events',
  });

  // ✅ 임시 데이터 (나중에 API 붙이면 여기만 교체하면 됨)
  const host = useMemo(
    () => ({
      name: '이상한밤 게스트하우스',
      intro:
        '잔잔하고 따뜻한 소규모 게스트하우스 ‘이상한밤’ 입니다.\n처음 만난 사람들과도 나눌 수 있는 또 다른 즐거움,\n이야깃거리가 되는 소소한 이벤트들을 통해 서로가 조금 더 편해지는 새로운 공간을 만들어가고 있습니다.',
      address: '제주시 흥운길 25-7 1층',
      photoUrl: null,
    }),
    [],
  );
  const hasHeaderImage = Boolean(host?.photoUrl);

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

        <Text style={[FONTS.fs_16_semibold, styles.guesthouseNameText]}>
          이상한밤 게스트하우스
        </Text>
      </View>
    </>
  );

  const handlePressReservation = () => {
    // 예: navigation.navigate('GuesthouseReservation', { guesthouseId: ... })
    // navigation.navigate('GuesthouseReservation');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 상단 배경 */}
        {hasHeaderImage ? (
          <ImageBackground
            source={{uri: host.photoUrl}}
            style={styles.headerBg}
            resizeMode="cover">
            {renderHeaderContent()}
          </ImageBackground>
        ) : (
          <View style={[styles.headerBg, styles.headerBgFallback]}>
            {renderHeaderContent()}
          </View>
        )}

        {/* 포스트 팔로워 리뷰 */}
        <View style={styles.contentContainer}>
          <View style={styles.sectionRow}>
            <View style={styles.section}>
              <Text style={[styles.countText, FONTS.fs_14_medium]}>10</Text>
              <Text style={[styles.sectionText, FONTS.fs_14_medium]}>포스트</Text>
            </View>
            <View style={styles.section}>
              <Text style={[styles.countText, FONTS.fs_14_medium]}>12</Text>
              <Text style={[styles.sectionText, FONTS.fs_14_medium]}>팔로워</Text>
            </View>
            <View style={styles.section}>
              <Text style={[styles.countText, FONTS.fs_14_medium]}>5</Text>
              <Text style={[styles.sectionText, FONTS.fs_14_medium]}>리뷰</Text>
            </View>
          </View>
          <View style={styles.hostBtnContainer}>
            <ButtonWhite
              title="프로필 편집"
              onPress={handlePressReservation}
              backgroundColor={COLORS.grayscale_100}
              textColor={COLORS.grayscale_700}
              style={{flex: 1}}
            />
            <ButtonWhite
              title="숙소 정보"
              onPress={handlePressReservation}
              backgroundColor={COLORS.grayscale_100}
              textColor={COLORS.grayscale_700}
              style={{flex: 1}}
            />
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
                onPress={() => setKey(tab.key)}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.tabText,
                    active && styles.tabTextActive,
                  ]}>
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
            onLayout={onPagerLayout}
            onMomentumScrollEnd={onMomentumScrollEnd}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={[styles.tabPage, {width: screenWidth}]}>
              <HostProfileEvents />
            </View>
            <View style={[styles.tabPage, {width: screenWidth}]}>
              <HostProfileStaff />
            </View>
            <View style={[styles.tabPage, {width: screenWidth}]}>
              <HostProfileReviews />
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default HostProfilePage;
