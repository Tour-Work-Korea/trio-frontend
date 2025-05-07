import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {EmployList, EmployDetail, Applicant} from '@screens';

const Stack = createNativeStackNavigator();

const Employ = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="EmployList" component={EmployList} />
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
      <Stack.Screen name="Applicant" component={Applicant} />
    </Stack.Navigator>
  );
};

export default Employ;
