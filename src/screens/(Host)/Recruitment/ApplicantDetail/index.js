import React, {useState, useEffect} from 'react';
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
import {useRoute} from '@react-navigation/native';
import styles from './ApplicantDetail.styles';
import Header from '@components/Header';

import ApplicantExperienceSection from '../../../(User)/Employ/ApplicantDetail/components/ApplicantExperienceSection';
import ApplicantProfileHeader from '../../../(User)/Employ/ApplicantDetail/components/ApplicantProfileHeader';
import ApplicantSelfIntroduction from '../../../(User)/Employ/ApplicantDetail/components/ApplicantSelfIntroduction';
import hostEmployApi from '../../../../utils/api/hostEmployApi';

const applicantData = {
  resumeId: 3,
  resumeTitle: '열정 가득한 알바생',
  photoUrl: 'https://via.placeholder.com/150',
  nickname: '김지원',
  gender: 'F',
  age: 29,
  birthDate: '1995-08-24',
  userHashtag: [
    {id: 10, hashtag: '파티'},
    {id: 11, hashtag: '파티X'},
    {id: 12, hashtag: '바다전망'},
  ],
  phone: '01012311245',
  email: 'email@email.com',
  address: '서울 종로구',
  resumeMbti: 'INFP',
  instagramId: 'insta1234',
  totalExperience: '2년 11개월',
  workExperience: [
    {
      companyName: '맥도날드 A',
      workType: '카운터',
      startDate: '2022-01-01',
      endDate: '2023-06-30',
      description: null,
    },
    {
      companyName: '버거킹 B',
      workType: '씽크',
      startDate: '2023-07-01',
      endDate: '2025-01-01',
      description: null,
    },
  ],
  selfIntro: '끈기와 책임감이 가득한 청년입니다.',
  startDate: '2025-07-07',
  endDate: '2025-08-08',
  message: '안녕하세요',
};

const ApplicantDetail = () => {
  const route = useRoute();
  const resumeId = route.params?.resumeId ?? null;
  const [applicant, setApplicant] = useState(applicantData);
  const formattedExperiences = applicant.workExperience.map((exp, index) => ({
    id: String(index + 1),
    period: `${exp.startDate} - ${exp.endDate}`,
    company: exp.companyName,
    duties: exp.workType,
  }));

  const attachments = []; // 첨부파일이 없으므로 비워둠

  useEffect(() => {
    const fetchApplicantById = async () => {
      try {
        const response = await hostEmployApi.getApplicantDetail(resumeId);
        setApplicant(response.data);
      } catch (error) {
        Alert('지원서 상세 조회에 실패했습니다.');
      }
    };
    // fetchApplicantById();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'이력서 상세'} />
      <ScrollView style={styles.scrollView}>
        <ApplicantProfileHeader
          data={{
            id: applicant.resumeId,
            name: applicant.nickname,
            gender: applicant.gender === 'F' ? '여자' : '남자',
            birthYear: new Date(applicant.birthDate).getFullYear(),
            age: applicant.age,
            phone: applicant.phone,
            email: applicant.email,
            address: applicant.address,
            mbti: applicant.resumeMbti,
            socialMedia: applicant.instagramId,
            hashtag: applicant.userHashtag
              .map(tag => `#${tag.hashtag}`)
              .join(' '),
          }}
        />
        <ApplicantExperienceSection
          experiences={formattedExperiences}
          totalExperience={`총 ${applicant.totalExperience}`}
        />
        <ApplicantSelfIntroduction text={applicant.selfIntro} />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>근무 희망기간</Text>
          <View style={styles.introductionCard}>
            <Text style={styles.introductionText}>
              {applicant.startDate}~{applicant.endDate}
            </Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>사장님께 한마디</Text>
          <View style={styles.introductionCard}>
            <Text style={styles.introductionText}>{applicant.message}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicantDetail;
