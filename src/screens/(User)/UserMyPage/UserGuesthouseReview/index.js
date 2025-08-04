import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import Header from '@components/Header';
import styles from './UserGuesthouseReview.styles';
import { FONTS } from '@constants/fonts';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

import UserGuesthouseReviewWrite from './UserGuesthouseReviewWrite';
import UserGuesthouseReviewList from './UserGuesthouseReviewList';

const TABS = [
  { key: 'write', label: '리뷰쓰기' },
  { key: 'written', label: '작성한 리뷰' },
];

const UserGuesthouseReview = () => {
  const [activeTab, setActiveTab] = useState('write');
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
          reservationId: 2,
          amount: 85000,
          guesthouseId: 102,
          guesthouseName: '산속의 하늘 게스트하우스',
          guesthouseImage: 'https://cdn.pixabay.com/photo/2024/07/17/08/53/sunrise-8901014_1280.jpg', 
          roomName: '산뷰 트윈룸',
          reservationStatus: 'COMPLETED',
          checkIn: '2025-07-20T14:00:00',
          checkOut: '2025-07-22T11:00:00',
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

  const renderTabContent = () => {
    if (activeTab === 'write') {
      // COMPLETED 상태만 필터링
      const completedReservations = reservations.filter(
        (item) => item.reservationStatus === 'COMPLETED'
      );
      return <UserGuesthouseReviewWrite reservations={completedReservations} />;
    } else if (activeTab === 'written') {
      return <UserGuesthouseReviewList />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="나의 게하 리뷰" />

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
          <Loading title="리뷰 목록을 불러오고 있어요." />
        ) : (
          renderTabContent()
        )}
      </View>
    </View>
  );
};

export default UserGuesthouseReview;
