import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  Button,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './FindId.styles';
import {FONTS} from '@constants/fonts';
import {useNavigation} from '@react-navigation/native';

//아이디 찾기(이메일)
const FindId = () => {
  return (
    <View>
      <Text>아이디 찾기</Text>
    </View>
  );
};

export default FindId;
