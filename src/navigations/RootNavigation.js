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

import BottomTabs from '@screens/(Common)/BottomTabs'; // 탭 전체 포함

import RoomDetail from '@screens/(Common)/RoomDetail';
import GuesthouseReservation from '@screens/(Common)/GuesthouseReservation';
import GuesthousePayment from '@screens/(Common)/GuesthousePayment';
import PaymentSuccess from '@screens/(Common)/GuesthousePayment/PaymentSuccess';

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

      {/* 하단탭 보여하 하는 곳으로 이동할 때 사용 */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      {/* navigation.navigate('MainTabs', { screen: '홈' }); 이런식으로 사용하면 하단탭 보이게 이동됨 */}
      {/* 화면 이름은 bottomtabs에 index파일 안에 있음 */}

      {/* 게하 하단바 없는 화면 */}
      <Stack.Screen name="RoomDetail" component={RoomDetail} />
      <Stack.Screen name="GuesthouseReservation" component={GuesthouseReservation} />
      <Stack.Screen name="GuesthousePayment" component={GuesthousePayment} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
