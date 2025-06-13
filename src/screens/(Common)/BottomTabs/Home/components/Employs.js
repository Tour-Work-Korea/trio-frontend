import React from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from '../Home.styles';
import {FONTS} from '@constants/fonts';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import {useNavigation} from '@react-navigation/native';
import {toggleLikeRecruit} from '@utils/handleFavorite';

export default function Employs({jobs, setEmployList}) {
  const navigation = useNavigation();

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  const renderJob = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        moveToDetail(item.recruitId);
      }}>
      <View style={styles.jobCard}>
        <Image source={item.thumbnailImage} style={styles.jobImage} />

        {/* jobInfo 전체 */}
        <View style={styles.jobInfo}>
          {/* 위쪽: 텍스트 묶음 */}
          <View style={{marginBottom: 10}}>
            {/* 게스트하우스명과 좋아요 */}
            <View style={styles.titleSection}>
              <View style={styles.hashtagButton}>
                <Text
                  style={styles.hashtagText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.guesthouseName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  toggleLikeRecruit(
                    item.recruitId,
                    item.isLiked,
                    setEmployList,
                  );
                }}>
                {item.isLiked ? (
                  <HeartFilled width={20} height={20} />
                ) : (
                  <HeartEmpty width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* 모집글 제목 */}
            <View style={styles.titleSection}>
              <Text
                style={[FONTS.fs_14_semibold, {marginRight: 12}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.recruitTitle.length > 15
                  ? `${item.recruitTitle.slice(0, 15)}...`
                  : item.recruitTitle}
              </Text>
              <Text style={styles.count}>
                {item?.deadline?.split('-')[1]}/{item?.deadline?.split('-')[2]}
              </Text>
            </View>
          </View>

          {/* 아래쪽: 주소 */}
          <View style={[styles.seeMoreButton, FONTS.fs_12_medium]}>
            <Text style={{marginRight: 12}}>{item.workDate}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail">
              {item.address}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.jobContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>추천 일자리</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('EmployList');
          }}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={item => item.recruitId.toString()}
        renderItem={renderJob}
        scrollEnabled={false}
        contentContainerStyle={{flexGrow: 1}}
      />
    </View>
  );
}
