import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

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

// 랜덤 유틸
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

// 오늘~7일 뒤 사이의 임의 시간 생성
const randomDateTimeWithin7Days = () => {
  const dayOffset = randInt(0, 7);               // 오늘 ~ +7일
  const hour = randInt(9, 22);                   // 09~22시
  const minute = pick([0, 10, 20, 30, 40, 50]);  // 10분 단위
  return dayjs().startOf('day').add(dayOffset, 'day').hour(hour).minute(minute).second(0);
};

// 모임명 더미
const PARTY_NAMES = [
  '제주 선셋 바베큐 파티',
  '야간 번개 모임',
  '보드게임 & 맥주',
  '새벽 바다 산책',
  '별멍 감성 파티',
  '함께하는 사진 산책',
];

// 게스트하우스 더미
const GUESTHOUSE_IDS = [101, 102, 103, 104, 105];

// ✅ 요구 스키마로 N개 생성
const generateMeetReservations = (n = 12) => {
  const statuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return Array.from({ length: n }, (_, i) => {
    const start = randomDateTimeWithin7Days();
    const amount = randInt(1, 8) * 10000; // 10,000 ~ 80,000
    const reservationStatus = pick(statuses);

    const reservationId = 1000 + i;
    const guesthouseId = pick(GUESTHOUSE_IDS);
    const partyName = pick(PARTY_NAMES);
    const partyImage = `https://picsum.photos/seed/party-${reservationId}/600/360`;

    return {
      reservationId,                 // Long
      amount,                        // BigDecimal (숫자)
      guesthouseId,                  // Long
      partyName,                     // String
      partyImage,                    // String (URL)
      reservationStatus,             // String
      startDateTime: start.toISOString(), // LocalDateTime (ISO)
    };
  });
};

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
      setReservations(generateMeetReservations(12));
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
