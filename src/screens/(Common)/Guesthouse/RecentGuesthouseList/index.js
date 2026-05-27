import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './RecentGuesthouseList.styles';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import {
  clearRecentGuesthouses,
  getRecentGuesthouses,
  setRecentGuesthouses,
} from '@utils/recentGuesthouses';
import {toggleFavorite} from '@utils/toggleFavorite';
import {trimJejuPrefix} from '@utils/formatAddress';

import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';

const RecentGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  useFocusEffect(
    useCallback(() => {
      const loadRecentGuesthouses = async () => {
        try {
          const list = await getRecentGuesthouses();
          setGuesthouses(list);
        } catch (error) {
          console.warn('최근 본 게하 조회 실패', error);
          setGuesthouses([]);
        }
      };

      loadRecentGuesthouses();
    }, []),
  );

  const handleClearAll = async () => {
    try {
      await clearRecentGuesthouses();
      setGuesthouses([]);
      setDeleteModalVisible(false);
    } catch (error) {
      console.warn('최근 본 게하 전체 삭제 실패', error);
    }
  };

  const handleToggleFavorite = async item => {
    const nextGuesthouses = guesthouses.map(guesthouse =>
      String(guesthouse.id) === String(item.id)
        ? {...guesthouse, isLiked: !item.isLiked}
        : guesthouse,
    );

    setGuesthouses(nextGuesthouses);

    const success = await toggleFavorite({
      type: 'guesthouse',
      id: item.id,
      isLiked: item.isLiked,
    });

    if (success) {
      setRecentGuesthouses(nextGuesthouses).catch(error => {
        console.warn('최근 본 게하 좋아요 저장 실패', error);
      });
      return;
    }

    setGuesthouses(guesthouses);
  };

  const renderGuesthouse = ({item}) => (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.card}
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.id,
          checkIn: today.format('YYYY-MM-DD'),
          checkOut: tomorrow.format('YYYY-MM-DD'),
          guestCount: 1,
        });
      }}>
      {item.thumbnailUrl ? (
        <Image source={{uri: item.thumbnailUrl}} style={styles.image} />
      ) : (
        <View style={[styles.image, {backgroundColor: COLORS.grayscale_200}]} />
      )}
      <View style={styles.info}>
        <View style={styles.tagRow}>
          {(item.hashtags ?? []).slice(0, 2).map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tagBox}>
              <Text
                style={[FONTS.fs_12_medium, styles.tagText]}
                numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[FONTS.fs_16_semibold, styles.name]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.guesthouseName}
        </Text>
        <Text
          style={[FONTS.fs_12_medium, styles.address]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {[trimJejuPrefix(item.address), item.addressDetail]
            .filter(Boolean)
            .join(' ')}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.heartButton}
        onPress={() => handleToggleFavorite(item)}>
        {item.isLiked ? (
          <FillHeart width={24} height={24} />
        ) : (
          <EmptyHeart width={24} height={24} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="최근 본 게하" />

      {guesthouses.length > 0 ? (
        <>
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setDeleteModalVisible(true)}>
              <Text style={[FONTS.fs_12_medium, styles.clearText]}>
                전체 삭제
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={guesthouses}
            keyExtractor={item => String(item.id)}
            renderItem={renderGuesthouse}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[FONTS.fs_16_semibold, styles.emptyTitle]}>
            최근 본 게스트하우스가 없어요
          </Text>
          <Text style={[FONTS.fs_14_semibold, styles.emptyDescription]}>
            게스트하우스를 먼저 둘러보세요.
          </Text>
        </View>
      )}

      <AlertModal
        visible={deleteModalVisible}
        title="전체 목록을 삭제할까요?"
        buttonText="전체 삭제"
        buttonText2="취소"
        onPress={handleClearAll}
        onPress2={() => setDeleteModalVisible(false)}
        onRequestClose={() => setDeleteModalVisible(false)}
      />
    </View>
  );
};

export default RecentGuesthouseList;
