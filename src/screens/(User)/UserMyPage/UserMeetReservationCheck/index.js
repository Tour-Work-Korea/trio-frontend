import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 

import styles from './UserMeetReservationCheck.styles';
import Header from '@components/Header'; 
import {FONTS} from '@constants/fonts'; 

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import UserCancelledReservations from './UserCancelledReservations';
import Loading from '@components/Loading';

const TABS = [
  { key: 'upcoming', label: '다가오는 예약' },
  { key: 'past', label: '지난 예약' },
  { key: 'cancelled', label: '예약취소' },
];

export const MOCK_RESERVATIONS = [
  // 다가오는 예약
  {
    id: 1,
    guesthouseName: '제주 바다뷰 게스트하우스',
    roomName: '4인 도미토리',
    checkIn: '2025-09-21',
    checkOut: '2025-09-23',
    guestCount: 2,
    amount: 88000,
    reservationStatus: 'CONFIRMED', // upcoming
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 2,
    guesthouseName: '한라산 베이스캠프',
    roomName: '2인 프라이빗룸',
    checkIn: '2025-09-25',
    checkOut: '2025-09-26',
    guestCount: 1,
    amount: 55000,
    reservationStatus: 'CONFIRMED',
    image: require('@assets/images/exphoto.jpeg'),
  },

  // 지난 예약
  {
    id: 3,
    guesthouseName: '서귀포 힐링하우스',
    roomName: '6인 도미토리',
    checkIn: '2025-08-15',
    checkOut: '2025-08-17',
    guestCount: 3,
    amount: 120000,
    reservationStatus: 'COMPLETED', // past
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 4,
    guesthouseName: '우도 선셋 게스트하우스',
    roomName: '트윈룸',
    checkIn: '2025-08-01',
    checkOut: '2025-08-02',
    guestCount: 2,
    amount: 70000,
    reservationStatus: 'COMPLETED',
    image: require('@assets/images/exphoto.jpeg'),
  },

  // 취소된 예약
  {
    id: 5,
    guesthouseName: '제주시 도심 게스트하우스',
    roomName: '더블룸',
    checkIn: '2025-09-10',
    checkOut: '2025-09-12',
    guestCount: 1,
    amount: 60000,
    reservationStatus: 'CANCELLED',
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 6,
    guesthouseName: '애월 바닷가 게스트하우스',
    roomName: '4인 도미토리',
    checkIn: '2025-09-05',
    checkOut: '2025-09-06',
    guestCount: 2,
    amount: 50000,
    reservationStatus: 'CANCELLED',
    image: require('@assets/images/exphoto.jpeg'),
  },
];

const UserMeetReservationCheck = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모크 데이터 불러오기 (실제 API라면 fetchReservationList 호출)
  const fetchReservationList = useCallback(async () => {
    try {
      setLoading(true);
      // 네트워크 호출 대신 모크 데이터 주입
      await new Promise(r => setTimeout(r, 300));
      setReservations(MOCK_RESERVATIONS);
    } catch (e) {
      console.log('예약 목록 불러오기 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservationList();
  }, [fetchReservationList]);

  // 상태별로 분리
  const filteredReservations = {
    upcoming: reservations.filter(r => r.reservationStatus === 'CONFIRMED'),
    past: reservations.filter(r => r.reservationStatus === 'COMPLETED'),
    cancelled: reservations.filter(r => r.reservationStatus === 'CANCELLED'),
  };

  const renderTabContent = () => {
    switch (activeTab) {
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
      <Header title='모임 예약내역' />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                activeTab === tab.key && styles.activeTabText,
                activeTab === tab.key && FONTS.fs_14_semibold,
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
          renderTabContent()
        )}
      </View>
      
    </View>
  );
};

export default UserMeetReservationCheck;
