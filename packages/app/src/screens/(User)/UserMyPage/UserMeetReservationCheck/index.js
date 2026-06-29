import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, BackHandler, ScrollView} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import styles from './UserMeetReservationCheck.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import useSwipeTabs from '@hooks/useSwipeTabs';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

const TABS = [
  {key: 'upcoming', label: '다가오는 콘텐츠'},
  {key: 'past', label: '지난 콘텐츠'},
];

const UserMeetReservationCheck = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fromPaymentSuccess = route.params?.fromPaymentSuccess;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
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
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: 'upcoming',
  });

  const fetchReservationList = useCallback(async () => {
    try {
      setLoading(true);
      const {data} = await reservationPaymentApi.getPartyReservationList();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setReservations(list);
    } catch (e) {
      console.log('예약 목록 불러오기 실패', e);
    } finally {
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
    upcoming: reservations.filter(r =>
      ['PENDING', 'CONFIRMED'].includes(r.reservationStatus),
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
        title="콘텐츠 신청내역"
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
          <Loading title="예약 목록을 불러오고 있어요." />
        ) : (
          <ScrollView
            ref={pagerRef}
            horizontal
            scrollEnabled={swipeEnabled}
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onPagerLayout}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
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
