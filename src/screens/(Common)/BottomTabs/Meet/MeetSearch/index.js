import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetSearch.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import ChevronLeft from '@assets/images/chevron_left_gray.svg';

// 임시 데이터
import { MOCK_MEETS } from './mockData';

const MeetSearch = () => {
  const navigation = useNavigation();

  // 좋아요 토글
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 날짜 출력
  const todayKey = dayjs().format('YYYY-MM-DD');

  const formatWhen = isoStr => {
    const d = dayjs(isoStr);
    const isToday = d.format('YYYY-MM-DD') === todayKey;
    const label = isToday ? '오늘, ' : `${d.date()}일, `;
    const time = `${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
    return { isToday, label: label + time };
  };

  // 모임 리스트
  const renderItem = ({ item }) => {
    const when = formatWhen(item.startAt);
    const isFav = !!favorites[item.id];

    return (
      <TouchableOpacity 
        style={styles.itemWrap}
        onPress={() => navigation.navigate('MeetDetail')}
      >
        <View style={styles.itemTopWrap}>
          <Image source={item.thumbnail} style={styles.thumbnail} />
          <View style={styles.infoWrap}>
            <View style={styles.nameHeartWrap}>
              <Text style={[FONTS.fs_12_medium, styles.placeText]} numberOfLines={1}>
                {item.placeName}
              </Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                {isFav ? <HeartFilled width={20} height={20} /> : <HeartEmpty width={20} height={20} />}
              </TouchableOpacity>
            </View>
            <View style={styles.titleCapacityWrap}>
              <Text style={[FONTS.fs_14_medium, styles.titleText]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.countText]}>
                {item.joined}/{item.capacity}명
              </Text>
            </View>
            <Text style={[FONTS.fs_18_semibold, styles.priceText]}>
              {item.price.toLocaleString()}원
            </Text>
          </View>
        </View>
      
        <View style={styles.itemBottomWrap}>
          <Text style={[FONTS.fs_12_medium, styles.addressText]}>
            {item.address}
          </Text>
          <Text
            style={[
              FONTS.fs_12_medium,
              styles.timeText,
              when.isToday && styles.timeTextToday,
            ]}
          >
            {when.label}
          </Text>
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft width={24} height={24} />
        </TouchableOpacity>
        <Text style={[FONTS.fs_20_semibold, styles.headerTitle]}>모임</Text>
      </View>

      {/* 검색창 */}
      <View style={styles.searchBox}>
        <SearchIcon width={24} height={24} />
        <TextInput
          placeholder="찾는 모임이 있으신가요?"
          style={[FONTS.fs_14_regular, styles.input]}
          placeholderTextColor={COLORS.grayscale_600}
        />
      </View>

      {/* 모임 리스트 */}
      <View style={styles.meetListContainer}>
        <Text style={[FONTS.fs_14_medium, styles.sectionTitle]}>
          모임 중인 게스트하우스
        </Text>

        <FlatList
          data={MOCK_MEETS}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 16, }}
        />
      </View>

    </View>
  );
};

export default MeetSearch;
