import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ChevronLeft from '@assets/images/chevron_left_gray.svg';
import Logo from '@assets/images/logo_orange.svg';

// Header 사용법
// - title이 있으면 중앙 제목 헤더, 없으면 중앙 로고 헤더를 렌더링
// - showBackButton이 true면 왼쪽 뒤로가기 버튼을 표시
// - onPress를 넘기면 뒤로가기 대신 해당 콜백을 실행

const Header = ({title, onPress = null, showBackButton = true}) => {
  const navigation = useNavigation();
  const handleOnPress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.subTitleWrapper}>
          <View style={[styles.sideSlot, styles.leftContainer]}>
            {showBackButton ? (
              <TouchableOpacity style={styles.iconButton} onPress={handleOnPress}>
                <ChevronLeft width={28} height={28} />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={[styles.subTitle]}>{title}</Text>
        </View>
      ) : (
        <View style={styles.logoWrapper}>
          <Logo />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  subTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftContainer: {
    left: 20,
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
  logoWrapper: {
    alignSelf: 'center', // 로고를 수평 가운데로
  },
});

export default Header;
