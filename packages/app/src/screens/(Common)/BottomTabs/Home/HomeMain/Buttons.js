import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, TouchableOpacity, ImageBackground, Text} from 'react-native';
import styles from './Home.styles';
import {useNavigation} from '@react-navigation/native';
import Guesthouse_btn from '@assets/images/home_guesthouse.svg';
import Employ_btn from '@assets/images/home_employ.svg';
import Party_btn from '@assets/images/home_party.svg';

export default function Buttons() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.navigate('MainTabs', {screen: '게하'});
        }}
        style={styles.button}>
        <Guesthouse_btn />
        <Text style={styles.buttonText}>
          {t('common.accommodation_fe9320')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.navigate('MainTabs', {screen: '채용'});
        }}
        style={styles.button}>
        <Employ_btn />
        <Text style={styles.buttonText}>{t('common.jobs')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          navigation.navigate('MainTabs', {screen: '콘텐츠'});
        }}
        style={styles.button}>
        <Party_btn />
        <Text style={styles.buttonText}>{t('common.accompany')}</Text>
      </TouchableOpacity>
    </View>
  );
}
