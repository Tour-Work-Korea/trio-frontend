import {useTranslation} from 'react-i18next';
import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import {useNavigation} from '@react-navigation/native';

import styles from './UserFavoriteMeet.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ScreenSkeleton from './LoadingSkeleton';
import EmptyState from '@components/EmptyState';
import userMeetApi from '@utils/api/userMeetApi';
import AppImage from '@components/AppImage';

import FillHeart from '@assets/images/heart_filled.svg';
import SearchEmpty from '@assets/images/search_empty_sprinkle.svg';

const mapApiToUI = it => ({
  id: it.partyId,
  guesthouseName: it.guesthouseName,
  title: it.partyTitle,
  address: it.location,
  datetime: it.partyStartDateTime,
  liked: it.numOfAttendance, // 현재 참여 인원
  limit: it.maxAttendance, // 최대 인원
  image: it.partyImageUrl ? {uri: it.partyImageUrl} : null,
});

const UserFavoriteMeet = ({hideHeader = false}) => {
  const {t} = useTranslation();
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
      ? t('meet.todayValue', {value1: dt.format('A h:mm')}) // 예: 오늘, 오전 9:00
      : `${dt.format(t('meet.dDaysAHMm'))}`; // 예: 13일, 오전 9:00

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.row}
        onPress={() => navigation.navigate('MeetDetail', {partyId: item.id})}>
        <View style={{flexDirection: 'row'}}>
          <AppImage source={item.image} style={styles.thumbnail} />

          <View style={styles.middle}>
            <View>
              <View style={styles.infoContainer}>
                <Text
                  style={[FONTS.fs_12_medium, styles.ghName]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.guesthouseName}
                </Text>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => handleUnfavorite(item.id)}>
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
                  {t('meet.valueValuePeople', {
                    item_liked: item.liked,
                    item_limit: item.limit,
                  })}
                </Text>
              </View>
            </View>
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
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!hideHeader && <Header title={t('meet.favoriteActivity')} />}

      <View style={styles.body}>
        {loading ? (
          <ScreenSkeleton layout={styles} title={t('meet.loadingHistory')} />
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
                  title={t('meet.thereAreNoFavoriteActivitiesYet')}
                  description={t('meet.youCanQuicklyViewYourFavoriteActivity')}
                  buttonText={t('meet.goToActivity')}
                  onPressButton={() =>
                    navigation.navigate('MainTabs', {screen: '콘텐츠'})
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
