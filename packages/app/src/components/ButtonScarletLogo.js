import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import LogoBlack from '@assets/images/logo_black.svg';

// props로
// 1. 버튼 안에 글씨 - title
// 2. 어디 페이지로 이동 할건지 - to
// 사용 예시 Home에 있음
const ButtonScarletLogo = ({to, onPress, disabled = false}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(); // 함수가 있으면 함수 실행
    } else if (to) {
      navigation.navigate(to); // 문자열이면 페이지 이동
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button]}
      onPress={handlePress}
      disabled={disabled}>
      <LogoBlack />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    alignSelf: 'stretch',
    gap: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ButtonScarletLogo;
