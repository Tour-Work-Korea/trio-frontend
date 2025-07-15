import React from 'react';
import {View, TouchableOpacity, ImageBackground, Text} from 'react-native';
import styles from './Home.styles';
import {useNavigation} from '@react-navigation/native';
import Guesthouse_btn from '@assets/images/home_guesthouse.svg';
import Employ_btn from '@assets/images/home_employ.svg';
import Party_btn from '@assets/images/home_party.svg';

export default function Buttons() {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('GuesthouseList');
        }}
        style={styles.button}>
        <Guesthouse_btn />
        <Text style={styles.buttonText}>숙소</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('EmployIntro');
        }}
        style={styles.button}>
        <Employ_btn />
        <Text style={styles.buttonText}>일자리</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Meet');
        }}
        style={styles.button}>
        <Party_btn />
        <Text style={styles.buttonText}>동행</Text>
      </TouchableOpacity>
    </View>
  );
}
