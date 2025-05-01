import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
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

const mockData = [
  {
    id: '1',
    tags: ['감성'],
    title: '제목제목제목제목제목',
    name: '낭만 가득 청춘 하우스',
    address: '제주시 애월리 20002-7',
    rating: 4.2,
    price: 55000,
    liked: false,
  },
  {
    id: '2',
    tags: ['외국인친화', '자연'],
    title: '어서오세요 게하',
    name: '자연 게스트하우스',
    address: '제주시 애월리 20002-7',
    rating: 3.7,
    price: 45000,
    liked: false,
  },
  {
    id: '3',
    tags: ['바다뷰'],
    title: '바닷소리가 들리는 낭만',
    name: '파도소리 게스트하우스',
    address: '제주시 애월리 20002-7',
    rating: 4.8,
    price: 67000,
    liked: false,
  },
  {
    id: '4',
    tags: ['감성', '커플추천'],
    title: '감성 듬뿍~',
    name: '로맨틱 무드 숙소',
    address: '제주시 애월리 20002-7',
    rating: 4.5,
    price: 62000,
    liked: false,
  },
  {
    id: '5',
    tags: ['자연'],
    title: '자연속에 빠져보기',
    name: '숲속 힐링하우스',
    address: '제주시 애월리 20002-7',
    rating: 4.3,
    price: 49000,
    liked: false,
  },
];
// 달력 아이콘 누르면 캘린더 나와서 수정할 수 있게 - 예정
// 사람 아이콘 누르면 인원, ? 나와서 수정할 수 있게 - 예정

const GuesthouseList = () => {
  const [guesthouses, setGuesthouses] = useState(mockData);
  const navigation = useNavigation();

  const toggleLike = (id) => {
    const updated = guesthouses.map((item) =>
      item.id === id ? { ...item, liked: !item.liked } : item
    );
    setGuesthouses(updated);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('GuesthouseDetail', { id: item.id })}>
      <View style={styles.card}>
        <Image
          source={require('@assets/images/exphoto.jpeg')}
          style={styles.image}
        />
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={[FONTS.fs_body, styles.tagText]}>
                #{tag}
              </Text>
            ))}
          </View>
          <Text style={[FONTS.fs_body, styles.title]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[FONTS.fs_body_bold, styles.name]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[FONTS.fs_body, styles.address]}>{item.address}</Text>
          <View style={styles.bottomRow}>
            <View style={styles.rating}>
              <Star width={12} height={12} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={[FONTS.fs_body_bold, styles.price]}>
              {item.price.toLocaleString()}원
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleLike(item.id)}
        >
          {item.liked ? <FillHeart /> : <EmptyHeart />}
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default GuesthouseList;
