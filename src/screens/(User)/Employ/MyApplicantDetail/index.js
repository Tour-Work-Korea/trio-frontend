import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './MyApplicantDetail';
import {useRoute} from '@react-navigation/native';
import Header from '@components/Header';
import {
  ApplicantExperienceSection,
  ApplicantProfileHeader,
  ApplicantSelfIntroduction,
} from '@components/Employ/ApplicantDetail';
import userEmployApi from '@utils/api/userEmployApi';

const MyApplicantDetail = () => {
  const route = useRoute();
  const {id} = route.params || {};
  const [applicantData, setApplicantData] = useState();

  useEffect(() => {
    tryFetchApplicantById();
  }, []);

  const tryFetchApplicantById = async () => {
    try {
      const response = await userEmployApi.getMyApplicationById(id);
      setApplicantData(response.data);
    } catch (error) {
      Alert.alert('지원서를 불러오는데 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'나의 지원서 상세'} />
      {applicantData ? (
        <>
          <ScrollView style={styles.scrollView}>
            <ApplicantProfileHeader
              data={applicantData}
              hashtags={applicantData?.userHashtag}
            />
            <ApplicantExperienceSection
              experiences={applicantData?.workExperience}
              totalExperience={applicantData?.totalExperience}
            />
            <ApplicantSelfIntroduction text={applicantData?.selfIntro} />

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>근무 희망기간</Text>
              <View style={styles.introductionCard}>
                <Text style={styles.introductionText}>
                  {applicantData.startDate}~{applicantData.endDate}
                </Text>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사장님께 한마디</Text>
              <View style={styles.introductionCard}>
                <Text style={styles.introductionText}>
                  {applicantData.message}
                </Text>
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <Text style={styles.loadingText}>이력서를 불러오는 중입니다...</Text>
      )}
    </SafeAreaView>
  );
};

export default MyApplicantDetail;
