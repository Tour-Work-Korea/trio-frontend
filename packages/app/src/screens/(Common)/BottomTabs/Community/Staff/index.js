import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

import AlertModal from '@components/modals/AlertModal';
import Loading from '@components/Loading';
import userEmployApi from '@utils/api/userEmployApi';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {trimJejuPrefix} from '@utils/formatAddress';
import {parseSlashDateToYearMonth} from '@utils/formatDate';
import {toggleFavorite} from '@utils/toggleFavorite';
import styles from './Staff.styles';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import EmptyHeartIcon from '@assets/images/Empty_Heart.svg';

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

const Staff = ({isActive}) => {
  const navigation = useNavigation();
  const [recruitList, setRecruitList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const tryFetchRecruitList = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const res = await userEmployApi.getRecruits({
          page: pageToFetch,
          size: PAGE_SIZE,
        });

        const {content, last, number} = res.data;

        setRecruitList(prev =>
          sortRecruitsByRecruiting(
            pageToFetch === 0 ? content : [...prev, ...content],
          ),
        );
        setPage(number);
        setHasNext(!last);
      } catch (error) {
        setHasNext(false);
        console.warn('fetchRecruitList 실패:', error);
        setErrorModal({
          visible: true,
          message: '채용 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          buttonText: '확인',
        });
      } finally {
        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isActive) {
        return;
      }
      setRecruitList([]);
      setHasNext(true);
      setPage(0);
      tryFetchRecruitList(0, false);
    }, [tryFetchRecruitList, isActive]),
  );

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext) {
      return;
    }

    tryFetchRecruitList(page + 1, true);
  };

  const handleJobPress = id =>
    navigation.navigate('CommunityStaffDetail', {id});

  const handleToggleFavorite = item => {
    toggleFavorite({
      type: 'recruit',
      id: item.recruitId,
      isLiked: item.isLiked,
      setList: setRecruitList,
    });
  };

  const renderTags = hashtags => {
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
  };

  const renderRecruit = ({item}) => {
    const isClosed = item.isRecruiting === false;
    const imageUrl =
      item.profileSummary?.profileImageUrl ||
      item.thumbnailImage ||
      item.recruitImage;
    const address = trimJejuPrefix(item.address ?? item.recruitAddress);
    const deadline = parseSlashDateToYearMonth(item.deadline);
    const workDuration = item.workDuration ?? item.workDate ?? item.workPeriod;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.recruitItem, isClosed && styles.recruitItemClosed]}
        onPress={() => handleJobPress(item.recruitId)}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfoRow}>
            {imageUrl ? (
              <Image
                source={{uri: imageUrl}}
                style={[styles.avatar, isClosed && styles.avatarClosed]}
              />
            ) : (
              <View style={[styles.avatar, isClosed && styles.avatarClosed]} />
            )}
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
                  마감
                </Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionItem}
            onPress={event => {
              event.stopPropagation();
              handleToggleFavorite(item);
            }}>
            {item.isLiked ? (
              <FilledHeartIcon width={18} height={18} />
            ) : (
              <EmptyHeartIcon width={18} height={18} />
            )}
          </TouchableOpacity>
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
            {address}
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
        ) : (
          null
        )}

        {/* <View style={styles.actionRow}>
          <View style={styles.actionItem}>
            {item.isLiked ? (
              <FilledHeartIcon width={18} height={18} />
            ) : (
              <EmptyHeartIcon width={18} height={18} />
            )}
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.likeCount ?? 66}
            </Text>
          </View>
          <View style={styles.actionItem}>
            <CommentIcon width={18} height={18} />
            <Text style={[FONTS.fs_14_regular, styles.actionText]}>
              {item.commentCount ?? 38}
            </Text>
          </View>
        </View> */}
      </TouchableOpacity>
    );
  };

  const renderListFooter = () => {
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
  };

  if (isInitialLoading && page === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Loading title="채용 정보를 가져오는 중입니다..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recruitList}
        keyExtractor={item => item.recruitId.toString()}
        renderItem={renderRecruit}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderListFooter}
      />

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default Staff;
