import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './UserMeetReservationCheck.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import useSwipeTabs from '@hooks/useSwipeTabs';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

const TABS = [
  {key: 'upcoming', label: i18n.t('meet.upcomingActivity')},
  {key: 'past', label: i18n.t('meet.pastActivity')},
];

const UserMeetReservationCheck = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const fromPaymentSuccess = route.params?.fromPaymentSuccess;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedReservations = useRef(false);
  const selectedTab = TABS.some(tab => tab.key === route.params?.selectedTab)
    ? route.params.selectedTab
    : 'upcoming';
  const handleTabChange = useCallback(
    key => navigation.setParams({selectedTab: key}),
    [navigation],
  );
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    swipeEnabled,
    onPagerLayout,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    webSwipeHandlers,
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: selectedTab,
    onChange: handleTabChange,
  });

  const fetchReservationList = useCallback(async () => {
    try {
      if (!hasLoadedReservations.current) {
        setLoading(true);
      }
      const {data} = await reservationPaymentApi.getPartyReservationList();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setReservations(list);
    } catch (e) {
      console.log('예약 목록 불러오기 실패', e);
    } finally {
      hasLoadedReservations.current = true;
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReservationList();
    }, [fetchReservationList]),
  );

  const handleBackPress = useCallback(() => {
    if (fromPaymentSuccess) {
      navigation.navigate('MainTabs', {screen: '마이'});
      return true;
    }
    navigation.goBack();
    return true;
  }, [fromPaymentSuccess, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!fromPaymentSuccess) {
        return undefined;
      }
      const onBackPress = () => {
        navigation.navigate('MainTabs', {screen: '마이'});
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [fromPaymentSuccess, navigation]),
  );

  // 상태별로 분리
  const filteredReservations = {
    upcoming: reservations.filter(
      r =>
        ['PENDING', 'CONFIRMED'].includes(r.reservationStatus) ||
        (r.approvalStatus === 'REJECTED' &&
          dayjs(r.startDateTime).isAfter(dayjs())),
    ),
    past: reservations.filter(r => r.reservationStatus === 'COMPLETED'),
    cancelled: reservations.filter(r => r.reservationStatus === 'CANCELLED'),
  };

  const renderTabContent = tabKey => {
    switch (tabKey) {
      case 'upcoming':
        return (
          <UserUpcomingReservations
            data={filteredReservations.upcoming}
            onRefresh={fetchReservationList}
          />
        );

      case 'past':
        return <UserPastReservations data={filteredReservations.past} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('meet.activityApplicationDetails')}
        onPress={fromPaymentSuccess ? handleBackPress : null}
      />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabPress(index)}>
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                isActive(tab.key) && styles.activeTabText,
                isActive(tab.key) && FONTS.fs_14_semibold,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 내용 */}
      <View style={styles.tabContentContainer}>
        {loading ? (
          <Loading title={t('common.loadingTheReservationList')} />
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            scrollEnabled={swipeEnabled}
            directionalLockEnabled
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onPagerLayout}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={styles.tabPagerContent}
            {...webSwipeHandlers}
            style={styles.tabPager}>
            {TABS.map(tab => (
              <View
                key={tab.key}
                style={[styles.tabPage, pageWidth > 0 && {width: pageWidth}]}>
                {renderTabContent(tab.key)}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default UserMeetReservationCheck;
