import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import Header from '@components/Header';
import styles from './UserReservationCheck.styles';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import { formatDate } from '@utils/formatDate';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import UserCancelledReservations from './UserCancelledReservations';

const TABS = [
  { key: 'upcoming', label: '다가오는 예약' },
  { key: 'past', label: '지난 예약' },
  { key: 'cancelled', label: '예약취소' },
];

const UserReservationCheck = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservationList();
  }, []);

  const fetchReservationList = async () => {
    try {
      const res = await userMyApi.getMyReservations();
      setReservations(res.data);
    } catch (error) {
      Alert.alert('예약 목록 불러오기 실패');
    }
  };

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
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 내용 */}
      {renderTabContent()}
      
    </View>
  );
};

export default UserReservationCheck;
