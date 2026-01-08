import React from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ButtonWhite from '@components/ButtonWhite';

import styles from '../Login.styles';
import {COLORS} from '@constants/colors';
import LogoOrange from '@assets/images/logo_orange.svg';
import LogoBlue from '@assets/images/logo_blue.svg';

export default function FindIntro({route}) {
  const {userRole, find, originPhone = null} = route.params;
  const navigation = useNavigation();

  // 사장님 분기
  const isHost = userRole === 'HOST';
  const MainLogo = isHost ? LogoBlue : LogoOrange;
  const mainColor = isHost
    ? COLORS.primary_blue
    : COLORS.primary_orange;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <View  style={styles.titleContainer}>
                <MainLogo width={60} height={29} />
                {isHost && (
                  <Text style={styles.subTitleText}>워커웨이 비즈니스</Text>
                )}
              </View>
              <View>
                <Text style={[styles.titleText]}>
                  {find === 'email' ? '아이디' : '비밀번호'}를 찾으려면
                </Text>
                <Text style={[styles.titleText]}>본인 인증이 필요해요!</Text>
              </View>
            </View>
          </View>
          <ButtonWhite
            title={'본인 인증하기'}
            onPress={() =>
              navigation.navigate('VerifyPhone', {find, userRole, originPhone})
            }
            backgroundColor={mainColor}
            textColor={COLORS.grayscale_0}
          />
        </View>
      </View>
    </>
  );
}
