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

  // const handlePress = () => {
  //   if (onPress) {
  //     onPress(); // 함수가 있으면 함수 실행
  //   } else if (to) {
  //     navigation.navigate(to); // 문자열이면 페이지 이동
  //   }
  // };

  const handlePress = () => {
    if (onPress) {
      onPress(); // 함수 있으면 그거 실행
    } else if (typeof to === 'string') {
      navigation.navigate(to); // 단순한 스크린 이름
    } else if (typeof to === 'object' && to?.tab && to?.screen) {
      navigation.navigate(to.tab, { screen: to.screen }); // 탭 내 스크린
    } else if (typeof to === 'object' && to?.tab) {
      navigation.navigate(to.tab); // 탭 이동
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, {marginHorizontal}]}
      onPress={handlePress}>
      <Text style={[FONTS.fs_body_bold, styles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.scarlet,
    height: 40,
    borderRadius: 5,
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
