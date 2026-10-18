import React from 'react';
import {TouchableOpacity, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {navigationRef} from '@utils/navigationService';
import AdaptiveText from '@components/AdaptiveText';

// props로
// 1. 버튼 안에 글씨 - title
// 2. 어디 페이지로 이동 할건지 - to
// 사용 예시 Home에 있음
const ButtonScarlet = ({title, to, onPress, Icon, disabled = false, style}) => {
  const {i18n} = useTranslation();
  const isEnglish = i18n.resolvedLanguage === 'en';
  const handlePress = () => {
    if (onPress) {
      onPress(); // 함수가 있으면 함수 실행
    } else if (to) {
      navigationRef.navigate(to); // 문자열이면 페이지 이동
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isEnglish && styles.englishButton,
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
      <AdaptiveText
        variant="button"
        style={[
          styles.text,
          {
            color: disabled ? COLORS.grayscale_400 : COLORS.grayscale_0,
          },
        ]}>
        {title}
      </AdaptiveText>
      {Icon ? (
        <View style={[styles.hiddenButton]}>
          <View style={styles.hiddenIconSpace} />
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
    height: 40,
    borderRadius: 8,
    alignSelf: 'stretch',
    gap: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  englishButton: {
    height: undefined,
    minHeight: 40,
  },
  text: {
    textAlign: 'center',
    flex: 1,
    minWidth: 0,
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_0,
    lineHeight: 22,
  },
  hiddenIconSpace: {
    width: 24,
    height: 24,
  },
});

export default ButtonScarlet;
