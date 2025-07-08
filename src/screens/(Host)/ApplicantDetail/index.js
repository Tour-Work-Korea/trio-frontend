import React, {useState, useEffect} from 'react';
import {View, Text, Image, ScrollView, SafeAreaView, Alert} from 'react-native';
import {useRoute} from '@react-navigation/native';
import styles from './ApplicantDetail.styles';
import Header from '@components/Header';
import {
  ApplicantExperienceSection,
  ApplicantProfileHeader,
  ApplicantSelfIntroduction,
} from '@components/Employ/ApplicantDetail';
import hostEmployApi from '@utils/api/hostEmployApi';

const ApplicantDetail = () => {
  const route = useRoute();
  const applyId = route.params ?? null;
  const [applicant, setApplicant] = useState();

  useEffect(() => {
    const fetchApplicantById = async () => {
      try {
        const response = await hostEmployApi.getApplicantDetail(applyId);
        setApplicant(response.data);
        setApplicant(prev => ({
          ...prev,
          mbti: response.data.resumeMbti,
        }));
      } catch (error) {
        Alert.alert('지원서 상세 조회에 실패했습니다.');
      }
    };
    fetchApplicantById();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'이력서 상세'} />
      {!applicant ? (
        <>
          <Text>로딩 중</Text>
        </>
      ) : (
        <ScrollView style={styles.scrollView}>
          <ApplicantProfileHeader
            data={applicant}
            hashtags={applicant?.userHashtag}
          />
          <ApplicantExperienceSection
            experiences={applicant?.workExperience}
            totalExperience={applicant?.totalExperience}
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
      )}
    </SafeAreaView>
  );
};

export default ApplicantDetail;
