import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@utils/navigationService';

import undefinedStack from './undefinedStack';
import EXHome from '@screens/EXHome';

import BottomTabs from '@screens/(Common)/BottomTabs'; // 탭 전체 포함

import RoomDetail from '@screens/(Common)/RoomDetail';
import GuesthouseReservation from '@screens/(Common)/GuesthouseReservation';
import GuesthousePayment from '@screens/(Common)/GuesthousePayment';
import PaymentSuccess from '@screens/(Common)/GuesthousePayment/PaymentSuccess';

import {
  EmployDetail,
  ApplicantForm,
  ResumeDetail,
  AgreeDetail,
  ApplySuccess,
  Register,
  EXLogin,
  Login,
  RegisterIntro,
  RegisterAgree,
  SocialLogin,
  PhoneCertificate,
  EmailCertificate,
  UserRegisterInfo,
  UserRegisterProfile,
  HostRegisterInfo,
  Result,
} from '@screens';

const Stack = createNativeStackNavigator();

const RootNavigation = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="EXHome" component={EXHome} />
      <Stack.Screen name="undefined" component={undefinedStack} />

      {/* 하단탭 보여하 하는 곳으로 이동할 때 사용 */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      {/* navigation.navigate('MainTabs', { screen: '홈' }); 이런식으로 사용하면 하단탭 보이게 이동됨 */}
      {/* 화면 이름은 bottomtabs에 index파일 안에 있음 */}

      {/* 게하 하단바 없는 화면 */}
      <Stack.Screen name="RoomDetail" component={RoomDetail} />
      <Stack.Screen
        name="GuesthouseReservation"
        component={GuesthouseReservation}
      />
      <Stack.Screen name="GuesthousePayment" component={GuesthousePayment} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
      <Stack.Screen name="ApplicantForm" component={ApplicantForm} />
      <Stack.Screen name="ResumeDetail" component={ResumeDetail} />
      <Stack.Screen name="ApplySuccess" component={ApplySuccess} />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />

      <Stack.Screen name="RegisterIntro" component={RegisterIntro} />
      <Stack.Screen name="SocialLogin" component={SocialLogin} />
      <Stack.Screen name="RegisterAgree" component={RegisterAgree} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen name="UserRegisterInfo" component={UserRegisterInfo} />
      <Stack.Screen
        name="UserRegisterProfile"
        component={UserRegisterProfile}
      />
      <Stack.Screen name="HostRegisterInfo" component={HostRegisterInfo} />
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
