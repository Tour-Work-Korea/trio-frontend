import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {GuesthouseList, GuesthouseDetail} from '@screens';

const Stack = createNativeStackNavigator();

const Guesthouse = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuesthouseList" component={GuesthouseList} />
      <Stack.Screen name="GuesthouseDetail" component={GuesthouseDetail} />
    </Stack.Navigator>
  );
};

export default Guesthouse;
