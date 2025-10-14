import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import styles from './UserFavoriteGuesthouse.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';
import ButtonScarlet from '@components/ButtonScarlet';

import FillHeart from '@assets/images/heart_filled.svg';
import Star from '@assets/images/star_white.svg';
import SearchEmpty from '@assets/images/search_empty.svg';

const UserFavoriteGuesthouse = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  useEffect(() => {
    fetchFavoriteList();
  }, []);

  const fetchFavoriteList = async () => {
    try {
      setLoading(true);
      const res = await userMyApi.getMyFavoriteGuesthouses();
      setGuesthouses(res.data);
    } catch (error) {
      console.log('즐겨찾는 게하 데이터 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item) => {
    try {
      await userMyApi.unfavoriteGuesthouse(item.id);
      await fetchFavoriteList();
    } catch (error) {
      Alert.alert('즐겨찾기 취소를 실패 했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.id,
          isFromDeeplink: true,
          checkIn: today.format('YYYY-MM-DD'),
          checkOut: tomorrow.format('YYYY-MM-DD'),
          guestCount: 1,
        });
      }}
    >
      <View>
        <Image
          source={{ uri: item.thumbnailImgUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingBox}>
          <Star width={14} height={14} />
          <Text style={[FONTS.fs_12_medium, styles.ratingText]}>
            {item.averageRating}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.topContent}>
          <View style={styles.hashtagContainer}>
            {item.hashtags.map((tag, idx) => (
              <View style={styles.hashtagBox}>
                <Text key={idx} style={[FONTS.fs_12_medium, styles.hashtag]}>#{tag}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
            <FillHeart width={18} height={18} />
          </TouchableOpacity>
        </View>
        <Text style={[FONTS.fs_16_medium, styles.name]}>{item.name}</Text>
        <Text style={[FONTS.fs_12_medium, styles.address]}>{item.address}</Text>
        <Text style={[FONTS.fs_18_semibold, styles.price]}>{item.minPrice.toLocaleString()}원 ~</Text>
      </View>
      
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title='즐겨찾는 게하' />
      {loading ? (
        <Loading title='게스트하우스를 불러오는 중이에요' />
      ) : guesthouses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={SearchEmpty}
            iconSize={{ width: 120, height: 120 }}
            title='즐겨찾는 게스트하우스가 없어요'
            description='마음에 드는 게스트 하우스를 찾으러 가볼까요?'
          />
          <View style={styles.emptyButton}>
            <ButtonScarlet
              title={'게스트하우스 찾아보기'}
              onPress={() => {
                navigation.navigate('MainTabs', { screen: '게하' });
              }}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={guesthouses}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          style={styles.listContiner}
        />
      )}
    </View>
  );
};

export default UserFavoriteGuesthouse;
