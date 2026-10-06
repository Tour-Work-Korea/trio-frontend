import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';

import NoReview from '@assets/images/wa_orange_noreview.svg';

const UserPartyReviewWrite = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const {data} = await userMyApi.getMyPartyReviews();
      const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
      setItems(reviews.filter(item => !item.reviewed));
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [fetchReviews]),
  );

  if (loading) {
    return <Loading title="리뷰 목록을 불러오고 있어요." />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.reservationId)}
      contentContainerStyle={[
        styles.listContent,
        items.length === 0 && styles.emptyListContent,
      ]}
      renderItem={({item, index}) => {
        const start = formatLocalDateTimeToDotAndTimeWithDay(
          item.partyStartDateTime,
        );
        const end = formatLocalDateTimeToDotAndTimeWithDay(
          item.partyEndDateTime,
        );

        return (
          <View style={styles.itemContainer}>
            <View style={styles.card}>
              <Text style={[FONTS.fs_16_semibold, styles.partyTitle]}>
                {item.partyTitle}
              </Text>
              <View style={styles.dateBox}>
                <View style={styles.dateColumn}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                    {start.date}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                    {start.time}
                  </Text>
                </View>
                <Text style={[FONTS.fs_14_medium, styles.dateDivider]}>~</Text>
                <View style={styles.dateColumn}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateText]}>
                    {end.date}
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.timeText]}>
                    {end.time}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={1}
              style={styles.reviewButton}
              onPress={() =>
                navigation.navigate('UserPartyReviewForm', {
                  reviewType: 'party',
                  partyId: item.partyId,
                  partyReservationId: item.reservationId,
                  partyTitle: item.partyTitle,
                  checkInFormatted: start,
                  checkOutFormatted: end,
                })
              }>
              <Text style={[FONTS.fs_16_semibold, styles.reviewButtonText]}>
                리뷰 작성하기
              </Text>
            </TouchableOpacity>

            {index !== items.length - 1 && <View style={styles.divider} />}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          icon={NoReview}
          iconSize={{width: 100, height: 60}}
          title="아직 작성할 리뷰가 없어요"
          description="콘텐츠에 참여하러 가볼까요?"
          buttonText="콘텐츠 찾아보기"
          onPressButton={() =>
            navigation.navigate('MainTabs', {screen: '콘텐츠'})
          }
        />
      }
    />
  );
};

export default UserPartyReviewWrite;

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
  itemContainer: {
    paddingHorizontal: 20,
  },
  card: {},
  partyTitle: {
    color: COLORS.grayscale_900,
  },
  dateBox: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    flexDirection: 'row',
  },
  dateColumn: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  dateDivider: {
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  reviewButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_200,
  },
  reviewButtonText: {
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 16,
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },
});
