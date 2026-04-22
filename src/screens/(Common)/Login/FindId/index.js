import React, {useCallback, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import AlertModal from '@components/modals/AlertModal';
import ButtonWhite from '@components/ButtonWhite';

import styles from '../Login.styles';
import {COLORS} from '@constants/colors';
import LogoOrange from '@assets/images/logo_orange.svg';

export default function FindId({route}) {
  const {phoneNumber} = route.params;
  const userRole = 'USER';
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
  });

  const tryFindId = useCallback(async () => {
    try {
      const response = await authApi.findId(phoneNumber, userRole);
      setEmail(response.data);
    } catch (error) {
      console.warn('아이디 찾기 실패:', error);
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message || '아이디를 찾기에 실패하였습니다',
        buttonText: '확인',
      });
    }
  }, [phoneNumber, userRole]);

  useEffect(() => {
    tryFindId();
  }, [tryFindId]);

  const MainLogo = LogoOrange;
  const mainColor = COLORS.primary_orange;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <View  style={styles.titleContainer}>
                <MainLogo width={60} height={29} />
              </View>
              <View>
                <Text style={[styles.titleText]}>아이디를 찾았어요!</Text>
              </View>
              {email ? (
                <View style={styles.findEmailBox}>
                  <Text style={styles.findEmailText}>{email}</Text>
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>
          <ButtonWhite
            title={'로그인하러 가기'}
            onPress={() => {
              navigation.navigate('LoginIntro');
            }}
            backgroundColor={mainColor}
            textColor={COLORS.grayscale_0}
          />
        </View>
        <AlertModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={errorModal.buttonText}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </>
  );
}
