import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import AlertModal from '@components/modals/AlertModal';
import ButtonWhite from '@components/ButtonWhite';

import styles from '../Login.styles';
import {COLORS} from '@constants/colors';
import LogoOrange from '@assets/images/logo_orange.svg';
import LogoBlue from '@assets/images/logo_blue.svg';

export default function FindId({route}) {
  const {userRole, phoneNumber} = route.params;
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
  });

  useEffect(() => {
    tryFindId();
  }, [userRole, phoneNumber]);

  const tryFindId = async () => {
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
  };

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
