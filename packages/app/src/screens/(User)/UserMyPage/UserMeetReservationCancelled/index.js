import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import styles from './UserMeetReservationCancelled.styles';
import {FONTS} from '@constants/fonts';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty_eye.svg';
import EmptyState from '@components/EmptyState';
import AppImage from '@components/AppImage';

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
    r =>
      r.reservationStatus === 'CANCELLED' ||
      r.approvalStatus === 'REJECTED',
  );

  const renderItem = ({item, index}) => {
    const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      item.startDateTime,
    );

    const imageSource =
      typeof item.partyImage === 'string'
        ? {uri: item.partyImage}
        : item.partyImage;
    const statusText =
      item.approvalStatus === 'REJECTED'
        ? '신청 반려'
        : item.cancelledByType === 'HOST'
          ? '업체 취소'
          : '신청 취소';

    return (
      <View style={styles.listStylesContainer}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('MeetCancelledReceipt', {
              reservationId: item.reservationId,
            })
          }
        >
          <View style={styles.statusRow}>
            <Text style={[FONTS.fs_14_semibold, styles.statusText]}>
              {statusText}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.dateTimeText]}>
              {startFormatted.date} {startFormatted.time}
            </Text>
          </View>

          <View style={styles.divide} />

          <View style={styles.infoRow}>
            <AppImage
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
      <Header title="취소·반려된 콘텐츠" />
      <View style={styles.content}>
        {loading ? (
          <Loading title="예약 목록을 불러오고 있어요." />
        ) : (
          <>
            <FlatList
              style={styles.list}
              data={cancelledReservations}
              keyExtractor={item => item.reservationId.toString()}
              renderItem={renderItem}
              scrollEnabled
              contentContainerStyle={[
                styles.listContent,
                cancelledReservations.length === 0 &&
                  styles.emptyListContent,
              ]}
              ListEmptyComponent={
                <EmptyState
                  icon={SearchEmpty}
                  iconSize={{width: 120, height: 120}}
                  title="취소·반려 내역이 없어요"
                  description="콘텐츠를 예약하러 가볼까요?"
                  buttonText="콘텐츠 찾아보기"
                  onPressButton={() =>
                    navigation.navigate('MainTabs', {screen: '콘텐츠'})
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
