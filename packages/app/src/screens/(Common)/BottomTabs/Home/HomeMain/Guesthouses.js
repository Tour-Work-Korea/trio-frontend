import {useTranslation} from 'react-i18next';
import React, {memo, useCallback, useMemo} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import Star from '@assets/images/star_white.svg';
import {
  getHomeHorizontalScrollProps,
  shouldIgnoreHomeHorizontalPress,
} from './webScroll';
import AppImage from '@screens/_components/ContentImage';
import AdaptiveText from '@components/AdaptiveText';

const guesthouseSeparatorStyle = {width: 20};
const GuesthouseSeparator = () => <View style={guesthouseSeparatorStyle} />;

function Guesthouses({guesthouses = []}) {
  const {t, i18n} = useTranslation();
  const isEnglish = i18n.resolvedLanguage === 'en';
  const navigation = useNavigation();
  const today = useMemo(() => dayjs(), []);
  const tomorrow = useMemo(() => today.add(1, 'day'), [today]);
  const checkIn = useMemo(() => today.format('YYYY-MM-DD'), [today]);
  const checkOut = useMemo(() => tomorrow.format('YYYY-MM-DD'), [tomorrow]);

  const getDisplayRating = useCallback(rating => {
    const ratingNumber = Number(rating);
    return Number.isFinite(ratingNumber) && ratingNumber > 0
      ? ratingNumber.toFixed(1)
      : null;
  }, []);

  const getTagLabels = useCallback(
    item =>
      (Array.isArray(item.hashtags) ? item.hashtags : [])
        .map(tag =>
          typeof tag === 'string' ? tag : tag?.hashtag ?? tag?.name ?? null,
        )
        .filter(Boolean)
        .slice(0, 3),
    [],
  );

  const renderGuesthouse = useCallback(
    ({item}) => {
      const displayRating = getDisplayRating(item.avgRating);

      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            if (shouldIgnoreHomeHorizontalPress()) {
              return;
            }

            navigation.navigate('GuesthouseDetail', {
              id: item.guesthouseId,
              checkIn,
              checkOut,
              guestCount: 1,
            });
          }}>
          <View style={styles.guesthouseCard}>
            <View>
              {item.thumbnailUrl ? (
                <AppImage
                  uri={item.thumbnailUrl}
                  style={styles.guesthouseImage}
                />
              ) : (
                <View
                  style={[
                    styles.guesthouseImage,
                    {backgroundColor: COLORS.grayscale_200},
                  ]}
                />
              )}
              {displayRating && (
                <View style={styles.ratingBox}>
                  <Star width={14} height={14} />
                  <Text style={[FONTS.fs_14_medium, styles.ratingText]}>
                    {displayRating}
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.titleSection, {marginBottom: 10}]}>
              <Text
                style={styles.guesthouseTitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.guesthouseName}
              </Text>
              {Number(item.minAmount) > 0 ? (
                // 정상 가격 노출
                <View style={styles.guesthousePrice}>
                  {!isEnglish && (
                    <Text
                      style={[FONTS.fs_12_medium, styles.guesthousePriceName]}>
                      {t('common.lowestPrice')}
                    </Text>
                  )}
                  <Text style={FONTS.fs_16_semibold}>
                    {Number(item.minAmount).toLocaleString()}
                    {t('common.won_989c0f')}
                  </Text>
                </View>
              ) : (
                // 예약 마감 노출
                <View style={styles.guesthousePrice}>
                  <Text
                    style={[
                      FONTS.fs_16_semibold,
                      {color: COLORS.grayscale_300},
                    ]}>
                    {t('guesthouse.checkOtherDates')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.hashTagContainer}>
              {getTagLabels(item).map((tag, index) => (
                <View style={styles.hashtagButton} key={`${tag}-${index}`}>
                  <Text style={[FONTS.fs_12_medium, styles.hashtagText]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      checkIn,
      checkOut,
      getDisplayRating,
      getTagLabels,
      isEnglish,
      navigation,
      t,
    ],
  );

  const handlePressSeeMore = useCallback(() => {
    navigation.navigate('PopularGuesthouseList', {
      guesthouses,
    });
  }, [guesthouses, navigation]);

  return (
    <View style={styles.guesthouseContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <AdaptiveText variant="title" style={styles.sectionTitle}>
          <Text style={{color: COLORS.primary_orange}}>
            {t('guesthouse.ddakji')}
          </Text>{' '}
          {t('guesthouse.recommendedGuesthouse')}
        </AdaptiveText>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.seeMoreButton}
          onPress={handlePressSeeMore}>
          <Text style={styles.seeMoreText}>{t('common.seeMore')}</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <FlatList
        {...getHomeHorizontalScrollProps()}
        data={guesthouses}
        horizontal
        directionalLockEnabled
        nestedScrollEnabled
        alwaysBounceVertical={false}
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.horizontalList}
        keyExtractor={item => String(item.guesthouseId)}
        renderItem={renderGuesthouse}
        ItemSeparatorComponent={GuesthouseSeparator}
      />
    </View>
  );
}

export default memo(Guesthouses);
