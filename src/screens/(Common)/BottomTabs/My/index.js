import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  HostMyPage,
  UserMyPage,
  HostEditProfile,
  UserEditProfile,
  MyGuesthouseList,
  MyGuesthouseReview,
  UserReservationCheck,
  UserFavoriteGuesthouse,
  ApplicantList,
  MyRecruitmentDetail,
  MyRecruitmentList,
  RecruitmentForm,
  ApplicantForm,
  MyApplicantList,
  MyLikeRecruitList,
  MyResumeList,
  EditProfileFieldScreen,
  EmployDetail,
  UserGuesthouseReview,
  MyGuesthouseReservation,
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
    } else if (userRole === 'USER') {
      navigation.replace('UserMyPage');
    } else {
      // userRole이 없거나 잘못된 값일 때 임시(나중에 로그인 페이지로 가게 수정 예정)
      Alert.alert(
        '로그인 필요',
        '로그인이 필요합니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ],
        {cancelable: false},
      );
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
      <Stack.Screen name="HostEditProfile" component={HostEditProfile} />
      <Stack.Screen name="UserEditProfile" component={UserEditProfile} />
      <Stack.Screen
        name="EditProfileFieldScreen"
        component={EditProfileFieldScreen}
      />
      {/* 사장님 게하 */}
      <Stack.Screen name="MyGuesthouseList" component={MyGuesthouseList} />
      <Stack.Screen name="MyGuesthouseReview" component={MyGuesthouseReview} />
      <Stack.Screen name="MyGuesthouseReservation" component={MyGuesthouseReservation} />
      <Stack.Screen name="ApplicantList" component={ApplicantList} />

      {/* 유저 게하 */}
      <Stack.Screen name="UserReservationCheck" component={UserReservationCheck} />
      <Stack.Screen name="UserFavoriteGuesthouse" component={UserFavoriteGuesthouse} />
      <Stack.Screen name="UserGuesthouseReview" component={UserGuesthouseReview} />
      
      <Stack.Screen name="MyRecruitmentDetail" component={MyRecruitmentDetail} />
      <Stack.Screen name="MyRecruitmentList" component={MyRecruitmentList} />
      <Stack.Screen name="RecruitmentForm" component={RecruitmentForm} />
      <Stack.Screen name="ApplicantForm" component={ApplicantForm} />
      <Stack.Screen name="MyApplicantList" component={MyApplicantList} />
      <Stack.Screen name="MyLikeRecruitList" component={MyLikeRecruitList} />
      <Stack.Screen name="MyResumeList" component={MyResumeList} />
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
    </Stack.Navigator>
  );
};

export default My;
