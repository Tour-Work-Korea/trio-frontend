import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  RegisterAgree,
  SocialOriginSelect,
  ForeignRegisterProfile,
  ForeignSignupComplete,
  RegisterIntro,
  SocialLogin,
  EmailCertificate,
  PhoneCertificate,
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
      <Stack.Screen name="RegisterAgree" component={RegisterAgree} />
      <Stack.Screen name="SocialOriginSelect" component={SocialOriginSelect} />
      <Stack.Screen
        name="ForeignRegisterProfile"
        component={ForeignRegisterProfile}
      />
      <Stack.Screen
        name="ForeignSignupComplete"
        component={ForeignSignupComplete}
      />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen
        name="UserRegisterProfile"
        component={UserRegisterProfile}
      />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
}
