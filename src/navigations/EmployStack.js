import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Employ } from '@screens';
import { EmployDetail } from '@screens';
import { EmployList } from '@screens';

const Stack = createNativeStackNavigator();

const EmployStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Employ" component={Employ} />
    <Stack.Screen name="EmployDetail" component={EmployDetail} />
    <Stack.Screen name="EmployList" component={EmployList} />
  </Stack.Navigator>
);

export default EmployStack;