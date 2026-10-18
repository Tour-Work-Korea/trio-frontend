import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './Home.styles';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';

import AlertModal from '@components/modals/AlertModal';
import RecruitCard from '@components/Employ/RecruitList/RecruitCard';
import {toggleFavorite} from '@utils/toggleFavorite';

export default function Employs({jobs = [], setEmployList}) {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  return (
    <View style={styles.jobContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>{t('common.recommendedJobs')}</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('PopularEmployList');
          }}>
          <Text style={styles.seeMoreText}>{t('common.seeMore')}</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={{gap: 16}}>
        {jobs.map(item => (
          <RecruitCard
            key={item.recruitId}
            item={item}
            onPress={() => moveToDetail(item.recruitId)}
            onToggleFavorite={() =>
              toggleFavorite({
                type: 'recruit',
                id: item.recruitId,
                isLiked: item.isLiked,
                setList: setEmployList,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}
