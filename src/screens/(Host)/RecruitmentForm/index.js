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
import {validateRecruitForm} from '@utils/validation/recruitmentFormValidation';
import BasicInfoSection from './BasicInfoSection';
import HashTagSection from './HashTagSection';
import RecruitConditionSection from './RecruitConditionSection';
import WorkConditionSection from './WorkConditionSection';
import WorkInfoSection from './WorkInfoSection';
import DetailInfoSection from './DetailInfoSection';
import ButtonScarlet from '@components/ButtonScarlet';

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    recruitTitle: '',
    recruitShortDescription: '',
    recruitStart: null,
    recruitEnd: null,
    recruitNumberMale: null,
    recruitNumberFemale: null,
    location: '',
    recruitCondition: '',
    recruitMinAge: null,
    recruitMaxAge: null,
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
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
  });

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
      setErrorModal({visible: true, title: errors[0], buttonText: '확인'});
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
      setErrorModal({
        visible: true,
        title: '새로운 공고를 등록했습니다',
        buttonText: '확인',
      });
      navigation.navigate('MyRecruitmentList');
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.';
      setErrorModal({visible: true, title: serverMessage, buttonText: '확인'});
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
      setErrorModal({visible: true, title: serverMessage, buttonText: '확인'});
    }
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
          <ButtonScarlet title={'등록하기'} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecruitmentForm;
