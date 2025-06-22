import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  UserRegisterAgree,
  UserRegisterInfo,
  UserRegisterIntro,
  SocialLogin,
  EmailCertificate,
  PhoneCertificate,
} from '@screens';

const Stack = createNativeStackNavigator();

export default function UserRegister() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="UserRegisterIntro" component={UserRegisterIntro} />
      <Stack.Screen name="SocialLogin" component={SocialLogin} />
      <Stack.Screen name="UserRegisterAgree" component={UserRegisterAgree} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen name="UserRegisterInfo" component={UserRegisterInfo} />
    </Stack.Navigator>
  );
}
