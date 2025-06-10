import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

// props로
// 1. 버튼 안에 글씨 - title
// 2. 어디 페이지로 이동 할건지 - to
// 3. marginHorizontal 기본으로 15 적용해놓음(필요시 값 넘기면 됩니다)
// 사용 예시 Home에 있음
const ButtonScarlet = ({title, to, onPress, marginHorizontal = 15}) => {
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
      style={[styles.button, {marginHorizontal}]}
      onPress={handlePress}>
      <Text style={[FONTS.fs_16_semibold, styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary_orange,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    color: COLORS.white,
    lineHeight: 22,
  },
});

export default ButtonScarlet;
