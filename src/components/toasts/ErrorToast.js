import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

// 사용법 
// import Toast from 'react-native-toast-message';
// Toast.show({
//   type: 'error',
//   text1: '오류가 생겼어요',
//   position: 'top',
//   visibilityTime: 2000,
// });

const ErrorToast = ({ text1 }) => {
  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_14_medium, styles.text]}>{text1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.semantic_red,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 30,
  },
  text: {
    color: COLORS.grayscale_0,
  },
});

export default ErrorToast;
