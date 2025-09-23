import React, {useCallback} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import {HostMyPage, UserMyPage} from '@screens';

const Stack = createNativeStackNavigator();

function MyGate({navigation}) {
  const userRole = useUserStore(state => state.userRole);

  useFocusEffect(
    useCallback(() => {
      if (userRole === 'HOST') {
        navigation.replace('HostMyPage');
      } else if (userRole === 'USER') {
        navigation.replace('UserMyPage');
      } else {
        navigation.getParent()?.navigate('홈');
      }
    }, [userRole, navigation]),
  );

  return null;
}

export default function My() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="MyGate">
      <Stack.Screen name="MyGate" component={MyGate} />
      <Stack.Screen name="HostMyPage" component={HostMyPage} />
      <Stack.Screen name="UserMyPage" component={UserMyPage} />
    </Stack.Navigator>
  );
}
