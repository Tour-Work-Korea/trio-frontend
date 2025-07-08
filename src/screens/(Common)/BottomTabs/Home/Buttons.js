import React from 'react';
import {View, TouchableOpacity, ImageBackground, Text} from 'react-native';
import styles from './Home.styles';
import {useNavigation} from '@react-navigation/native';
import Guesthouse_btn from '@assets/images/home_guesthouse.png';
import Employ_btn from '@assets/images/home_employ.png';
import Party_btn from '@assets/images/home_party.png';

export default function Buttons() {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('GuesthouseList');
        }}>
        <ImageBackground source={Guesthouse_btn} style={styles.button}>
          <Text style={styles.buttonText}>숙소</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('EmployList');
        }}>
        <ImageBackground source={Employ_btn} style={styles.button}>
          <Text style={styles.buttonText}>일자리</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Meet');
        }}>
        <ImageBackground source={Party_btn} style={styles.button}>
          <Text style={styles.buttonText}>모임</Text>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}
