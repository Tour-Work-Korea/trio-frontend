import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import styles from './MeetSearch.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import ChevronLeft from '@assets/images/chevron_left_gray.svg';

const MeetSearch = () => {
  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_18_regular, styles.text]}>
        지금은 수리 중이에요{'\n'}
        조금만 기다려주세요!
      </Text>
    </View>
  );
};

export default MeetSearch;
