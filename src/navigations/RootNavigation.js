import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@utils/navigationService';

import undefinedStack from './undefinedStack';
import EXHome from '@screens/EXHome';

import BottomTabs from '@screens/(Common)/BottomTabs'; // 탭 전체 포함

import {
  EmployDetail,
  ApplicantForm,
  ResumeDetail,
  AgreeDetail,
  ApplySuccess,
  StoreRegister,
  MeetMain,
  MeetSearch,
  MeetDetail,
  MeetReservation,
  MeetPaymentSuccess,
  GuesthouseDetail,
  RoomDetail,
  GuesthouseReservation,
  GuesthousePayment,
  GuesthousePaymentSuccess,
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
  UserGuesthouseReviewForm,
  MyGuesthouseAdd,
  MyGuesthouseEdit,
  MyGuesthouseDetail,
  MyGuesthouseReservationStatus,
  MyRecruitmentList,
  RecruitmentForm,
  MyRecruitmentDetail,
  MyLikeRecruitList,
  MyApplicantList,
  MyResumeList,
  UserEditProfile,
  HostEditProfile,
  ApplicantList,
  EditProfileFieldScreen,
  ApplicantListByRecruit,
} from '@screens';

const Stack = createNativeStackNavigator();

const RootNavigation = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="EXHome" component={EXHome} />
      <Stack.Screen name="undefined" component={undefinedStack} />
      <Stack.Screen
        name="EditProfileFieldScreen"
        component={EditProfileFieldScreen}
      />

      {/* 하단탭 보여하 하는 곳으로 이동할 때 사용 */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      {/* navigation.navigate('MainTabs', { screen: '홈' }); 이런식으로 사용하면 하단탭 보이게 이동됨 */}
      {/* 화면 이름은 bottomtabs에 index파일 안에 있음 */}

      {/* 게하 하단바 없는 화면 */}
      <Stack.Screen name="RoomDetail" component={RoomDetail} />
      <Stack.Screen name="GuesthouseDetail" component={GuesthouseDetail} />
      <Stack.Screen
        name="GuesthouseReservation"
        component={GuesthouseReservation}
      />
      <Stack.Screen name="GuesthousePayment" component={GuesthousePayment} />
      <Stack.Screen
        name="GuesthousePaymentSuccess"
        component={GuesthousePaymentSuccess}
      />
      <Stack.Screen name="StoreRegister" component={StoreRegister} />

      {/* 공고 하단바 없는 화면 */}
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
      <Stack.Screen name="ApplicantForm" component={ApplicantForm} />
      <Stack.Screen name="ResumeDetail" component={ResumeDetail} />
      <Stack.Screen name="ApplySuccess" component={ApplySuccess} />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />

      {/* 로그인, 회원가입 하단바 없는 화면 */}
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

      {/* 유저 마이페이지 하단바 없는 화면 */}
      <Stack.Screen name="UserEditProfile" component={UserEditProfile} />
      <Stack.Screen
        name="UserGuesthouseReviewForm"
        component={UserGuesthouseReviewForm}
      />
      <Stack.Screen name="MyLikeRecruitList" component={MyLikeRecruitList} />
      <Stack.Screen name="MyApplicantList" component={MyApplicantList} />
      <Stack.Screen name="MyResumeList" component={MyResumeList} />

      {/* 사장님 마이페이지 하단바 없는 화면 */}
      <Stack.Screen name="HostEditProfile" component={HostEditProfile} />
      <Stack.Screen name="MyGuesthouseAdd" component={MyGuesthouseAdd} />
      <Stack.Screen name="MyGuesthouseEdit" component={MyGuesthouseEdit} />
      <Stack.Screen name="MyGuesthouseDetail" component={MyGuesthouseDetail} />
      <Stack.Screen
        name="MyGuesthouseReservationStatus"
        component={MyGuesthouseReservationStatus}
      />
      <Stack.Screen name="MyRecruitmentList" component={MyRecruitmentList} />
      <Stack.Screen name="RecruitmentForm" component={RecruitmentForm} />
      <Stack.Screen
        name="MyRecruitmentDetail"
        component={MyRecruitmentDetail}
      />
      <Stack.Screen name="ApplicantList" component={ApplicantList} />
      <Stack.Screen
        name="ApplicantListByRecruit"
        component={ApplicantListByRecruit}
      />

      {/* 모임화면 확인을 위해 */}
      <Stack.Screen name="MeetMain" component={MeetMain} />
      <Stack.Screen name="MeetSearch" component={MeetSearch} />
      <Stack.Screen name="MeetDetail" component={MeetDetail} />
      <Stack.Screen name="MeetReservation" component={MeetReservation} />
      <Stack.Screen name="MeetPaymentSuccess" component={MeetPaymentSuccess} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
