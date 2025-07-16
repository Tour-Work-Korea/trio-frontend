import React from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from '../Employ.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import Star from '@assets/images/star_white.svg';

export default function WorkAndStay({guesthouses}) {
  const navigation = useNavigation();

  const renderGuesthouse = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('GuesthouseDetail', {
          id: item.id,
        });
      }}>
      <View style={styles.guesthouseCard}>
        <View>
          {item.thumbnailImgUrl ? (
            <Image
              source={{uri: item.thumbnailImgUrl}}
              style={styles.guesthouseImage}
            />
          ) : (
            <View
              style={[
                styles.guesthouseImage,
                {backgroundColor: COLORS.grayscale_200},
              ]}
            />
          )}
          <View style={styles.ratingBox}>
            <Star width={14} height={14} />
            <Text style={[FONTS.fs_14_medium, styles.ratingText]}>
              {item.averageRating}
            </Text>
          </View>
        </View>
        <View style={[styles.titleSection, {marginBottom: 10}]}>
          <Text
            style={styles.guesthouseTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.name}
          </Text>
          <View style={styles.guesthousePrice}>
            <Text style={[FONTS.fs_12_medium, styles.guesthousePriceName]}>
              최저가
            </Text>
            <Text style={FONTS.fs_16_semibold}>
              {item.minPrice.toLocaleString()}원 ~
            </Text>
          </View>
        </View>
        <View style={styles.hashTagContainer}>
          {item.hashtags.map((hashtag, idx) => (
            <View style={styles.hashtagButton} key={idx}>
              <Text style={[FONTS.fs_12_medium, styles.hashtagText]}>
                {hashtag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.guesthouseContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>
          <Text style={{color: COLORS.primary_orange}}>Work + Stay</Text>를 한
          번에
        </Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('PopularGuesthouseList');
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
        ItemSeparatorComponent={() => <View style={{width: 20}} />}
      />
    </View>
  );
}
