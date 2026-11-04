import {useTranslation} from 'react-i18next';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

import AlertModal from '@components/modals/AlertModal';
import {FeedProfile} from '../CompanionFeed';
import {trimJejuPrefix} from '@utils/formatAddress';
import ScreenSkeleton from './LoadingSkeleton';
import userEmployApi from '@utils/api/userEmployApi';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {formatServiceRegion} from '@utils/formatServiceRegion';
import {parseSlashDateToYearMonth} from '@utils/formatDate';
import styles from './Staff.styles';
import {useGuesthouseRegionStore} from '@screens/(Common)/BottomTabs/Guesthouse/regions/store';
import StaffRegionTabs from './StaffRegionTabs';
import {useStaffRegionStore, withRecruitRegion} from './regions';

const PAGE_SIZE = 8;
const staffListBannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-6098454400067335/4619471702',
      android: 'ca-app-pub-6098454400067335/5920208998',
      web: 'ca-pub-6098454400067335/4250943648',
    });

const sortRecruitsByRecruiting = recruits =>
  [...recruits].sort((a, b) => {
    const aClosed = a?.isRecruiting === false;
    const bClosed = b?.isRecruiting === false;

    if (aClosed === bClosed) {
      return 0;
    }

    return aClosed ? 1 : -1;
  });

const Staff = ({
  isActive,
  hideRegionTabs = false,
  listHeader = null,
  selectedSort = 'LATEST',
  selectedRegion,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const hasUserScrolledRef = useRef(false);
  const isFetchingRef = useRef(false);
  const requestKeyRef = useRef(null);
  const storedRegion = useStaffRegionStore(state => state.region);
  const region = selectedRegion ?? storedRegion;
  const loadedRegionRef = useRef(null);
  const setRegion = useStaffRegionStore(state => state.setRegion);
  const regions = useGuesthouseRegionStore(state => state.regions);
  const [recruitList, setRecruitList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const tryFetchRecruitList = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      const requestKey = `${region}:${pageToFetch}:${
        isLoadMore ? 'append' : 'reset'
      }`;

      if (
        requestKeyRef.current === requestKey ||
        (isFetchingRef.current && isLoadMore)
      ) {
        return;
      }

      isFetchingRef.current = true;
      requestKeyRef.current = requestKey;

      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const res = await userEmployApi.getRecruits(
          withRecruitRegion(
            {
              page: pageToFetch,
              size: PAGE_SIZE,
            },
            region,
          ),
        );

        let content = Array.isArray(res.data?.content) ? res.data.content : [];
        let last = res.data?.last ?? true;
        let number = Number(res.data?.number ?? pageToFetch);
        // The existing API client requests LATEST. Read all pages before
        // reversing registration order so older posts are not omitted.
        while (selectedSort === 'OLDEST' && !isLoadMore && !last) {
          if (requestKeyRef.current !== requestKey) {return;}
          const next = await userEmployApi.getRecruits(
            withRecruitRegion({page: number + 1, size: PAGE_SIZE}, region),
          );
          const nextContent = Array.isArray(next.data?.content)
            ? next.data.content
            : [];
          content = [...content, ...nextContent];
          number += 1;
          last = (next.data?.last ?? true) || nextContent.length === 0;
        }

        if (requestKeyRef.current !== requestKey) {
          return;
        }

        setRecruitList(prev =>
          sortRecruitsByRecruiting(
            pageToFetch === 0 ? content : [...prev, ...content],
          ),
        );
        setPage(number);
        setHasNext(!last);
      } catch (error) {
        if (requestKeyRef.current !== requestKey) {
          return;
        }
        setHasNext(false);
        console.warn('fetchRecruitList 실패:', error);
        setErrorModal({
          visible: true,
          message: t(
            'common.jobInformationCouldNotBeLoadedPleaseTryAgainLater',
          ),
          buttonText: t('community.tryAgain'),
        });
      } finally {
        if (requestKeyRef.current !== requestKey) {
          return;
        }
        isFetchingRef.current = false;
        requestKeyRef.current = null;

        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [region, selectedSort, t],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isActive) {
        return;
      }
      // Returning from a list/detail screen must keep loaded pages and scroll.
      const filterKey = `${region}:${selectedSort}`;
      if (loadedRegionRef.current === filterKey) {return;}
      loadedRegionRef.current = filterKey;
      hasUserScrolledRef.current = false;
      setHasNext(true);
      setPage(0);
      tryFetchRecruitList(0, false);
    }, [tryFetchRecruitList, isActive, region, selectedSort]),
  );

  const handleEndReached = useCallback(() => {
    if (
      (Platform.OS !== 'web' && !hasUserScrolledRef.current) ||
      isInitialLoading ||
      isMoreLoading ||
      !hasNext
    ) {
      return;
    }

    tryFetchRecruitList(page + 1, true);
  }, [hasNext, isInitialLoading, isMoreLoading, page, tryFetchRecruitList]);

  const handleScrollBeginDrag = useCallback(() => {
    hasUserScrolledRef.current = true;
  }, []);

  const selectedRegionName = useMemo(
    () =>
      regions.find(item => item.code === region)?.displayName ??
      (region === 'ALL' ? t('common.all') : region),
    [region, regions, t],
  );

  const handleRetry = useCallback(() => {
    setErrorModal(prev => ({...prev, visible: false}));
    setRecruitList([]);
    setHasNext(true);
    setPage(0);
    tryFetchRecruitList(0, false);
  }, [tryFetchRecruitList]);

  const handleJobPress = useCallback(
    id => {
      navigation.navigate('CommunityStaffDetail', {id});
    },
    [navigation],
  );

  const renderTags = useCallback(hashtags => {
    if (!hashtags?.length) {
      return null;
    }

    return (
      <View style={styles.tagRow}>
        {hashtags.slice(0, 3).map((tag, index) => {
          const tagLabel = tag?.hashtag ?? tag;

          return (
            <View key={`${tagLabel}-${index}`} style={styles.tag}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tagLabel}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }, []);

  const renderRecruit = useCallback(
    ({item}) => {
      const isClosed = item.isRecruiting === false;
      const imageUrl =
        item.profileSummary?.profileImageUrl ||
        item.thumbnailImage ||
        item.recruitImage;
      const regionName = trimJejuPrefix(
        item.address ||
          item.profileSummary?.address ||
          formatServiceRegion(item.profileSummary?.regionType),
      );
      const deadline = parseSlashDateToYearMonth(item.deadline);
      const workDuration =
        item.workDuration ?? item.workDate ?? item.workPeriod;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.recruitItem, isClosed && styles.recruitItemClosed]}
          onPress={() => handleJobPress(item.recruitId)}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfoRow}>
              <View style={{marginRight: 8, opacity: isClosed ? 0.45 : 1}}>
                <FeedProfile uri={imageUrl} />
              </View>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.guesthouseName,
                  isClosed && styles.closedPrimaryText,
                ]}
                numberOfLines={1}>
                {item.guesthouseName}
              </Text>
              {!!deadline && (
                <Text
                  style={[
                    FONTS.fs_14_regular,
                    styles.deadline,
                    isClosed && styles.closedSecondaryText,
                  ]}>
                  ~{deadline}
                </Text>
              )}
              {isClosed ? (
                <View style={styles.closedBadge}>
                  <Text style={[FONTS.fs_12_medium, styles.closedBadgeText]}>
                    {t('common.deadline')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text
            style={[
              FONTS.fs_14_medium,
              styles.recruitTitle,
              isClosed && styles.closedPrimaryText,
            ]}
            numberOfLines={1}>
            {item.recruitTitle}
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={[
                FONTS.fs_12_regular,
                styles.address,
                isClosed && styles.closedSecondaryText,
              ]}
              numberOfLines={1}>
              {regionName}
            </Text>
            {!!workDuration && (
              <Text
                style={[
                  FONTS.fs_12_regular,
                  styles.workPeriod,
                  isClosed && styles.closedSecondaryText,
                ]}>
                {workDuration}
              </Text>
            )}
          </View>

          {isClosed && item.hashtags?.length ? (
            <View style={styles.tagRow}>
              {item.hashtags?.slice(0, 3).map((tag, index) => {
                const tagLabel = tag?.hashtag ?? tag;

                return (
                  <View
                    key={`${tagLabel}-${index}`}
                    style={[styles.tag, styles.tagClosed]}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        styles.tagText,
                        styles.tagTextClosed,
                      ]}>
                      {tagLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : !isClosed ? (
            renderTags(item.hashtags)
          ) : null}
        </TouchableOpacity>
      );
    },
    [handleJobPress, renderTags, t],
  );

  const renderListFooter = useCallback(() => {
    const shouldShowAd =
      Boolean(staffListBannerAdUnitId) &&
      !hasNext &&
      recruitList.length > 0 &&
      !isMoreLoading;

    return (
      <View>
        {isMoreLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.grayscale_500}
            style={styles.footerLoading}
          />
        ) : null}

        {shouldShowAd ? (
          <View style={styles.adBannerContainer}>
            <BannerAd
              unitId={staffListBannerAdUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
          </View>
        ) : null}
      </View>
    );
  }, [hasNext, isMoreLoading, recruitList.length]);

  const keyExtractor = useCallback(item => item.recruitId.toString(), []);

  return (
    <View style={styles.container}>
      {!hideRegionTabs && (
        <View style={styles.regionSection}>
          <StaffRegionTabs value={region} onChange={setRegion} />
        </View>
      )}

      <FlatList
        data={
          selectedSort === 'OLDEST'
            ? sortRecruitsByRecruiting([...recruitList].reverse())
            : recruitList
        }
        ListHeaderComponent={listHeader}
        keyExtractor={keyExtractor}
        renderItem={renderRecruit}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        onScrollBeginDrag={handleScrollBeginDrag}
        contentContainerStyle={[
          styles.listContent,
          recruitList.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          isInitialLoading ? (
            <ScreenSkeleton
              layout={styles}
              title={t('common.retrievingJobOpenings')}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[FONTS.fs_16_medium, styles.emptyTitle]}>
                {t(
                  'community.thereAreNoStaffRecruitmentAnnouncementsInYourArea',
                  {region: selectedRegionName},
                )}
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.emptyDescription]}>
                {t('community.pleaseAlsoCheckAnnouncementsInOtherRegions')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={renderListFooter}
      />

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={handleRetry}
      />
    </View>
  );
};

export default memo(Staff);
