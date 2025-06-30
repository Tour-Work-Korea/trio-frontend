import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EmailCertificate, PhoneCertificate, HostRegisterInfo} from '@screens';

const Stack = createNativeStackNavigator();

export default function HostRegister() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="PhoneCertificate"
        component={PhoneCertificate}
        initialParams={{user: 'Host'}}
      />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen name="HostRegisterInfo" component={HostRegisterInfo} />
    </Stack.Navigator>
  );
}
