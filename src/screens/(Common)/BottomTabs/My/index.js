import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  HostMyPage,
  UserMyPage,
} from '@screens';
import useUserStore from '@stores/userStore';

const Stack = createNativeStackNavigator();

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
    </Stack.Navigator>
  );
};

export default My;
