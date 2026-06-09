import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  GuesthouseList,
  GuesthouseListMap,
  GuesthouseReview,
  GuesthouseSearch,
  GuesthouseMap,
} from '@screens';
import {getDefaultGuesthouseListParams} from '@constants/guesthouseDefaults';

const Stack = createNativeStackNavigator();

const Guesthouse = () => {
  return (
    <Stack.Navigator
      initialRouteName="GuesthouseList"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="GuesthouseList"
        component={GuesthouseList}
        initialParams={getDefaultGuesthouseListParams()}
      />
      <Stack.Screen name="GuesthouseSearch" component={GuesthouseSearch} />
      <Stack.Screen name="GuesthouseListMap" component={GuesthouseListMap} />
      <Stack.Screen name="GuesthouseReview" component={GuesthouseReview} />
      <Stack.Screen name="GuesthouseMap" component={GuesthouseMap} />
    </Stack.Navigator>
  );
};

export default Guesthouse;
