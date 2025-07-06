import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import undefinedStack from './undefinedStack';
import EmployStack from './EmployStack';
import GuesthouseStack from './GuesthouseStack';
import HomeStack from './HomeStack';
import MeetStack from './MeetStack';
import MyStack from './MyStack';
import EXHome from '@screens/EXHome';

const Stack = createNativeStackNavigator();

const RootNavigation = () => (
  <NavigationContainer>

    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EXHome" component={EXHome} />
      <Stack.Screen name="undefined" component={undefinedStack} />
      <Stack.Screen name="Employ" component={EmployStack} />
      <Stack.Screen name="Guesthouse" component={GuesthouseStack} />
      <Stack.Screen name="Home" component={HomeStack} />
      <Stack.Screen name="Meet" component={MeetStack} />
      <Stack.Screen name="My" component={MyStack} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
