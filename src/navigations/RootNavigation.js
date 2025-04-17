import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as Screens from '@screens';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home" // 시작 화면 Home
        screenOptions={{ headerShown: false }}
      >
        {Object.entries(Screens).map(([name, Component]) => (
          <Stack.Screen key={name} name={name} component={Component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
