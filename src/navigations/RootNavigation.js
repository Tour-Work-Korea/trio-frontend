import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@utils/navigationService';

import undefinedStack from './undefinedStack';
import BottomTabs from '@screens/(Common)/BottomTabs';

import {
  EmployDetail,
  ApplicantForm,
  ResumeDetail,
  AgreeDetail,
  ApplySuccess,
  MeetDetail,
  MeetReservation,
  MeetPaymentSuccess,
  GuesthouseDetail,
  RoomDetail,
  GuesthouseReservation,
  CouponSelectScreen,
  GuesthousePayment,
  GuesthousePaymentSuccess,
  Login,
  RegisterIntro,
  RegisterAgree,
  PhoneCertificate,
  EmailCertificate,
  UserRegisterProfile,
  Result,
  UserGuesthouseReviewForm,
  MyLikeRecruitList,
  MyApplicantList,
  MyResumeList,
  MyCouponList,
  MyCouponRegister,
  UserEditProfile,
  UserEditInfo,
  Setting,
  Terms,
  ProfileUpdate,
  UserReservationCheck,
  UserFavoriteGuesthouse,
  UserGuesthouseReview,
  UserMeetReservationCheck,
  UserFavoriteMeet,
  MeetPayment,
  FindPassword,
  VerifyPhone,
  FindIntro,
  GuesthousePost,
  GuesthousePaymentReceipt,
  GuesthouseCancelledReceipt,
  GuesthouseCancelConfirm,
  GuesthouseCancelSuccess,
  UserMeetReservationCancelled,
  MeetPaymentReceipt,
  MeetCancelledReceipt,
  MeetCancelConfirm,
  MeetCancelSuccess,
} from '@screens';

const Stack = createNativeStackNavigator();

const RootNavigation = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="undefined" component={undefinedStack} />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen name="Terms" component={Terms} />

      <Stack.Screen name="RoomDetail" component={RoomDetail} />
      <Stack.Screen name="GuesthouseDetail" component={GuesthouseDetail} />
      <Stack.Screen
        name="GuesthouseReservation"
        component={GuesthouseReservation}
      />
      <Stack.Screen name="CouponSelect" component={CouponSelectScreen} />
      <Stack.Screen name="GuesthousePayment" component={GuesthousePayment} />
      <Stack.Screen
        name="GuesthousePaymentSuccess"
        component={GuesthousePaymentSuccess}
      />
      <Stack.Screen
        name="GuesthousePaymentReceipt"
        component={GuesthousePaymentReceipt}
      />
      <Stack.Screen
        name="GuesthouseCancelledReceipt"
        component={GuesthouseCancelledReceipt}
      />
      <Stack.Screen
        name="GuesthouseCancelConfirm"
        component={GuesthouseCancelConfirm}
      />
      <Stack.Screen
        name="GuesthouseCancelSuccess"
        component={GuesthouseCancelSuccess}
      />

      <Stack.Screen name="EmployDetail" component={EmployDetail} />
      <Stack.Screen name="ApplicantForm" component={ApplicantForm} />
      <Stack.Screen name="ResumeDetail" component={ResumeDetail} />
      <Stack.Screen name="ApplySuccess" component={ApplySuccess} />
      <Stack.Screen name="AgreeDetail" component={AgreeDetail} />
      <Stack.Screen name="ProfileUpdate" component={ProfileUpdate} />

      <Stack.Screen name="RegisterIntro" component={RegisterIntro} />
      <Stack.Screen name="RegisterAgree" component={RegisterAgree} />
      <Stack.Screen name="PhoneCertificate" component={PhoneCertificate} />
      <Stack.Screen name="EmailCertificate" component={EmailCertificate} />
      <Stack.Screen
        name="UserRegisterProfile"
        component={UserRegisterProfile}
      />
      <Stack.Screen name="Result" component={Result} />
      <Stack.Screen name="FindIntro" component={FindIntro} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhone} />
      <Stack.Screen name="FindPassword" component={FindPassword} />

      <Stack.Screen name="UserEditProfile" component={UserEditProfile} />
      <Stack.Screen name="UserEditInfo" component={UserEditInfo} />
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
      <Stack.Screen
        name="UserGuesthouseReviewForm"
        component={UserGuesthouseReviewForm}
      />
      <Stack.Screen name="MyCouponList" component={MyCouponList} />
      <Stack.Screen name="MyCouponRegister" component={MyCouponRegister} />
      <Stack.Screen name="MyLikeRecruitList" component={MyLikeRecruitList} />
      <Stack.Screen name="MyApplicantList" component={MyApplicantList} />
      <Stack.Screen name="MyResumeList" component={MyResumeList} />
      <Stack.Screen name="UserFavoriteMeet" component={UserFavoriteMeet} />
      <Stack.Screen
        name="UserMeetReservationCheck"
        component={UserMeetReservationCheck}
      />
      <Stack.Screen
        name="UserMeetReservationCancelled"
        component={UserMeetReservationCancelled}
      />
      <Stack.Screen name="MeetPaymentReceipt" component={MeetPaymentReceipt} />
      <Stack.Screen
        name="MeetCancelledReceipt"
        component={MeetCancelledReceipt}
      />
      <Stack.Screen name="MeetCancelConfirm" component={MeetCancelConfirm} />
      <Stack.Screen name="MeetCancelSuccess" component={MeetCancelSuccess} />

      <Stack.Screen name="MeetDetail" component={MeetDetail} />
      <Stack.Screen name="MeetReservation" component={MeetReservation} />
      <Stack.Screen
        name="MeetPaymentSuccess"
        component={MeetPaymentSuccess}
      />
      <Stack.Screen name="MeetPayment" component={MeetPayment} />

      <Stack.Screen name="GuesthousePost" component={GuesthousePost} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigation;
