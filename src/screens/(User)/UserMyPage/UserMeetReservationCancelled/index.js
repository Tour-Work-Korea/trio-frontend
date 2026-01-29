import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import Header from '@components/Header';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import UserCancelledReservations from '../UserMeetReservationCheck/UserCancelledReservations';
import styles from './UserMeetReservationCancelled.styles';

const UserMeetReservationCancelled = () => {
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

  return (
    <View style={styles.container}>
      <Header title="취소된 이벤트" />
      <View style={styles.content}>
        {loading ? (
          <Loading title="예약 목록을 불러오고 있어요." />
        ) : (
          <UserCancelledReservations data={cancelledReservations} />
        )}
      </View>
    </View>
  );
};

export default UserMeetReservationCancelled;
