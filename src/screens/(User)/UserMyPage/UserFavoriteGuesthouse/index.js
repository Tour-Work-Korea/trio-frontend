import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import styles from './UserFavoriteGuesthouse.styles';

import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';

import FillHeart from '@assets/images/heart_filled.svg';
import fixedImage from '@assets/images/exphoto.jpeg'; // 임시 이미지

const UserFavoriteGuesthouse = () => {
  const [guesthouses, setGuesthouses] = useState([]);

  useEffect(() => {
    fetchFavoriteList();
  }, []);

  const fetchFavoriteList = async () => {
    try {
      const res = await userMyApi.getMyFavoriteGuesthouses();
      setGuesthouses(res.data);
    } catch (error) {
      Alert.alert('데이터 불러오기 실패');
    }
  };

  const toggleFavorite = async (item) => {
    try {
      await userMyApi.unfavoriteGuesthouse(item.id);
      await fetchFavoriteList();
    } catch (error) {
      Alert.alert('즐겨찾기 취소 실패');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={fixedImage} style={styles.image} />
      <View style={styles.content}>
        <Text style={FONTS.fs_h2_bold}>{item.name}</Text>
        <Text style={FONTS.fs_body}>{item.address}</Text>
        <Text style={FONTS.fs_body}>⭐ {item.averageRating} / ₩ {item.minPrice.toLocaleString()}</Text>
        <View style={styles.hashtagContainer}>
          {item.hashtags.map((tag, idx) => (
            <Text key={idx} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
        <FillHeart width={28} height={28} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="게하 좋아요 누른 리스트" />
      <FlatList
        data={guesthouses}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default UserFavoriteGuesthouse;
