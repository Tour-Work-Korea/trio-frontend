import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import SearchEmpty from '@assets/images/search_empty.svg';

const EmptyResult = () => {
  return (
    <View style={styles.container}>
      <SearchEmpty />
      <Text style={[FONTS.fs_16_medium, styles.text]}>
        앗, 찾는 결과가 없어요
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    },
  text: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EmptyResult;
