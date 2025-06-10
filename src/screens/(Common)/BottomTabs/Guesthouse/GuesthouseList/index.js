import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

import SearchIcon from '@assets/images/gray_search.svg';
import FilterIcon from '@assets/images/scarlet_filter.svg';
import CalendarIcon from '@assets/images/Calendar.svg';
import Person from '@assets/images/Person.svg';
import FillHeart from '@assets/images/Fill_Heart.svg';
import EmptyHeart from '@assets/images/Empty_Heart.svg';
import Star from '@assets/images/Star.svg';

import Header from '@components/Header';
import styles from './GuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';

// 달력 아이콘 누르면 캘린더 나와서 수정할 수 있게 - 예정
// 사람 아이콘 누르면 인원, ? 나와서 수정할 수 있게 - 예정

const GuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // 게하 검색 후 불러오기
  const fetchGuesthouses = async (pageToFetch = 0) => {
    if (loading || isLast || error) return;
    setLoading(true);

    try {
      // 보낼 임의 데이터
      const params = {
        checkIn: '2025-05-20',
        checkOut: '2025-05-21',
        guestCount: 2,
        roomCount: 1,
        page: pageToFetch,
        size: 10,
        sort: 'id',
      };
      const response = await userGuesthouseApi.getGuesthouseList(params);
      const { content, last } = response.data;
      setGuesthouses(prev => pageToFetch === 0 ? content : [...prev, ...content]);
      setIsLast(last);
    } catch (e) {
      setError(true); // 한번이라도 실패하면 더이상 호출X
      setIsLast(true); // (추가) 무한호출도 막음
      console.warn('게스트하우스 조회 실패', e);
    } finally {
      setLoading(false);
    }
  };

  // 무한스크롤
  useEffect(() => {
    fetchGuesthouses(page);
  }, [page]);

  const handleEndReached = () => {
    if (!loading && !isLast) {
      setPage(prev => prev + 1);
    }
  };

  const toggleLike = async (id, liked) => {
    try {
      if (liked) {
        await userGuesthouseApi.unfavoriteGuesthouse(id);
      } else {
        await userGuesthouseApi.favoriteGuesthouse(id);
      }
      setGuesthouses(prev =>
        prev.map(item =>
          item.id === id ? { ...item, favorite: !item.favorite } : item
        )
      );
    } catch (e) {
      console.warn('찜 실패', e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('GuesthouseDetail', {
      id: item.id
    })}>
      <View style={styles.card}>
        <Image
          source={require('@assets/images/exphoto.jpeg')}
          style={styles.image}
        />
        {/* 실제 이미지 데이터 사용할 때 */}
        {/* <Image
          source={{ uri: item.thumbnailImgUrl }}
          style={styles.image}
        /> */}
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            {item.hashtags && item.hashtags.map((tag, index) => (
              <Text key={index} style={[FONTS.fs_body, styles.tagText]}>
                #{tag}
              </Text>
            ))}
          </View>
          <Text style={[FONTS.fs_body_bold, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[FONTS.fs_body, styles.address]}>{item.address}</Text>
          <View style={styles.bottomRow}>
            <View style={styles.rating}>
              <Star width={12} height={12} />
              <Text style={styles.ratingText}>
                {item.averageRating?.toFixed(1) ?? '0.0'}
              </Text>
            </View>
            <Text style={[FONTS.fs_body_bold, styles.price]}>
              {item.minPrice.toLocaleString()}원
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleLike(item.id, item.favorite)}
        >
          {item.favorite ? <FillHeart /> : <EmptyHeart />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.searchContainer}>
          <SearchIcon width={16} height={16}/>
        </TouchableOpacity>
        <TouchableOpacity>
          <FilterIcon width={16} height={16}/>
        </TouchableOpacity>
      </View>

      <View style={styles.selectRow}>
        <CalendarIcon width={18} height={18}/>
        <Text style={[FONTS.fs_body_bold, styles.dateText]}>3.28 금 - 3.29 토</Text>
        <Person width={16} height={16}/>
        <Text style={[FONTS.fs_body_bold, styles.personText]}>인원 1, 객실 1</Text>
      </View>

      <FlatList
        data={guesthouses}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.7}
        ListFooterComponent={loading && <ActivityIndicator size="small" color="gray" />}
      />
    </View>
  );
};

export default GuesthouseList;
