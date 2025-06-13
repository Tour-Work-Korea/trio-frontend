import React from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from '../Home.styles';
import {FONTS} from '@constants/fonts';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import {useNavigation} from '@react-navigation/native';

export default function Guesthouses({guesthouses}) {
  const navigation = useNavigation();

  const renderGuesthouse = ({item}) => (
    <View style={styles.guesthouseCard}>
      <Image source={item.image} style={styles.guesthouseImage} />
      {/* <Image source={item.thumbnailImgUrl} style={styles.guesthouseImage} /> */}
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text
          style={styles.guesthouseTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.seeMoreButton}>
          <Text style={[FONTS.fs_12_medium, styles.guesthousePriceName]}>
            최저가
          </Text>
          <Text style={FONTS.fs_16_semibold}>
            {item.minPrice.toLocaleString()}원
          </Text>
        </View>
      </View>
      <View style={styles.seeMoreButton}>
        {item.hashtags.map((hashtag, idx) => (
          <View style={styles.hashtagButton} key={idx}>
            <Text style={[FONTS.fs_12_medium, styles.hashtagText]}>
              #{hashtag}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.guesthouseContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>인기 게스트하우스</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('GuesthouseList');
          }}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={guesthouses}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={renderGuesthouse}
      />
    </View>
  );
}
