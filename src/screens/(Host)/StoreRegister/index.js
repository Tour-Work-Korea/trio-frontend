import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {StoreRegisterForm, StoreRegisterList} from '@screens';

const Stack = createNativeStackNavigator();

const StoreRegister = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="StoreRegisterList" component={StoreRegisterList} />
      <Stack.Screen name="StoreRegisterForm" component={StoreRegisterForm} />
    </Stack.Navigator>
  );
};

export default StoreRegister;
