import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {HomeMain, PopularGuesthouseList, PopularEmployList} from '@screens';

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeMain" component={HomeMain} />
      <Stack.Screen
        name="PopularGuesthouseList"
        component={PopularGuesthouseList}
      />
      <Stack.Screen name="PopularEmployList" component={PopularEmployList} />
    </Stack.Navigator>
  );
};

export default Home;
