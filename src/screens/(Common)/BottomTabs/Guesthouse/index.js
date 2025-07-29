import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {GuesthouseList, GuesthouseReview, GuesthouseSearch, GuesthouseMap} from '@screens';

const Stack = createNativeStackNavigator();

const Guesthouse = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuesthouseSearch" component={GuesthouseSearch} />
      <Stack.Screen name="GuesthouseList" component={GuesthouseList} />
      <Stack.Screen name="GuesthouseReview" component={GuesthouseReview} />
      <Stack.Screen name="GuesthouseMap" component={GuesthouseMap} />
    </Stack.Navigator>
  );
};

export default Guesthouse;
