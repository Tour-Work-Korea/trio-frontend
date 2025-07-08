import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home } from '@screens';
import { HomeMain } from '@screens';
import { PopularGuesthouseList } from '@screens';

const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="HomeMain" component={HomeMain} />
    <Stack.Screen name="PopularGuesthouseList" component={PopularGuesthouseList} />
  </Stack.Navigator>
);

export default HomeStack;