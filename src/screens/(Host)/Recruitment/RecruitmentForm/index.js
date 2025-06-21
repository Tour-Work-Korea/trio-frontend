import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styles from './RecruitmentForm';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  BasicInfoSection,
  HashTagSection,
  RecruitConditionSection,
  WorkConditionSection,
  WorkInfoSection,
  DetailInfoSection,
} from '@components/Employ/RecruitmentForm';
import {validateRecruitForm} from '@utils/validation/recruitmentFormValidation';

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    recruitTitle: '',
    recruitShortDescription: '',
    recruitStart: null,
    recruitEnd: null,
    recruitNumberMale: 0,
    recruitNumberFemale: 0,
    location: '',
    recruitCondition: '',
    recruitMinAge: 0,
    recruitMaxAge: 0,
    workType: '',
    workStartDate: null,
    workEndDate: null,
    workPart: '',
    welfare: '',
    recruitDetail: '',
    recruitImage: [],
    hashtags: [],
    guesthouseId: 0,
  });
  const route = useRoute();
  const recruit = route.params ?? null;
  const navigation = useNavigation();

  useEffect(() => {
    if (recruit) {
      setFormData({
        recruitTitle: recruit.recruitTitle,
        recruitShortDescription: recruit.recruitShortDescription,
        recruitStart: new Date(recruit.recruitStart),
        recruitEnd: new Date(recruit.recruitEnd),
        workStartDate: new Date(recruit.workStartDate),
        workEndDate: new Date(recruit.workEndDate),
        recruitNumberFemale: recruit.recruitNumberFemale,
        recruitNumberMale: recruit.recruitNumberMale,
        recruitMinAge: recruit.recruitMinAge,
        recruitMaxAge: recruit.recruitMaxAge,
        recruitCondition: recruit.recruitCondition,
        workType: recruit.workType,
        workPart: recruit.workPart,
        welfare: recruit.welfare,
        location: recruit.location,
        recruitImage: recruit.recruitImages,
        recruitDetail: recruit.recruitDetail,
        hashtags: recruit.hashtags?.map(tag => tag.id) || [],
        guesthouseId: recruit.guesthouseId,
      });
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    const errors = validateRecruitForm(formData);
    if (errors.length > 0) {
      Alert.alert('입력 오류', errors[0]);
      return;
    }

    const payload = {
      ...formData,
      recruitStart: formData.recruitStart.toISOString(),
      recruitEnd: formData.recruitEnd.toISOString(),
      workStartDate: formData.workStartDate.toISOString(),
      workEndDate: formData.workEndDate.toISOString(),
    };

    if (recruit?.recruitId != null) {
      const updatedPayload = {...payload};
      delete updatedPayload.guesthouseId;

      fetchUpdateRecruit(updatedPayload, recruit.recruitId);
    } else {
      fetchNewRecruit(payload);
    }
  };

  const fetchNewRecruit = async payload => {
    try {
      await hostEmployApi.createRecruit(payload);
      Alert.alert('새로운 공고를 등록했습니다.');
      navigation.navigate('MyRecruitmentList');
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.';
      Alert.alert('공고 수정에 실패했습니다.', serverMessage);
    }
  };

  const fetchUpdateRecruit = async (payload, updatedRecruitId) => {
    try {
      await hostEmployApi.updateRecruit(updatedRecruitId, payload);
      Alert.alert('공고를 성공적으로 수정했습니다.');
      navigation.navigate('MyRecruitmentList');
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.';
      Alert.alert('공고 수정에 실패했습니다.', serverMessage);
    }
  };

  const handleTemporarySave = () => {
    console.log('Temporary saved:', formData);
    Alert.alert('임시 저장', '공고가 임시 저장되었습니다.');
  };

  const handlePreview = () => {
    console.log('Preview:', formData);
    Alert.alert('미리 보기', '미리 보기 기능은 아직 구현 중입니다.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="구인공고" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 기본정보 섹션 */}
        <BasicInfoSection
          isUpdate={recruit != null}
          handleInputChange={handleInputChange}
          formData={formData}
        />

        {/* 태그 섹션 */}
        <HashTagSection
          handleInputChange={handleInputChange}
          formData={formData}
        />

        {/* 모집조건 섹션 */}
        <RecruitConditionSection
          handleInputChange={handleInputChange}
          formData={formData}
        />

        {/* 근무 조건 섹션 */}
        <WorkConditionSection
          handleInputChange={handleInputChange}
          formData={formData}
        />

        {/* 근무지 정보 섹션 */}
        <WorkInfoSection
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />

        {/* 상세 소개글 섹션 */}
        <DetailInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
        />

        {/* 버튼 섹션 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {recruit ? '공고 수정하기' : '공고 등록하기'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleTemporarySave}>
              <Text style={styles.secondaryButtonText}>임시 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePreview}>
              <Text style={styles.secondaryButtonText}>미리 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecruitmentForm;
