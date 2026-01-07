// HostProfileEvents.js
import React, {useMemo} from 'react';
import {View, Text, Image, FlatList, StyleSheet} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const HostProfileStaff = () => {
  // ✅ 임시 이벤트 목록 (나중에 API로 교체)
  const events = useMemo(
    () => [
      {
        id: '1',
        title: '이상한밤의 미니 방탈출 + 포틀럭 + 불멍',
        dateTimeText: '1.02 (금) 19:30~23:00',
        priceText: '10,000원',
        locationText: '제주시 흥운길 25-7 1층',
        image: require('@assets/images/exphoto.jpeg'),
      },
      {
        id: '2',
        title: '신년 맞이 보드게임 + 야식 타임',
        dateTimeText: '1.08 (목) 20:00~23:30',
        priceText: '5,000원',
        locationText: '제주시 흥운길 25-7 1층',
        image: require('@assets/images/exphoto.jpeg'),
      },
      {
        id: '3',
        title: '제주 감성 산책 + 사진 찍기',
        dateTimeText: '1.12 (월) 15:00~17:30',
        priceText: '무료',
        locationText: '제주시 흥운길 25-7 1층',
        image: require('@assets/images/exphoto.jpeg'),
      },
    ],
    [],
  );

  const renderItem = ({item}) => {
    return (
      <View style={styles.card}>
        <Image source={item.image} style={styles.thumb} />

        <View style={styles.info}>
          <Text style={[FONTS.fs_14_bold, styles.title]} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={[FONTS.fs_12_regular, styles.sub]} numberOfLines={1}>
            {item.dateTimeText} • {item.locationText}
          </Text>

          <Text style={[FONTS.fs_14_bold, styles.price]}>
            {item.priceText}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 필요하면 타이틀도 살려서 쓰면 됨 */}
      {/* <Text style={[FONTS.fs_16_bold, styles.sectionTitle]}>이벤트 목록</Text> */}

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        scrollEnabled={false} // ✅ 바깥 ScrollView랑 같이 쓰는 구조면 false가 안전
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default HostProfileStaff;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },

  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },

  card: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 12,
  },

  thumb: {
    width: 78,
    height: 78,
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_100,
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },

  title: {
    color: COLORS.grayscale_900,
  },

  sub: {
    marginTop: 6,
    color: COLORS.grayscale_600,
  },

  price: {
    marginTop: 10,
    color: COLORS.grayscale_900,
  },
});
