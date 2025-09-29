import React, { useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { useNavigation } from '@react-navigation/native';

import styles from './UserFavoriteMeet.styles';
import Header from '@components/Header'; 
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import Loading from '@components/Loading';
import EmptyState from '@components/EmptyState';

import FillHeart from '@assets/images/heart_filled.svg';
import SearchEmpty from '@assets/images/search_empty_sprinkle.svg';

// 임시 데이터
const MOCK = [
  {
    id: 1,
    guesthouseName: '막내네 게스트하우스',
    title: '남성 스텝 모집',
    address: '제주시 애월리 20002-7',
    price: 55000,
    // 오늘 오전 9시
    datetime: dayjs().hour(9).minute(0).second(0).toISOString(),
    liked: 10,
    limit: 10,
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 2,
    guesthouseName: '막내네 게스트하우스',
    title: '남성 스텝 모집',
    address: '제주시 애월리 20002-7',
    price: 55000,
    // 오늘 오후 8시
    datetime: dayjs().hour(20).minute(0).second(0).toISOString(),
    liked: 8,
    limit: 10,
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 3,
    guesthouseName: '막내네 게스트하우스',
    title: '남성 스텝 모집',
    address: '제주시 애월리 20002-7',
    price: 55000,
    // 내일 오전 9시
    datetime: dayjs().add(1, 'day').hour(9).minute(0).second(0).toISOString(),
    liked: 4,
    limit: 10,
    image: require('@assets/images/exphoto.jpeg'),
  },
  {
    id: 4,
    guesthouseName: '막내네 게스트하우스',
    title: '남성 스텝 모집',
    address: '제주시 애월리 20002-7',
    price: 55000,
    // 모레 오전 9시
    datetime: dayjs().add(2, 'day').hour(9).minute(0).second(0).toISOString(),
    liked: 2,
    limit: 10,
    image: require('@assets/images/exphoto.jpeg'),
  },
];

const UserFavoriteMeet = () => {
  const navigation = useNavigation();

  const data = useMemo(
    () => [...MOCK].sort((a, b) => dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf()),
    []
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
                  ellipsizeMode="tail"
                >
                  {item.guesthouseName}
                </Text>
                <TouchableOpacity>
                  <FillHeart width={20} height={20} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoContainer}>
                <Text
                  style={[FONTS.fs_14_medium, styles.titleText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <Text style={[FONTS.fs_12_medium, styles.heartText]}>
                  {` ${item.liked}/${item.limit}명`}
                </Text>
              </View>
            </View>

            <Text style={[FONTS.fs_18_semibold, styles.priceText]}>
              {item.price.toLocaleString()}원
            </Text>

          </View>
        </View>

        <View style={styles.down}>
          <Text
            style={[FONTS.fs_12_medium, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.address}
          </Text>
          <Text
            style={[
              FONTS.fs_12_medium,
              isToday ? {color: COLORS.primary_orange} : {color: COLORS.grayscale_800},
            ]}
            numberOfLines={1}
          >
            {dateLabel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title='즐겨찾는 모임' />

      <View style={styles.body}>
        <FlatList
          data={data}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <EmptyState
                icon={SearchEmpty}
                iconSize={{ width: 210, height: 112 }}
                title="아직 즐겨찾는 모임이 없어요"
                description="마음에 드는 모임을 빠르게 볼 수 있어요!"
                buttonText="모임 찾으러 가기"
                onPressButton={() => navigation.navigate('MainTabs', { screen: '모임' })}
              />
            </View>
          }
          contentContainerStyle={{flexGrow: 1}}
        />
      </View>
      
    </View>
  );
};

export default UserFavoriteMeet;
