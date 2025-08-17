import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StoreRegisterForm1, StoreRegisterForm2} from '@screens/index';
/*
 * 입점 등록 신청 페이지
 */
const Stack = createNativeStackNavigator();

const StoreRegister = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="StoreRegisterForm1" component={StoreRegisterForm1} />
      <Stack.Screen name="StoreRegisterForm2" component={StoreRegisterForm2} />
    </Stack.Navigator>
  );
};

export default StoreRegister;
