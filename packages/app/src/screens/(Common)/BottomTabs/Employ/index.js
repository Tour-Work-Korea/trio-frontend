import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  EmployIntro,
  EmploySearchList,
  EmploySearchResult,
  EmployMap,
} from '@screens';

const Stack = createNativeStackNavigator();

const Employ = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="EmployIntro" component={EmployIntro} />
      <Stack.Screen name="EmploySearchList" component={EmploySearchList} />
      <Stack.Screen name="EmploySearchResult" component={EmploySearchResult} />
      <Stack.Screen name="EmployMap" component={EmployMap} />
    </Stack.Navigator>
  );
};

export default Employ;
