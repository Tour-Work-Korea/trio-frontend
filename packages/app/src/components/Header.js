import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ChevronLeft from '@assets/images/chevron_left_gray.svg';
import Logo from '@assets/images/logo_orange.svg';
import useUserStore from '@stores/userStore';
import AdaptiveText from '@components/AdaptiveText';

// Header 사용법
// - title이 있으면 중앙 제목 헤더, 없으면 중앙 로고 헤더를 렌더링
// - showBackButton이 true면 왼쪽 뒤로가기 버튼을 표시
// - onPress를 넘기면 뒤로가기 대신 해당 콜백을 실행
// - rightComponent를 넘기면 제목 헤더 오른쪽에 렌더링

const Header = ({
  title,
  onPress = null,
  showBackButton = true,
  rightComponent = null,
}) => {
  const {t, i18n} = useTranslation();
  const isEnglish = i18n.resolvedLanguage === 'en';
  const navigation = useNavigation();
  const handleOnPress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  const accessToken = useUserStore(state => state.accessToken);
  const isLoggedIn = !!accessToken;

  const handlePressLogin = () => {
    navigation.navigate('Login');
  };

  // 로그인 버튼 노출 여부: 로그인되어 있지 않고, 다른 우측 컴포넌트가 없으며, (타이틀이 있다면 뒤로가기 버튼이 없는 메인화면이거나, 로고 헤더일 때)
  const showLoginButton =
    !isLoggedIn && !rightComponent && (title ? !showBackButton : true);

  const rightElement =
    rightComponent ||
    (showLoginButton ? (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePressLogin}
        style={styles.loginButton}>
        <Text style={[FONTS.fs_12_medium, styles.loginButtonText]}>
          {t('components.loginSignUp')}
        </Text>
      </TouchableOpacity>
    ) : null);

  const titleHorizontalPadding = rightElement ? (isEnglish ? 96 : 148) : 64;

  return (
    <View style={styles.container}>
      {title ? (
        <View
          style={[
            styles.subTitleWrapper,
            isEnglish && styles.englishSubTitleWrapper,
            {paddingHorizontal: titleHorizontalPadding},
          ]}>
          <View style={[styles.sideSlot, styles.leftContainer]}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleOnPress}>
                <ChevronLeft width={28} height={28} />
              </TouchableOpacity>
            ) : null}
          </View>
          <AdaptiveText variant="header" style={styles.subTitle}>
            {title}
          </AdaptiveText>
        </View>
      ) : (
        <View style={styles.logoWrapper}>
          <Logo width={51} height={24} />
        </View>
      )}

      {rightElement && (
        <View style={styles.rightContainer}>{rightElement}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    position: 'relative',
  },
  subTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  englishSubTitleWrapper: {
    minHeight: 28,
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
  rightContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
    maxWidth: '100%',
    textAlign: 'center',
  },
  logoWrapper: {
    alignSelf: 'center', // 로고를 수평 가운데로
  },
  loginButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: COLORS.primary_orange,
  },
});

export default Header;
