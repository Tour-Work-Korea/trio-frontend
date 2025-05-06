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
import Header from '@components/Header';
import ApplicantAttachments from '../../../(User)/Employ/ApplicantDetail/components/ApplicantAttachments';
import ApplicantExperienceSection from '../../../(User)/Employ/ApplicantDetail/components/ApplicantExperienceSection';
import ApplicantProfileHeader from '../../../(User)/Employ/ApplicantDetail/components/ApplicantProfileHeader';
import ApplicantSelfIntroduction from '../../../(User)/Employ/ApplicantDetail/components/ApplicantSelfIntroduction';
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
  wishDuration: {
    from: '2000.00.00',
    to: '2000.00.01',
  },
  toHost: '열심히 하겠습니다!!',
};

const ApplicantDetail = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title={'이력서 상세'} />
      <ScrollView style={styles.scrollView}>
        <ApplicantProfileHeader data={applicantData} />
        <ApplicantExperienceSection
          experiences={applicantData.experiences}
          totalExperience={applicantData.totalExperience}
        />
        <ApplicantSelfIntroduction text={applicantData.selfIntroduction} />
        <ApplicantAttachments attachments={applicantData.attachments} />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>근무 희망기간</Text>
          <View style={styles.introductionCard}>
            <Text style={styles.introductionText}>
              {applicantData.wishDuration.from}~{applicantData.wishDuration.to}
            </Text>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>사장님께 한마디</Text>
          <View style={styles.introductionCard}>
            <Text style={styles.introductionText}>{applicantData.toHost}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicantDetail;
