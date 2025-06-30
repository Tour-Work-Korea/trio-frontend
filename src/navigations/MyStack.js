import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { My } from '@screens';

const Stack = createNativeStackNavigator();

const MyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="My" component={My} />
  </Stack.Navigator>
);

export default MyStack;