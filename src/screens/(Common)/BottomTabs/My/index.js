import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  HostMyPage,
  UserMyPage,
  HostEditProfile,
  UserEditProfile,
  MyGuesthouseList,
  MyGuesthouseDetail,
  MyGuesthouseAddEdit,
  MyGuesthouseReviewList,
  MyGuesthouseReview,
  UserReservationCheck,
  UserFavoriteGuesthouse,
  ApplicantDetail,
  ApplicantList,
  MyRecruitmentDetail,
  MyRecruitmentList,
  RecruitmentForm,
  ApplicantForm,
  MyApplicantDetail,
  MyApplicantList,
  MyLikeRecruitList,
  MyResumeDetail,
  MyResumeList,
  ResumeForm,
  EmployDetail,
  EXHome,
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
            onPress: () => navigation.navigate('EXHome'),
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
      <Stack.Screen name="MyGuesthouseList" component={MyGuesthouseList} />
      <Stack.Screen name="MyGuesthouseDetail" component={MyGuesthouseDetail} />
      <Stack.Screen
        name="MyGuesthouseAddEdit"
        component={MyGuesthouseAddEdit}
      />
      <Stack.Screen
        name="MyGuesthouseReviewList"
        component={MyGuesthouseReviewList}
      />
      <Stack.Screen name="MyGuesthouseReview" component={MyGuesthouseReview} />
      <Stack.Screen
        name="UserReservationCheck"
        component={UserReservationCheck}
      />
      <Stack.Screen
        name="UserFavoriteGuesthouse"
        component={UserFavoriteGuesthouse}
      />
      <Stack.Screen name="ApplicantList" component={ApplicantList} />
      <Stack.Screen name="ApplicantDetail" component={ApplicantDetail} />
      <Stack.Screen
        name="MyRecruitmentDetail"
        component={MyRecruitmentDetail}
      />
      <Stack.Screen name="MyRecruitmentList" component={MyRecruitmentList} />
      <Stack.Screen name="RecruitmentForm" component={RecruitmentForm} />
      <Stack.Screen name="ApplicantForm" component={ApplicantForm} />
      <Stack.Screen name="MyApplicantDetail" component={MyApplicantDetail} />
      <Stack.Screen name="MyApplicantList" component={MyApplicantList} />
      <Stack.Screen name="MyLikeRecruitList" component={MyLikeRecruitList} />
      <Stack.Screen name="MyResumeDetail" component={MyResumeDetail} />
      <Stack.Screen name="MyResumeList" component={MyResumeList} />
      <Stack.Screen name="ResumeForm" component={ResumeForm} />
      <Stack.Screen name="EmployDetail" component={EmployDetail} />
      <Stack.Screen name="EXHome" component={EXHome} />
    </Stack.Navigator>
  );
};

export default My;
