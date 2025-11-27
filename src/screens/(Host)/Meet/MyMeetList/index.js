import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';

import Header from '@components/Header';
import styles from './MyMeetList.styles';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import EmptyState from '@components/EmptyState';

import PlusIcon from '@assets/images/plus_white.svg';
import EmptyIcon from '@assets/images/wlogo_blue_left.svg';

const MyMeetList = () => {
  const navigation = useNavigation();
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 날짜 라벨 분리: base("MM.DD ddd")와 suffix("오늘"/"내일")
  const formatDateHeaderParts = isoDate => {
    const d = dayjs(isoDate);
    const base = d.format('MM.DD ddd');
    const today = dayjs().startOf('day');
    const diff = d.startOf('day').diff(today, 'day');
    const suffix = diff === 0 ? '오늘' : diff === 1 ? '내일' : '';
    return {base, suffix};
  };

  // 이벤트 리스트 API 호출
  const fetchMyParties = useCallback(async () => {
    try {
      const {data} = await hostMeetApi.getMyParties();
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setRaw(list ?? []);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: '이벤트 목록을 불러오지 못했어요',
        text2: err?.response?.data?.message || err.message,
      });
      setRaw([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 포커스될 때마다 새로고침
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyParties();
    }, [fetchMyParties]),
  );

  // 당겨서 새로고침
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyParties();
  }, [fetchMyParties]);

  // 이벤트 삭제
  const confirmAndDelete = useCallback(
    partyId => {
      Alert.alert(
        '이벤트 취소',
        '이 이벤트을 정말 취소 하시겠어요?',
        [
          {text: '아니오', style: 'cancel'},
          {
            text: '취소',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeletingId(partyId);
                await hostMeetApi.deleteParty(partyId);
                Toast.show({type: 'success', text1: '이벤트이 취소되었어요'});
                await fetchMyParties();
              } catch (err) {
                Toast.show({
                  type: 'error',
                  // text1: '취소에 실패했어요. 잠시 후 다시 시돟',
                  text1: err?.response?.data?.message || err.message,
                });
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
        {cancelable: true},
      );
    },
    [fetchMyParties],
  );

  // FlatList에 넣기 위해 '헤더'와 '아이템'을 한 배열로 평탄화
  const flatData = useMemo(() => {
    if (!raw?.length) return [];

    // 1) 날짜 기준 내림차순 정렬 (최신 날짜가 위)
    const sorted = [...raw].sort(
      (a, b) =>
        dayjs(a.partyStartDateTime).valueOf() -
        dayjs(b.partyStartDateTime).valueOf(),
    );

    // 2) 날짜별 그룹핑
    const byDate = sorted.reduce((acc, item) => {
      const key = dayjs(item.partyStartDateTime).format('YYYY-MM-DD');
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    // 3) 그룹을 다시 flat하게: [header, item, item, header, item...]
    const result = [];
    Object.keys(byDate)
      .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
      .forEach(dateKey => {
        const {base, suffix} = formatDateHeaderParts(dateKey);
        result.push({
          type: 'header',
          id: `header-${dateKey}`,
          base,
          suffix,
        });
        byDate[dateKey].forEach(it => {
          result.push({type: 'item', ...it});
        });
      });

    return result;
  }, [raw]);

  const renderItem = ({item}) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text>
            <Text style={[FONTS.fs_16_semibold, styles.sectionHeaderText]}>
              {item.base}
            </Text>
            {item.suffix ? (
              <Text style={[FONTS.fs_16_semibold, styles.sectionHeaderSuffix]}>
                {' '}
                {item.suffix}
              </Text>
            ) : null}
          </Text>
        </View>
      );
    }

    const timeLabel = `${item.partyStartTime?.slice(
      0,
      5,
    )} ~ ${item.partyEndTime?.slice(0, 5)}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('MyMeetDetail', {partyId: item.partyId});
        }}>
        {/* 이벤트 정보 */}
        <View style={styles.cardInfo}>
          <Text style={[FONTS.fs_12_light, styles.ghName]}>
            {item.guesthouseName}
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.title]} numberOfLines={1}>
            {item.partyTitle}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.time]}>
            {timeLabel} (총{' '}
            {Math.max(
              1,
              dayjs(`1970-01-01T${item.partyEndTime}`).diff(
                dayjs(`1970-01-01T${item.partyStartTime}`),
                'hour',
              ),
            )}
            시간)
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.location]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        {/* 인원수, 삭제 버튼 */}
        <View style={styles.actionRow}>
          <View style={styles.capacityBadge}>
            <Text style={[FONTS.fs_12_medium, styles.capacityText]}>
              {item.numOfAttendance}/{item.maxAttendance}명
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmAndDelete(item.partyId)}>
            <Text style={[FONTS.fs_12_medium, styles.deleteText]}>취소</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item, index) =>
    item.type === 'header' ? item.id : `party-${item.partyId}`;

  return (
    <View style={styles.container}>
      <Header title="나의 이벤트" />

      <View style={styles.bodyContainer}>
        <FlatList
          data={flatData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon={EmptyIcon}
              iconSize={{width: 100, height: 100}}
              title="아직 등록된 이벤트이 없어요"
              description="하단에 추가하기 버튼을 통해 등록해주세요!"
            />
          }
          contentContainerStyle={
            flatData.length === 0
              ? {flex: 1, justifyContent: 'center'}
              : {paddingBottom: 60}
          }
          showsVerticalScrollIndicator={false}
        />

        {/* 이벤트 추가하기 버튼 */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            navigation.navigate('MyMeetAdd');
          }}>
          <Text style={[FONTS.fs_14_medium, styles.fabText]}>
            이벤트 추가하기
          </Text>
          <PlusIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MyMeetList;
