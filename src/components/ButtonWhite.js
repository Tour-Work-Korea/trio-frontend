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
const ButtonWhite = ({title, to, marginHorizontal = 15}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (to) {
      navigation.navigate(to);
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
    backgroundColor: COLORS.white,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  text: {
    color: COLORS.gray,
    lineHeight: 22,
  },
});

export default ButtonWhite;
