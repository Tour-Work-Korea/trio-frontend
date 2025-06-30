import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Meet } from '@screens';

const Stack = createNativeStackNavigator();

const MeetStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Meet" component={Meet} />
  </Stack.Navigator>
);

export default MeetStack;