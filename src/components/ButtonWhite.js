import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {navigationRef} from '@utils/navigationService';

// props로
// 1. 버튼 안에 글씨 - title
// 2. 어디 페이지로 이동 할건지 - to
// 3. backgroundColor: 노랑색이나 초록색(회원가입시 sns회원가입) 때문에 추가했고, 기본적으로 회색입니다.
// 4. disabled true하면 버튼 내에 글자가 회색으로 나오게 설정했어요
// 5. 왼쪽에 아이콘이 있는 경우 Icon으로 아이콘 컴포넌트 넘거주면 됩니다.
// 6. 기본적으로 배경색 있음 없앨경우 outlined true하고 색상 넘기기
// 사용 예시 UserRegisterIntro에 있음
const ButtonWhite = ({
  title,
  to,
  onPress,
  Icon,
  disabled = false,
  style,
  backgroundColor = COLORS.grayscale_200,
  textColor = COLORS.grayscale_900,
  outlined = false,
  borderColor = COLORS.grayscale_400,
}) => {
  const handlePress = () => {
    if (disabled) return;
    if (onPress) {
      onPress(); // 함수가 있으면 함수 실행
    } else if (to) {
      navigationRef.navigate(to); // 문자열이면 페이지 이동
    }
  };

  // 배경
  const buttonStyle = disabled
    ? {
        backgroundColor: COLORS.grayscale_200,
        borderWidth: 0,
      }
    : outlined
    ? {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor,
      }
    : {
        backgroundColor,
        borderWidth: 0,
      };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled}>
      {Icon ? <Icon width={24} height={24} /> : null}
      <Text
        style={[
          {color: textColor},
          styles.text,
          disabled ? styles.textDisabled : null,
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
    backgroundColor: COLORS.grayscale_200,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    height: 40,
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
    lineHeight: 22,
  },
  textDisabled: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_400,
    lineHeight: 22,
  },
});

export default ButtonWhite;
