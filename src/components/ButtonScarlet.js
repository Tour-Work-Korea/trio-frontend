import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

// props로
// 1. 버튼 안에 글씨 - title
// 2. 어디 페이지로 이동 할건지 - to
// 사용 예시 Home에 있음
const ButtonScarlet = ({title, to, onPress, Icon, disabled = false, style}) => {
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
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? COLORS.grayscale_200
            : COLORS.primary_orange,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}>
      {Icon ? <Icon width={24} height={24} /> : null}
      <Text
        style={[
          styles.text,
          {
            color: disabled ? COLORS.grayscale_400 : COLORS.white,
          },
        ]}>
        {title}
      </Text>
      {Icon ? (
        <View style={[styles.hiddenButton]}>
          <View width={24} height={24} />
        </View>
      ) : null}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    flex: 1,
    ...FONTS.fs_16_semibold,
    color: COLORS.white,
    lineHeight: 22,
  },
});

export default ButtonScarlet;
