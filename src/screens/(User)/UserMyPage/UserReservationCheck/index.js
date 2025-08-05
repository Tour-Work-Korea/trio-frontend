import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import Header from '@components/Header';
import styles from './UserReservationCheck.styles';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import UserCancelledReservations from './UserCancelledReservations';
import Loading from '@components/Loading';

const TABS = [
  { key: 'upcoming', label: '다가오는 예약' },
  { key: 'past', label: '지난 예약' },
  { key: 'cancelled', label: '예약취소' },
];

const UserReservationCheck = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservationList();
  }, []);

  const fetchReservationList = async () => {
    try {
      setLoading(true);

      // 임시 데이터
      const tempData = [
        {
          reservationId: 1,
          amount: 120000,
          guesthouseId: 101,
          guesthouseName: '푸른바다 게스트하우스',
          guesthouseImage: 'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg', 
          guesthouseAddress: '제주도 애월 어쩌고 저저고',
          roomName: '바다뷰 더블룸',
          reservationStatus: 'CONFIRMED',
          checkIn: '2025-08-15T14:00:00',
          checkOut: '2025-08-17T11:00:00',
          reviewed: false,
        },
        {
          reservationId: 2,
          amount: 85000,
          guesthouseId: 102,
          guesthouseName: '산속의 하늘 게스트하우스',
          guesthouseImage: 'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg',
          guesthouseAddress: '제주도 애월 어쩌고 저저고', 
          roomName: '산뷰 트윈룸',
          reservationStatus: 'COMPLETED',
          checkIn: '2025-07-20T14:00:00',
          checkOut: '2025-07-22T11:00:00',
          reviewed: true,
        },
        {
          reservationId: 3,
          amount: 95000,
          guesthouseId: 103,
          guesthouseName: '도심 속 휴식 게스트하우스',
          guesthouseImage: 'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg', 
          guesthouseAddress: '제주도 애월 어쩌고 저저고',
          roomName: '도심뷰 싱글룸',
          reservationStatus: 'CANCELLED',
          checkIn: '2025-08-10T14:00:00',
          checkOut: '2025-08-12T11:00:00',
          reviewed: false,
        },
        {
          reservationId: 4,
          amount: 80000,
          guesthouseId: 106,
          guesthouseName: '산속의 하늘 게스트하우스22',
          guesthouseImage: 'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg', 
          guesthouseAddress: '제주도 애월 어쩌고 저저고',
          roomName: '산뷰 트윈룸',
          reservationStatus: 'COMPLETED',
          checkIn: '2025-07-20T14:00:00',
          checkOut: '2025-07-22T11:00:00',
          reviewed: false,
        },
      ];

      setReservations(tempData);

      // 실제 API 호출 코드 (주석 처리)
      // const res = await userMyApi.getMyReservations();
      // setReservations(res.data);

    } catch (error) {
      console.log('예약 목록 불러오기 실패', error);
    } finally {
      setLoading(false);
    }
  };


  // const fetchReservationList = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await userMyApi.getMyReservations();
  //     setReservations(res.data);
  //   } catch (error) {
  //     console.log('예약 목록 불러오기 실패');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const filteredReservations = {
    upcoming: reservations.filter(r => r.reservationStatus === 'CONFIRMED'),
    past: reservations.filter(r => r.reservationStatus === 'COMPLETED'),
    cancelled: reservations.filter(r => r.reservationStatus === 'CANCELLED'),
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return <UserUpcomingReservations data={filteredReservations.upcoming} />;
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

export default UserReservationCheck;
