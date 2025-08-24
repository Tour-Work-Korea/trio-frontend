import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  HostMyPage,
  UserMyPage,
  UserReservationCheck,
  UserFavoriteGuesthouse,
  UserGuesthouseReview,
} from '@screens';

import {Alert} from 'react-native';
import useUserStore from '@stores/userStore';

const Stack = createNativeStackNavigator();

// 유저인지 사장님인지에 따라 분기
const MyMainScreen = ({navigation}) => {
  const userRole = useUserStore(state => state.userRole);

  useEffect(() => {
    if (userRole === 'HOST') {
      navigation.replace('HostMyPage');
    } else {
      navigation.replace('UserMyPage');
    }
  }, [userRole, navigation]);

  return null;
};

const My = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyMain" component={MyMainScreen} />
      <Stack.Screen name="HostMyPage" component={HostMyPage} />
      <Stack.Screen name="UserMyPage" component={UserMyPage} />

      {/* 유저 게하 */}
      <Stack.Screen
        name="UserReservationCheck"
        component={UserReservationCheck}
      />
      <Stack.Screen
        name="UserFavoriteGuesthouse"
        component={UserFavoriteGuesthouse}
      />
      <Stack.Screen
        name="UserGuesthouseReview"
        component={UserGuesthouseReview}
      />
    </Stack.Navigator>
  );
};

export default My;
