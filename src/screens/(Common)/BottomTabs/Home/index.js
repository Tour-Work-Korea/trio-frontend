import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {HomeMain, PopularGuesthouseList} from '@screens';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeMain} />
      <Stack.Screen name="PopularGuesthouseList" component={PopularGuesthouseList} />
    </Stack.Navigator>
  );
};

export default Home;
