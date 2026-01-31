import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, BackHandler} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import styles from './UserMeetReservationCheck.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';

import UserUpcomingReservations from './UserUpcomingReservations';
import UserPastReservations from './UserPastReservations';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

const TABS = [
  {key: 'upcoming', label: '다가오는 이벤트'},
  {key: 'past', label: '지난 이벤트'},
];

const UserMeetReservationCheck = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fromPaymentSuccess = route.params?.fromPaymentSuccess;
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

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
      if (!fromPaymentSuccess) return undefined;
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
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="이벤트 예약내역"
        onPress={fromPaymentSuccess ? handleBackPress : null}
      />

      {/* 탭 버튼 */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}>
            <Text
              style={[
                styles.tabText,
                FONTS.fs_14_regular,
                activeTab === tab.key && styles.activeTabText,
                activeTab === tab.key && FONTS.fs_14_semibold,
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
          renderTabContent()
        )}
      </View>
    </View>
  );
};

export default UserMeetReservationCheck;
