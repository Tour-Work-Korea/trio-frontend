import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Guesthouse } from '@screens';
import { GuesthouseDetail } from '@screens';
import { GuesthouseList } from '@screens';
import { GuesthouseMap } from '@screens';
import { GuesthouseReview } from '@screens';
import { GuesthouseSearch } from '@screens';

const Stack = createNativeStackNavigator();

const GuesthouseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Guesthouse" component={Guesthouse} />
    <Stack.Screen name="GuesthouseDetail" component={GuesthouseDetail} />
    <Stack.Screen name="GuesthouseList" component={GuesthouseList} />
    <Stack.Screen name="GuesthouseMap" component={GuesthouseMap} />
    <Stack.Screen name="GuesthouseReview" component={GuesthouseReview} />
    <Stack.Screen name="GuesthouseSearch" component={GuesthouseSearch} />
  </Stack.Navigator>
);

export default GuesthouseStack;