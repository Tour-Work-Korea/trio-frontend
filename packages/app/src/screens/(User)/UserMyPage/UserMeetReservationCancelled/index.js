import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import ScreenSkeleton from './LoadingSkeleton';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import styles from './UserMeetReservationCancelled.styles';
import {FONTS} from '@constants/fonts';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import SearchEmpty from '@assets/images/search_empty_eye.svg';
import EmptyState from '@components/EmptyState';
import AppImage from '@components/AppImage';

const UserMeetReservationCancelled = () => {
  const {t} = useTranslation();
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
      ['REJECTED', 'EXPIRED'].includes(r.approvalStatus),
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
      item.approvalStatus === 'EXPIRED'
        ? t('common.applicationExpires')
        : item.approvalStatus === 'REJECTED'
        ? t('common.applicationRejected')
        : item.cancelledByType === 'HOST'
        ? t('meet.cancellationOfBusiness')
        : t('common.cancelApplication_1ffccc');

    return (
      <View style={styles.listStylesContainer}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('MeetCancelledReceipt', {
              reservationId: item.reservationId,
            })
          }>
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
      <Header title={t('meet.canceledRejectedActivity')} />
      <View style={styles.content}>
        {loading ? (
          <ScreenSkeleton layout={styles} title={t('common.loadingTheReservationList')} />
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
                cancelledReservations.length === 0 && styles.emptyListContent,
              ]}
              ListEmptyComponent={
                <EmptyState
                  icon={SearchEmpty}
                  iconSize={{width: 120, height: 120}}
                  title={t('meet.thereIsNoCancellationOrRejectionHistory')}
                  description={t('meet.shallWeGoReserveActivity')}
                  buttonText={t('common.browseActivity')}
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
