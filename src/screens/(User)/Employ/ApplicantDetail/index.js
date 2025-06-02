import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './ApplicantDetail.styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '@components/Header';
import ApplicantExperienceSection from './components/ApplicantExperienceSection';
import ApplicantProfileHeader from './components/ApplicantProfileHeader';
import ApplicantSelfIntroduction from './components/ApplicantSelfIntroduction';
import userEmployApi from '@utils/api/userEmployApi';

// 목업 데이터
// const applicantData = {
//   id: 1,
//   resumeTitle: '열정 가득한 알바생',
//   photoUrl: '사진을 추가해주세요',
//   mbti: 'ENFP',
//   selfIntroduction: '끈기와 책임감이 가득한 청년입니다.',
//   instagramId: 'ID를 추가해주세요',
//   totalExperience: '2년 11개월',
//   nickname: 'test',
//   gender: 'M',
//   age: 0,
//   birthDate: '2025-05-28',
//   phone: '01012345678',
//   email: 'test@gmail.com',
//   address: '주소를 추가해주세요',
//   workExperience: [
//     {
//       companyName: '맥도날드 A',
//       workType: '카운터',
//       startDate: '2022-01-01',
//       endDate: '2023-06-30',
//       description: '주문 처리 및 고객 응대',
//     },
//     {
//       companyName: '버거킹 B',
//       workType: '씽크',
//       startDate: '2023-07-01',
//       endDate: '2025-01-01',
//       description: '설거지',
//     },
//   ],
//   hashtag: [
//     {
//       hashtag: '성실함',
//       hashtagType: 'USER_HASHTAG',
//     },
//     {
//       hashtag: '영어가능',
//       hashtagType: 'USER_HASHTAG',
//     },
//     {
//       hashtag: '동반지원O',
//       hashtagType: 'USER_HASHTAG',
//     },
//   ],
// };

const ApplicantDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params || {};
  console.log(id);
  const [applicantData, setApplicantData] = useState();

  useEffect(() => {
    tryFetchResumeById();
  }, []);

  const tryFetchResumeById = async () => {
    try {
      const response = await userEmployApi.getResumeById(id);
      console.log(response.data.workExperience);
      setApplicantData(response.data);
    } catch (error) {
      Alert.alert('이력서를 불러오는데 실패했습니다.');
    }
  };

  const handleDelete = () => {
    // 삭제 기능 구현
    Alert.alert(
      '지원자 삭제',
      '정말로 이 지원자를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // 삭제 로직 구현
            Alert.alert('알림', '삭제되었습니다.');
            navigation.goBack();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const renderActionButtons = () => (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          handleDelete();
        }}>
        <Text style={styles.secondaryButtonText}>삭제하기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => {
          navigation.navigate('ApplicantForm', {
            id: applicantData.id,
            isEditMode: true,
          });
        }}>
        <Text style={styles.applyButtonText}>수정하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'나의 이력서 상세'} />
      <ScrollView style={styles.scrollView}>
        <ApplicantProfileHeader data={applicantData} />
        <ApplicantExperienceSection
          experiences={applicantData.workExperience}
          totalExperience={applicantData.totalExperience}
        />
        <ApplicantSelfIntroduction text={applicantData.selfIntro} />
      </ScrollView>
      {renderActionButtons()}
    </SafeAreaView>
  );
};

export default ApplicantDetail;
