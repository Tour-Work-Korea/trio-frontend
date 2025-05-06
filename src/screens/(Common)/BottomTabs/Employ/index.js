import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {EmployList, EmployDetail} from '@screens';
const Stack = createNativeStackNavigator();

const Employ = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="EmployList" component={EmployList} />
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
    </Stack.Navigator>
  );
};

export default Employ;
