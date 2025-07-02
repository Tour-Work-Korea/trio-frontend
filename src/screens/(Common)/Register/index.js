import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  UserRegisterAgree,
  UserRegisterInfo,
  RegisterIntro,
  SocialLogin,
  EmailCertificate,
  PhoneCertificate,
  HostRegisterInfo,
  AgreeDetail,
  UserRegisterProfile,
  Result,
} from '@screens';

const Stack = createNativeStackNavigator();

export default function Register() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="RegisterIntro" component={RegisterIntro} />
      <Stack.Screen name="SocialLogin" component={SocialLogin} />
      <Stack.Screen name="UserRegisterAgree" component={UserRegisterAgree} />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen name="UserRegisterInfo" component={UserRegisterInfo} />
      <Stack.Screen
        name="UserRegisterProfile"
        component={UserRegisterProfile}
      />
      <Stack.Screen name="HostRegisterInfo" component={HostRegisterInfo} />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
}
