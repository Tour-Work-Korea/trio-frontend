import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './UserReservationCheck.styles';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import useSwipeTabs from '@hooks/useSwipeTabs';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import UserCancelledReservations from './UserCancelledReservations';
import Loading from '@components/Loading';

const TABS = [
  { key: 'upcoming', label: '이용전' },
  { key: 'past', label: '이용후' },
  { key: 'cancelled', label: '취소됨' },
];

const UPCOMING_STATUS_ORDER = {
  PENDING: 0,
  CONFIRMED: 1,
};

const UserReservationCheck = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    pagerRef,
    isActive,
    onTabPress,
    pageWidth,
    onPagerLayout,
    onMomentumScrollEnd,
  } = useSwipeTabs({
    tabs: TABS,
    initialKey: 'upcoming',
  });

  useEffect(() => {
    fetchReservationList();
  }, []);

  const fetchReservationList = async () => {
    try {
      setLoading(true);
      const res = await userMyApi.getMyReservations();
      setReservations(res.data);
    } catch (error) {
      console.log('예약 목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스될 때마다 갱신
  useFocusEffect(
    useCallback(() => {
      fetchReservationList();
    }, [])
  );

  const upcomingReservations = reservations
    .filter(r => ['PENDING', 'CONFIRMED'].includes(r.reservationStatus))
    .sort((a, b) => {
      const statusOrderA = UPCOMING_STATUS_ORDER[a.reservationStatus] ?? 99;
      const statusOrderB = UPCOMING_STATUS_ORDER[b.reservationStatus] ?? 99;

      if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
      }

      return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    });

  const filteredReservations = {
    upcoming: upcomingReservations,
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
      case 'cancelled':
        return <UserCancelledReservations data={filteredReservations.cancelled} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="예약내역" />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            activeOpacity={1}
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                isActive(tab.key) && styles.activeTabText,
                isActive(tab.key) && FONTS.fs_14_semibold,
              ]}
            >
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
            pagingEnabled
            nestedScrollEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onLayout={onPagerLayout}
            onMomentumScrollEnd={onMomentumScrollEnd}
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

export default UserReservationCheck;
