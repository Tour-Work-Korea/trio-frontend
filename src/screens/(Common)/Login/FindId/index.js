import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import authApi from '@utils/api/authApi';
import ErrorModal from '@components/modals/ErrorModal';
import ButtonScarlet from '@components/ButtonScarlet';

import styles from '../Login.styles';
import Logo from '@assets/images/logo_orange.svg';

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

  return (
    <>
      <View style={styles.container}>
        <View style={styles.viewFlexBox}>
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
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
          <ButtonScarlet
            title={'로그인하러 가기'}
            onPress={() => {
              navigation.navigate('LoginIntro');
            }}
          />
        </View>
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={errorModal.buttonText}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </>
  );
}
