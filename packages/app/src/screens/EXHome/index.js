import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EXHomePage, EXDeeplink, BottomTabs} from '@screens';
import undefinedStack from '@navigations/undefinedStack';

const Stack = createNativeStackNavigator();

export default function EXHome() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="EXHomePage" component={EXHomePage} />
      <Stack.Screen name="EXDeeplink" component={EXDeeplink} />
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="undefined" component={undefinedStack} />
    </Stack.Navigator>
  );
}
