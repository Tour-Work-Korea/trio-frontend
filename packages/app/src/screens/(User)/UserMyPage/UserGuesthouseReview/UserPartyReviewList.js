import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import AppImage from '@components/AppImage';
import EmptyState from '@components/EmptyState';
import ScreenSkeleton from './UserPartyReviewList.skeleton';
import userMyApi from '@utils/api/userMyApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';

import NoReview from '@assets/images/wa_orange_noreview.svg';
import StarIcon from '@assets/images/star_white.svg';
import TrashIcon from '@assets/images/delete_gray.svg';

const getDisplayRating = rating => {
  const ratingNumber = Number(rating);
  return Number.isFinite(ratingNumber) ? ratingNumber.toFixed(1) : '0.0';
};

const UserPartyReviewList = () => {
  const {t} = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const {data} = await userMyApi.getMyPartyReviews();
      const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
      setItems(reviews.filter(item => item.reviewed && item.review));
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

  const handleDelete = useCallback(
    reviewId => {
      Alert.alert(
        t('common.deleteReview'),
        t('common.areYouSureYouWantToDeleteThisReview'),
        [
          {text: t('common.cancel'), style: 'cancel'},
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await userMyApi.deletePartyReview(reviewId);
                Toast.show({
                  type: 'success',
                  text1: t('common.deleted'),
                  position: 'top',
                  visibilityTime: 2000,
                });
                await fetchReviews();
              } catch (error) {
                Alert.alert(
                  t('common.deletionFailed'),
                  t('common.thereWasAProblemDeletingTheReview'),
                );
              }
            },
          },
        ],
      );
    },
    [fetchReviews, t],
  );

  if (loading) {
    return <ScreenSkeleton layout={styles} title={t('common.loadingReviews')} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={NoReview}
        title={t('common.thereAreNoReviewsWrittenYet')}
        description={t('common.beTheFirstToLeaveAReview')}
        iconSize={{width: 100, height: 60}}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={item => String(item.review.reviewId)}
      contentContainerStyle={styles.listContent}
      renderItem={({item, index}) => {
        const review = item.review;
        const createdAt = formatLocalDateTimeToDotAndTimeWithDay(
          review.createdAt,
        );
        const start = formatLocalDateTimeToDotAndTimeWithDay(
          item.partyStartDateTime,
        );
        const images = Array.isArray(review.imageUrls) ? review.imageUrls : [];

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.partyInfo}>
                <Text style={[FONTS.fs_16_semibold, styles.partyTitle]}>
                  {item.partyTitle}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                  {t('common.creationDate')}
                  {createdAt.date}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                  {t('guesthouse.participation')}
                  {start.date} {start.time}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <View style={styles.ratingBox}>
                  <StarIcon width={14} height={14} />
                  <Text style={[FONTS.fs_14_semibold, styles.ratingText]}>
                    {getDisplayRating(review.reviewRating)}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  onPress={() => handleDelete(review.reviewId)}>
                  <TrashIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reviewBox}>
              <Text style={[FONTS.fs_14_regular, styles.reviewText]}>
                {review.reviewDetail}
              </Text>
              {images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageRow}
                  contentContainerStyle={styles.imageRowContent}>
                  {images.map((imageUrl, imageIndex) => (
                    <AppImage
                      key={`${review.reviewId}-${imageIndex}`}
                      uri={imageUrl}
                      style={styles.reviewImage}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
            {index !== items.length - 1 && <View style={styles.divider} />}
          </View>
        );
      }}
    />
  );
};

export default UserPartyReviewList;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  partyInfo: {
    flex: 1,
    gap: 4,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
  },
  metaText: {
    color: COLORS.grayscale_500,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_800,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 100,
    gap: 4,
  },
  ratingText: {
    color: COLORS.grayscale_0,
  },
  reviewBox: {
    backgroundColor: COLORS.grayscale_100,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  reviewText: {
    color: COLORS.grayscale_800,
    lineHeight: 20,
  },
  imageRow: {
    marginTop: 12,
  },
  imageRowContent: {
    gap: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },
});
