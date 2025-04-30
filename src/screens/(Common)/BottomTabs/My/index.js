import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HostMyPage from '@screens/(Host)/HostMyPage';
import UserMyPage from '@screens/(User)/UserMyPage';
import HostEditProfile from '@screens/(Host)/HostMyPage/HostEditProfile';
import UserEditProfile from '@screens/(User)/UserMyPage/UserEditProfile';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

// 임시 화면
const MyMainScreen = () => {
  const navigation = useNavigation();

  const goToHostMyPage = () => {
    navigation.navigate('HostMyPage');
  };

  const goToUserMyPage = () => {
    navigation.navigate('UserMyPage');
  };

  return (
    <View style={styles.container}>
      <Text>나중에 로그인 추가되면 사장님인지 유저인지에 따라 다르게 가도록 설정예정</Text>

      <TouchableOpacity style={styles.button} onPress={goToHostMyPage}>
        <Text style={styles.buttonText}>사장님 마이페이지 가기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToUserMyPage}>
        <Text style={styles.buttonText}>유저 마이페이지 가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const My = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyMain" component={MyMainScreen} />
      <Stack.Screen name="HostMyPage" component={HostMyPage} />
      <Stack.Screen name="UserMyPage" component={UserMyPage} />
      <Stack.Screen name="HostEditProfile" component={HostEditProfile} /> 
      <Stack.Screen name="UserEditProfile" component={UserEditProfile} /> 
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    color: 'blue',
  },
});

export default My;
