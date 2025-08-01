import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import Logo from '@assets/images/logo_orange.svg';

//props로 적힐 내용 받음 - title
//title을 안 넘기고 사용하면 로고만 있는 헤더로 나옴
//왼쪽 화살표 누르면 뒤로가기가 되도록 해놓았음
//예시는 EXHome에 있습니다

const Header = ({title}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.subTitleWrapper}>
          <TouchableOpacity
            style={styles.backContainer}
            onPress={navigation.goBack}>
            <ChevronLeft width={28} height={28} />
          </TouchableOpacity>
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
    //height: 36,
    paddingVertical: 12,
  },
  subTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backContainer: {
    position: 'absolute',
    left: 20,
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
