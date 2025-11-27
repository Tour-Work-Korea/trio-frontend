import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import {useNavigation} from '@react-navigation/native';

import styles from './UserFavoriteMeet.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import userMeetApi from '@utils/api/userMeetApi';

import FillHeart from '@assets/images/heart_filled.svg';
import SearchEmpty from '@assets/images/search_empty_sprinkle.svg';

const mapApiToUI = it => ({
  id: it.partyId,
  guesthouseName: it.guesthouseName,
  title: it.partyTitle,
  address: it.location,
  // price 없음 → null 처리 (UI에서 감춤)
  price: null,
  datetime: it.partyStartDateTime,
  liked: it.numOfAttendance, // 현재 참여 인원
  limit: it.maxAttendance, // 최대 인원
  image: require('@assets/images/exphoto.jpeg'), // 응답에 이미지 없으므로 플레이스홀더
});

const UserFavoriteMeet = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await userMeetApi.getFavoriteParties();
      const mapped = (res?.data ?? []).map(mapApiToUI);
      setList(mapped);
    } catch (e) {
      console.log('getFavoriteParties error', e);
      setList([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetchFavorites();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  }, [fetchFavorites]);

  const handleUnfavorite = useCallback(
    async partyId => {
      if (removingId) return;
      setRemovingId(partyId);
      try {
        await userMeetApi.removeFavorite(partyId);
        await fetchFavorites();
      } catch (e) {
        console.log('removeFavorite error', e);
      } finally {
        setRemovingId(null);
      }
    },
    [removingId, fetchFavorites],
  );

  const data = useMemo(
    () =>
      [...list].sort(
        (a, b) => dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf(),
      ),
    [list],
  );

  const renderItem = ({item}) => {
    const dt = dayjs(item.datetime);
    const isToday = dt.isSame(dayjs(), 'day');

    const dateLabel = isToday
      ? `오늘, ${dt.format('A h:mm')}` // 예: 오늘, 오전 9:00
      : `${dt.format('D일, A h:mm')}`; // 예: 13일, 오전 9:00

    return (
      <View style={styles.row}>
        <View style={{flexDirection: 'row'}}>
          <Image source={item.image} style={styles.thumbnail} />

          <View style={styles.middle}>
            <View>
              <View style={styles.infoContainer}>
                <Text
                  style={[FONTS.fs_12_medium, styles.ghName]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.guesthouseName}
                </Text>
                <TouchableOpacity onPress={() => handleUnfavorite(item.id)}>
                  <FillHeart width={20} height={20} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoContainer}>
                <Text
                  style={[FONTS.fs_14_medium, styles.titleText]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.heartText]}>
                  {` ${item.liked}/${item.limit}명`}
                </Text>
              </View>
            </View>

            {/* <Text style={[FONTS.fs_18_semibold, styles.priceText]}>
              {item.price.toLocaleString()}원
            </Text> */}
          </View>
        </View>

        <View style={styles.down}>
          <Text
            style={[FONTS.fs_12_medium, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.address}
          </Text>
          <Text
            style={[
              FONTS.fs_12_medium,
              isToday
                ? {color: COLORS.primary_orange}
                : {color: COLORS.grayscale_800},
            ]}
            numberOfLines={1}>
            {dateLabel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="즐겨찾는 이벤트" />

      <View style={styles.body}>
        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Loading title="내역을 불러오는 중이에요." />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={it => String(it.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{height: 16}} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <EmptyState
                  icon={SearchEmpty}
                  iconSize={{width: 210, height: 112}}
                  title="아직 즐겨찾는 이벤트이 없어요"
                  description="마음에 드는 이벤트을 빠르게 볼 수 있어요!"
                  buttonText="이벤트 찾으러 가기"
                  onPressButton={() =>
                    navigation.navigate('MainTabs', {screen: '이벤트'})
                  }
                />
              </View>
            }
            contentContainerStyle={{flexGrow: 1}}
          />
        )}
      </View>
    </View>
  );
};

export default UserFavoriteMeet;
