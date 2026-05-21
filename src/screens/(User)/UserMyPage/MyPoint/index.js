import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import dayjs from 'dayjs';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';

import styles from './MyPoint.styles';

const PAGE_SIZE = 20;
const EXPIRING_CALC_SIZE = 1000;

const POINT_TYPE_LABELS = {
  EARN: '적립',
  SPEND: '사용',
  ADJUSTMENT: '조정',
  EXPIRATION: '소멸',
  RECOVER: '복구',
};

const POSITIVE_TYPES = ['EARN', 'RECOVER'];
const NEGATIVE_TYPES = ['SPEND', 'EXPIRATION'];
const SERVER_EXPIRING_POINT_KEYS = [
  'expiringSoonPoints',
  'expiringPoints',
  'expirationScheduledPoints',
  'pointsExpiringWithin30Days',
];

const formatPoint = value => `${Number(value || 0).toLocaleString('ko-KR')} P`;

const formatHistoryDate = value => {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY.MM.DD') : '';
};

const getServerExpiringPoints = data => {
  const key = SERVER_EXPIRING_POINT_KEYS.find(field => data?.[field] != null);
  return key ? Number(data[key] || 0) : null;
};

const consumeOldestPointBuckets = (buckets, amount) => {
  let remainingAmount = Math.abs(Number(amount || 0));

  for (const bucket of buckets) {
    if (remainingAmount <= 0) {
      break;
    }

    const consumedAmount = Math.min(bucket.remainingAmount, remainingAmount);
    bucket.remainingAmount -= consumedAmount;
    remainingAmount -= consumedAmount;
  }
};

const calculateExpiringSoonPoints = (items, currentPoints) => {
  const now = dayjs();
  const expiryThreshold = now.add(30, 'day').endOf('day');
  const pointBuckets = [];

  [...items]
    .sort(
      (a, b) =>
        dayjs(a?.transactionDate).valueOf() -
        dayjs(b?.transactionDate).valueOf(),
    )
    .forEach(item => {
      const amount = Number(item?.amount || 0);

      if (amount === 0) {
        return;
      }

      if (
        item?.type === 'EARN' ||
        item?.type === 'RECOVER' ||
        (item?.type === 'ADJUSTMENT' && amount > 0)
      ) {
        const transactionDate = dayjs(item?.transactionDate);

        if (!transactionDate.isValid()) {
          return;
        }

        pointBuckets.push({
          expiresAt: transactionDate.add(1, 'year'),
          remainingAmount: Math.abs(amount),
        });
        return;
      }

      if (
        item?.type === 'SPEND' ||
        item?.type === 'EXPIRATION' ||
        (item?.type === 'ADJUSTMENT' && amount < 0)
      ) {
        consumeOldestPointBuckets(pointBuckets, amount);
      }
    });

  const expiringSoonPoints = pointBuckets.reduce((total, bucket) => {
    const expiresAt = dayjs(bucket.expiresAt);

    if (
      bucket.remainingAmount > 0 &&
      expiresAt.isAfter(now) &&
      expiresAt.isBefore(expiryThreshold)
    ) {
      return total + bucket.remainingAmount;
    }

    return total;
  }, 0);

  return Math.min(expiringSoonPoints, Number(currentPoints || 0));
};

const getPointSign = item => {
  if (POSITIVE_TYPES.includes(item?.type)) {
    return '+';
  }

  if (NEGATIVE_TYPES.includes(item?.type)) {
    return '-';
  }

  return Number(item?.amount || 0) >= 0 ? '+' : '-';
};

const PointHistoryItem = ({item}) => {
  const sign = getPointSign(item);
  const amount = Math.abs(Number(item?.amount || 0)).toLocaleString('ko-KR');
  const isPositive = sign === '+';

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyInfo}>
        <Text
          style={[FONTS.fs_16_medium, styles.historyTitle]}
          numberOfLines={1}>
          {item?.description || '포인트 내역'}
        </Text>
        <Text style={[FONTS.fs_14_medium, styles.historyDate]}>
          {formatHistoryDate(item?.transactionDate)}
        </Text>
      </View>
      <View style={styles.historyAmountWrapper}>
        <Text
          style={[
            FONTS.fs_16_semibold,
            styles.historyAmount,
            isPositive ? styles.earnAmount : styles.spendAmount,
          ]}>
          {sign}
          {amount}P
        </Text>
        <Text style={[FONTS.fs_12_medium, styles.historyType]}>
          {POINT_TYPE_LABELS[item?.type] || item?.type || ''}
        </Text>
      </View>
    </View>
  );
};

const MyPoint = () => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [histories, setHistories] = useState([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPointData = useCallback(async ({
    nextPage = 0,
    append = false,
    refresh = false,
  } = {}) => {
    if (append) {
      setLoadingMore(true);
    } else if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [balanceRes, historyRes, expiringHistoryRes] = await Promise.all([
        userMyApi.getPointBalance(),
        userMyApi.getPointHistory({
          page: nextPage,
          size: PAGE_SIZE,
          sort: ['transactionDate,desc'],
        }),
        userMyApi.getPointHistory({
          page: 0,
          size: EXPIRING_CALC_SIZE,
          sort: ['transactionDate,desc'],
        }),
      ]);
      const balanceData = balanceRes?.data;
      const historyData = historyRes?.data;
      const nextCurrentPoints = balanceData?.currentPoints ?? 0;
      const serverExpiringPoints = getServerExpiringPoints(balanceData);

      setCurrentPoints(nextCurrentPoints);
      setExpiringPoints(
        serverExpiringPoints ??
          calculateExpiringSoonPoints(
            expiringHistoryRes?.data?.content || [],
            nextCurrentPoints,
          ),
      );
      setHistories(prev =>
        append
          ? [...prev, ...(historyData?.content || [])]
          : historyData?.content || [],
      );
      setPage(historyData?.number ?? nextPage);
      setLast(historyData?.last ?? true);
    } catch (error) {
      console.warn('포인트 내역 조회 실패:', error);
      if (!append) {
        setHistories([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPointData();
    }, [fetchPointData]),
  );

  const handleRefresh = () => {
    fetchPointData({refresh: true});
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || last) {
      return;
    }

    fetchPointData({nextPage: page + 1, append: true});
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.pointCard}>
        <Text style={[FONTS.fs_16_semibold, styles.pointCardTitle]}>
          보유 포인트
        </Text>
        <Text style={[styles.currentPointText]}>
          {formatPoint(currentPoints)}
        </Text>
        <View style={styles.expiringRow}>
          <Text style={[FONTS.fs_16_medium, styles.expiringLabel]}>
            소멸 예정 포인트 (30일 내)
          </Text>
          <Text style={[FONTS.fs_16_medium, styles.expiringPoint]}>
            {formatPoint(expiringPoints)}
          </Text>
        </View>
      </View>

      <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
        이용 내역
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary_orange} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
          포인트 이용 내역이 없습니다.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="포인트" />
      <FlatList
        data={histories}
        keyExtractor={item => String(item.transactionId)}
        renderItem={({item}) => <PointHistoryItem item={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={COLORS.primary_orange} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary_orange}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
      />
    </View>
  );
};

export default MyPoint;
