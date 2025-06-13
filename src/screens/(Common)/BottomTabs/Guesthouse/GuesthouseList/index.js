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

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import CalendarIcon from '@assets/images/calendar_white.svg';
import Person from '@assets/images/person20_white.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';
import Star from '@assets/images/star_white.svg';

import styles from './GuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
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
  const [searched, setSearched] = useState(false);

  // 임의 선택 날짜, 인원, 객실 수 출력
  const [displayDate, setDisplayDate] = useState('3.28 금 - 3.29 토');
  const [displayGuest, setDisplayGuest] = useState('인원 1, 객실 1');

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

  // 검색 후 리스트 불러오는 함수
  const handleSearch = () => {
    setSearched(true);
    fetchGuesthouses(0);
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

  // 처음 화면(검색전)
  if (!searched) {
    return (
      <View style={styles.container}>
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>게스트 하우스</Text>
        <View  style={[{ flex: 1, justifyContent: 'center' }]}>
          <View style={[styles.searchContainer]}>
            <TouchableOpacity style={[styles.searchIconContainer]}
              onPress={handleSearch}
            >
              <SearchIcon width={24} height={24} />
              <Text style={[FONTS.fs_14_regular, styles.searchText]}>찾는 숙소가 있으신가요?</Text>
            </TouchableOpacity><TouchableOpacity>
                <View style={styles.filterIconContainer}>
                  <FilterIcon width={24} height={24} />
                </View>
              </TouchableOpacity>
          </View>
          <View style={styles.selectRow}>
            <View style={styles.dateContainer}>
              <CalendarIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium, styles.dateText]}>날짜</Text>
            </View>
            <View style={styles.personRoomContainer}>
              <Person width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium, styles.personText]}>인원, 객실 수</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('GuesthouseDetail', {
      id: item.id
    })}>
      <View style={styles.card}>
        <View style={styles.imgRatingContainer}>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.image}
          />
          {/* 실제 이미지 데이터 사용할 때 */}
          {/* <Image
            source={{ uri: item.thumbnailImgUrl }}
            style={styles.image}
          /> */}
          <View style={styles.rating}>
            <Star width={14} height={14} />
            <Text style={[FONTS.fs_12_medium, styles.ratingText]}>
              {item.averageRating?.toFixed(1) ?? '0.0'}
            </Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            {item.hashtags && item.hashtags.map((tag, index) => (
              <View style={styles.tagContainer}>
                <Text key={index} style={[FONTS.fs_body, styles.tagText]}>
                  {tag}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={() => toggleLike(item.id, item.favorite)}
            >
              {item.favorite ? <FillHeart width={20} height={20}/> : <EmptyHeart width={20} height={20}/>}
            </TouchableOpacity>
          </View>
          <Text style={[FONTS.fs_16_medium, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.address]}>{item.address}</Text>
          <View style={styles.bottomRow}>
            <Text style={[FONTS.fs_18_semibold, styles.price]}>
              {item.minPrice.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_20_semibold, styles.headerText]}>게스트 하우스</Text>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchIconContainer}>
          <SearchIcon width={24} height={24}/>
          <Text style={[FONTS.fs_14_regular, styles.searchText]}>찾는 숙소가 있으신가요?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.filterIconContainer}>
            <FilterIcon width={24} height={24}/>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.selectRow}>
        <View
          style={[
            styles.dateContainer,
            searched && { backgroundColor: COLORS.primary_orange },
          ]}
        >
          <CalendarIcon width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.dateText]}>날짜</Text>
        </View>
        <View
          style={[
            styles.personRoomContainer,
            searched && { backgroundColor: COLORS.primary_orange },
          ]}
        >
          <Person width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.personText]}>인원, 객실 수</Text>
        </View>
      </View>

      {searched && (
        <View style={styles.printSelectContainer}>
          <View style={styles.printSelectBox}>
            <Text style={[FONTS.fs_14_medium, styles.printDateText]}>
              {displayDate}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.printGuestText]}>
              {displayGuest}
            </Text>
          </View>
        </View>
      )}

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
