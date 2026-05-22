import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {
  LoginIntro,
  LoginByEmail,
  FindIntro,
  VerifyPhone,
  FindId,
  FindPassword,
  SocialLogin,
} from '@screens';
import XIcon from '@assets/images/x_gray.svg';
import styles from './Login.styles';

const Stack = createNativeStackNavigator();

export default function Login() {
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'MainTabs', params: {screen: '홈'}}],
      }),
    );
  };

  return (
    <View style={styles.loginStackContainer}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoginIntro" component={LoginIntro} />
        <Stack.Screen name="LoginByEmail" component={LoginByEmail} />
        <Stack.Screen name="FindIntro" component={FindIntro} />
        <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
        <Stack.Screen name="FindId" component={FindId} />
        <Stack.Screen name="FindPassword" component={FindPassword} />
        <Stack.Screen name="SocialLogin" component={SocialLogin} />
      </Stack.Navigator>

      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="로그인 닫기"
        style={styles.loginCloseButton}
        onPress={handleClose}>
        <XIcon width={22} height={22} />
      </TouchableOpacity>
    </View>
  );
}
