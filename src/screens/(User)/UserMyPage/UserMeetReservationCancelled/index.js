import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import styles from './UserMeetReservationCancelled.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty_eye.svg';
import EmptyState from '@components/EmptyState';

const UserMeetReservationCancelled = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReservationList = useCallback(async () => {
    try {
      setLoading(true);
      const {data} = await reservationPaymentApi.getPartyReservationList();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setReservations(list);
    } catch (e) {
      console.log('취소 예약 목록 불러오기 실패', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservationList();
  }, [fetchReservationList]);

  const cancelledReservations = reservations.filter(
    r => r.reservationStatus === 'CANCELLED',
  );

  const renderItem = ({item, index}) => {
    const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      item.startDateTime,
    );

    const imageSource =
      typeof item.partyImage === 'string'
        ? {uri: item.partyImage}
        : item.partyImage;

    return (
      <View style={styles.listStylesContainer}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('MeetCancelledReceipt', {
              reservationId: item.reservationId,
            })
          }
        >
          <Text style={[FONTS.fs_14_medium, styles.dateTimeText]}>
            {startFormatted.date} {startFormatted.time}
          </Text>

          <View style={styles.divide} />

          <View style={styles.infoRow}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoContent}>
              <Text
                style={[FONTS.fs_18_medium, styles.partyTitle]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.partyName}
              </Text>
              <Text
                style={[FONTS.fs_12_medium, styles.guesthouseText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="취소된 이벤트" />
      <View style={styles.content}>
        {loading ? (
          <Loading title="예약 목록을 불러오고 있어요." />
        ) : (
          <>
            <FlatList
              data={cancelledReservations}
              keyExtractor={item => item.reservationId.toString()}
              renderItem={renderItem}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent:
                  cancelledReservations.length === 0 ? 'center' : 'flex-start',
                paddingVertical: 20,
              }}
              ListEmptyComponent={
                <EmptyState
                  icon={SearchEmpty}
                  iconSize={{width: 120, height: 120}}
                  title="취소내역이 없어요"
                  description="이벤트을 예약하러 가볼까요?"
                  buttonText="이벤트 찾아보기"
                  onPressButton={() =>
                    navigation.navigate('MainTabs', {screen: '이벤트'})
                  }
                />
              }
            />
          </>
        )}
      </View>
    </View>
  );
};

export default UserMeetReservationCancelled;
