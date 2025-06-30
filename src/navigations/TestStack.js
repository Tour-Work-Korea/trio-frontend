import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EXHome} from '@screens';

const Stack = createNativeStackNavigator();

const TestStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="EXHome" component={EXHome} />
  </Stack.Navigator>
);
export default TestStack;
