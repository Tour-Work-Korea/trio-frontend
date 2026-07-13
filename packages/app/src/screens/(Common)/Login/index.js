import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {
  LoginIntro,
  LoginByEmail,
  FindIntro,
  VerifyPhone,
  FindId,
  FindPassword,
  SocialLogin,
  RegisterAgree,
  AgreeDetail,
  PhoneCertificate,
  EmailCertificate,
  UserRegisterProfile,
  Result,
} from '@screens';
import XIcon from '@assets/images/x_gray.svg';
import styles from './Login.styles';

const Stack = createNativeStackNavigator();

export default function Login() {
  const navigation = useNavigation();

  const handleClose = headerNavigation => {
    const activeNavigation = headerNavigation || navigation;

    if (activeNavigation.canGoBack?.()) {
      activeNavigation.goBack();
      return;
    }

    activeNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'MainTabs'}],
      }),
    );
  };

  const renderHeader = ({navigation: headerNavigation} = {}) => (
    <View
      pointerEvents="box-none"
      style={[styles.loginHeader, styles.loginHeaderOffset]}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="로그인 닫기"
        style={styles.loginCloseButton}
        onPress={() => handleClose(headerNavigation)}>
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
        <Stack.Screen
          name="RegisterAgree"
          component={RegisterAgree}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AgreeDetail"
          component={AgreeDetail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PhoneCertificate"
          component={PhoneCertificate}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EmailCertificate"
          component={EmailCertificate}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserRegisterProfile"
          component={UserRegisterProfile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Result"
          component={Result}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </View>
  );
}
