import React from 'react';
import {View, Text} from 'react-native';
import styles from '../Login.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import Logo from '@assets/images/logo_orange.svg';
import {useNavigation} from '@react-navigation/native';

export default function FindIntro({route}) {
  const {userRole, find} = route.params;
  const navigation = useNavigation();

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.viewFlexBox, {justifyContent: 'space-between'}]}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
              <View>
                <Text style={[styles.titleText]}>
                  {find === 'email' ? '아이디' : '비밀번호'}를 찾으려면
                </Text>
                <Text style={[styles.titleText]}>본인 인증이 필요해요!</Text>
              </View>
            </View>
          </View>
          <ButtonScarlet
            title={'본인 인증하기'}
            onPress={() => navigation.navigate('VerifyPhone', {find, userRole})}
          />
        </View>
      </View>
    </>
  );
}
