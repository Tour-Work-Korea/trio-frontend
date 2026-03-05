import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserFavoriteMeet, UserFavoriteGuesthouse } from '@screens';

const Stack = createNativeStackNavigator();

const Guesthouse = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserFavoriteGuesthouse" component={UserFavoriteGuesthouse} />
      <Stack.Screen name="UserFavoriteMeet" component={UserFavoriteMeet} />
    </Stack.Navigator>
  );
};

export default Guesthouse;
