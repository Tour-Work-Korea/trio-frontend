import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabs } from '@screens';

const Stack = createNativeStackNavigator();

const undefinedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BottomTabs" component={BottomTabs} />
  </Stack.Navigator>
);

export default undefinedStack;