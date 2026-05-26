import React from 'react';
import {View, StyleSheet} from 'react-native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';

export default function GuesthouseCheckInGuide() {
  return (
    <View style={styles.container}>
      <Header title="체크인 안내" />
      <View style={styles.content} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    flex: 1,
  },
});
