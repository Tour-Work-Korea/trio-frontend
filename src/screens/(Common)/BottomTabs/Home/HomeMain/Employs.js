import React from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import styles from './Home.styles';
import {FONTS} from '@constants/fonts';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import {useNavigation} from '@react-navigation/native';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import {RecruitList} from '@components/Employ/RecruitList';

export default function Employs({jobs, setEmployList}) {
  const navigation = useNavigation();

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  return (
    <View style={styles.jobContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>추천 일자리</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('EmployIntro');
          }}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <RecruitList
        data={jobs}
        onEndReached={() => {}}
        onJobPress={moveToDetail}
        onToggleFavorite={toggleLikeRecruit}
        setRecruitList={setEmployList}
        scrollEnabled={false}
      />
    </View>
  );
}
