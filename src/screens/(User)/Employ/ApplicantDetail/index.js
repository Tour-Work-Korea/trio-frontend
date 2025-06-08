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

const ApplicantDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params || {};
  const [applicantData, setApplicantData] = useState();

  useEffect(() => {
    tryFetchResumeById();
  }, []);

  const tryFetchResumeById = async () => {
    try {
      const response = await userEmployApi.getResumeById(id);

      setApplicantData(response.data);
    } catch (error) {
      Alert.alert('이력서를 불러오는데 실패했습니다.');
    }
  };

  const tryDeleteResumeById = async () => {
    try {
      await userEmployApi.deleteResume(id);
    } catch (error) {
      Alert.alert('알림', '삭제되었습니다.');
      navigation.navigate('MyApplicantList');
    }
  };

  const handleDelete = () => {
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
            tryDeleteResumeById();
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
            id: id,
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
      {applicantData ? (
        <>
          <ScrollView style={styles.scrollView}>
            <ApplicantProfileHeader
              data={applicantData}
              hashtags={applicantData.hashtags}
            />
            <ApplicantExperienceSection
              experiences={applicantData?.workExperience}
              totalExperience={applicantData?.totalExperience}
            />
            <ApplicantSelfIntroduction text={applicantData?.selfIntro} />
          </ScrollView>
          {renderActionButtons()}
        </>
      ) : (
        <Text style={styles.loadingText}>이력서를 불러오는 중입니다...</Text>
      )}
    </SafeAreaView>
  );
};

export default ApplicantDetail;
