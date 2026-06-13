import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  LoginIntro,
  LoginByEmail,
  FindIntro,
  VerifyPhone,
  FindId,
  FindPassword,
  SocialLogin,
} from '@screens';
import XIcon from '@assets/images/x_gray.svg';
import styles from './Login.styles';

const Stack = createNativeStackNavigator();

export default function Login() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      }),
    );
  };

  const renderHeader = () => (
    <View
      pointerEvents="box-none"
      style={[styles.loginHeader, {top: 20}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="로그인 닫기"
        style={styles.loginCloseButton}
        onPress={handleClose}>
        <XIcon width={22} height={22} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.loginStackContainer}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          header: renderHeader,
        }}>
        <Stack.Screen name="LoginIntro" component={LoginIntro} />
        <Stack.Screen name="LoginByEmail" component={LoginByEmail} />
        <Stack.Screen name="FindIntro" component={FindIntro} />
        <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
        <Stack.Screen name="FindId" component={FindId} />
        <Stack.Screen name="FindPassword" component={FindPassword} />
        <Stack.Screen name="SocialLogin" component={SocialLogin} />
      </Stack.Navigator>
    </View>
  );
}
