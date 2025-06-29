import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

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

  // 선택 날짜, 인원 출력
  const [displayDate, setDisplayDate] = useState('');
  const [guestCount, setGuestCount] = useState(1); // 기본 1명
  // 인원 선택 임시 모달
  const [guestModalVisible, setGuestModalVisible] = useState(false);

  // 날짜는 초기에 오늘~내일 날짜로 설정
  useEffect(() => {
    const today = dayjs();
    const tomorrow = today.add(1, 'day');
    const formattedToday = today.format('M.D ddd');    // 예: 6.29 토
    const formattedTomorrow = tomorrow.format('M.D ddd'); 
    setDisplayDate(`${formattedToday} - ${formattedTomorrow}`);
  }, []);

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
    if (page !== 0) {
      fetchGuesthouses(page);
    }
  }, [page]);

  useFocusEffect(
    React.useCallback(() => {
      // 검색을 이미 한 상태에서만 새로고침
      if (searched) {
        setPage(0);
        setIsLast(false);
        setError(false);
        setGuesthouses([]);
        fetchGuesthouses(0);
      }
    }, [searched])
  );

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
        <View>
        {/* <View  style={[{ flex: 1, justifyContent: 'center' }]}> */}
          <View style={[styles.searchContainer]}>
            <TouchableOpacity style={[styles.searchIconContainer]}
              onPress={handleSearch}
            >
              <SearchIcon width={24} height={24} />
              <Text style={[FONTS.fs_14_regular, styles.searchText]}>찾는 숙소가 있으신가요?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectRow}>
            <TouchableOpacity 
              style={styles.dateContainer}

            >
              <CalendarIcon width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium, styles.dateText]}>{displayDate}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.personRoomContainer}
              onPress={() => setGuestModalVisible(true)}
            >
              <Person width={20} height={20}/>
              <Text style={[FONTS.fs_14_medium, styles.personText]}>인원 {guestCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 임시 인원 수 선택 모달 */}
        <Modal
          visible={guestModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setGuestModalVisible(false)}
        >
          <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor:'white', padding:20, borderRadius:8, width:300 }}>
              <Text style={[FONTS.fs_16_medium, { marginBottom: 10 }]}>인원을 선택하세요</Text>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
                  <Text style={{ fontSize: 24 }}>➖</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18 }}>{guestCount}명</Text>
                <TouchableOpacity onPress={() => setGuestCount(guestCount + 1)}>
                  <Text style={{ fontSize: 24 }}>➕</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primary_orange,
                  marginTop: 20,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 4,
                }}
                onPress={() => {
                  setGuestModalVisible(false);
                }}
              >
                <Text style={{ color: 'white' }}>선택 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
        <TouchableOpacity
          style={styles.dateContainer}
        >
          <CalendarIcon width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.dateText]}>{displayDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.personRoomContainer}
          onPress={() => setGuestModalVisible(true)}
        >
          <Person width={20} height={20}/>
          <Text style={[FONTS.fs_14_medium, styles.personText]}>인원 {guestCount}</Text>
        </TouchableOpacity>
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

      {/* 임시 인원 수 선택 모달 */}
      <Modal
        visible={guestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGuestModalVisible(false)}
      >
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor:'white', padding:20, borderRadius:8, width:300 }}>
            <Text style={[FONTS.fs_16_medium, { marginBottom: 10 }]}>인원을 선택하세요</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <TouchableOpacity onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
                <Text style={{ fontSize: 24 }}>➖</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18 }}>{guestCount}명</Text>
              <TouchableOpacity onPress={() => setGuestCount(guestCount + 1)}>
                <Text style={{ fontSize: 24 }}>➕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary_orange,
                marginTop: 20,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 4,
              }}
              onPress={() => {
                setDisplayGuest(`인원 ${guestCount}`);
                setGuestModalVisible(false);
              }}
            >
              <Text style={{ color: 'white' }}>선택 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GuesthouseList;
