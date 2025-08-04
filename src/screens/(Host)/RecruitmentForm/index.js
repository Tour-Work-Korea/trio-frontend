import React, {useState, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
import ErrorModal from '@components/modals/ErrorModal';

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
    setFormData({
      recruitTitle: '비지터 게스트하우스 크루 모집',
      recruitShortDescription:
        '비지터 게스트하우스와 함께할 크루를 모집합니다!',
      recruitStart: null,
      recruitEnd: null,
      recruitNumberMale: 2,
      recruitNumberFemale: 3,
      location: '제주 제주시 한림읍',
      recruitCondition: '경력자 우대',
      recruitMinAge: 20,
      recruitMaxAge: 30,
      workType: '3인 2교대 주 3일 근무',
      workStartDate: null,
      workEndDate: null,
      workPart: '청소, 조식 준비',
      welfare: '숙식 제공, 레저 강습 제공',
      recruitDetail: '상세',
      recruitImage: [],
      hashtags: [10, 12, 16],
      guesthouseId: 5,
    });
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
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80} // 헤더 등 높이에 따라 조정
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

            <ErrorModal
              title={errorModal.title}
              visible={errorModal.visible}
              buttonText={errorModal.buttonText}
              onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
            />
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RecruitmentForm;
