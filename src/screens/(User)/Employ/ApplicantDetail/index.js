import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './ApplicantDetail.styles';
import {useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import ApplicantAttachments from './components/ApplicantAttachments';
import ApplicantExperienceSection from './components/ApplicantExperienceSection';
import ApplicantProfileHeader from './components/ApplicantProfileHeader';
import ApplicantSelfIntroduction from './components/ApplicantSelfIntroduction';

// 목업 데이터
const applicantData = {
  id: '1',
  name: '김지원',
  gender: '여자',
  birthYear: 2002,
  age: 22,
  phone: '010-0000-0000',
  email: 'email@email.com',
  address: '서울특별시 성동구',
  mbti: 'ENFP',
  socialMedia: 'instaID',
  hashtag: '#활발 #발랄',
  totalExperience: '총 2년 6개월',
  experiences: [
    {
      id: '1',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
    {
      id: '2',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
    {
      id: '3',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
    {
      id: '4',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
  ],
  selfIntroduction:
    '자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다.',
  attachments: [
    {id: '1', name: '첨부파일1'},
    {id: '2', name: '첨부파일2'},
  ],
};

const ApplicantDetail = () => {
  const navigation = useNavigation();

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
          experiences={applicantData.experiences}
          totalExperience={applicantData.totalExperience}
        />
        <ApplicantSelfIntroduction text={applicantData.selfIntroduction} />
        <ApplicantAttachments attachments={applicantData.attachments} />
      </ScrollView>
      {renderActionButtons()}
    </SafeAreaView>
  );
};

export default ApplicantDetail;
