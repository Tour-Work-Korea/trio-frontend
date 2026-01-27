import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  LoginIntro,
  LoginByEmail,
  FindIntro,
  VerifyPhone,
  FindId,
  FindPassword,
  SocialLogin,
} from '@screens';

const Stack = createNativeStackNavigator();

export default function Login() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="LoginIntro" component={LoginIntro} />
      <Stack.Screen name="LoginByEmail" component={LoginByEmail} />
      <Stack.Screen name="FindIntro" component={FindIntro} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
      <Stack.Screen name="FindId" component={FindId} />
      <Stack.Screen name="FindPassword" component={FindPassword} />
      <Stack.Screen name="SocialLogin" component={SocialLogin} />
    </Stack.Navigator>
  );
}
