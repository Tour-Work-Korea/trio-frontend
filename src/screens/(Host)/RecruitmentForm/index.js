import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import styles from './RecruitmentForm';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import {useNavigation, useRoute} from '@react-navigation/native';
import {validateRecruitForm} from '@utils/validation/recruitmentFormValidation';

import HashTagSection from './HashTagSection';
import RecruitConditionSection from './RecruitConditionSection';
import WorkConditionSection from './WorkConditionSection';
import WorkInfoSection from './WorkInfoSection';
import DetailInfoSection from './DetailInfoSection';
import ButtonScarlet from '@components/ButtonScarlet';
import ErrorModal from '@components/modals/ErrorModal';

import CheckOrange from '@assets/images/check_orange.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import ChevronBlack from '@assets/images/chevron_right_black.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import GuesthouseModal from './GuesthouseModal';
import ShortDescriptionModal from './ShortDescriptionModal';

const sections = [
  {id: 'guesthouse', title: '게스트하우스'},
  {id: 'shortDescription', title: '공고 요약'},
  {id: 'recruitCondition', title: '모집 조건'},
  {id: 'workCondition', title: '근무 조건'},
  {id: 'workInfo', title: '근무지 정보'},
  {id: 'detailInfo', title: '상세 정보'},
];

const RecruitmentForm = () => {
  const [formData, setFormData] = useState({
    recruitTitle: '',
    recruitShortDescription: '',
    recruitStart: null,
    recruitEnd: null,
    recruitNumberMale: 0,
    recruitNumberFemale: 0,
    location: '',
    recruitCondition: [],
    recruitMinAge: 0,
    recruitMaxAge: 0,
    workType: '',
    workStartDate: null,
    workEndDate: null,
    workPart: [],
    welfare: [],
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
  const [modalVisible, setModalVisible] = useState({
    title: false, // 공고 제목
    guesthouse: false, // 게스트하우스
    shortDescription: false, //공고 요약
    recruitCondition: false, //모집 조건
    workCondition: false, //근무 조건
    workInfo: false, //근무지 정보
    detailInfo: false, //상세 정보
  });
  const [valid, setValid] = useState({
    title: false, // 공고 제목
    guesthouse: false, // 게스트하우스
    shortDescription: false, //공고 요약
    recruitCondition: false, //모집 조건
    workCondition: false, //근무 조건
    workInfo: false, //근무지 정보
    detailInfo: false, //상세 정보
  });
  const isAllValid = useMemo(
    () => Object.values(valid).every(Boolean),
    [valid],
  );

  useEffect(() => {
    console.log(formData);
  }, [formData]);
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
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
    console.log(formData);

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
        <View style={styles.outContainer}>
          <Header title="알바공고 등록" />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableOpacity
              style={styles.sectionBox}
              onPress={() =>
                setModalVisible(prev => ({
                  ...prev,
                  title: !prev.title,
                }))
              }>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>공고 제목</Text>
                {valid.title ? (
                  <CheckOrange width={24} />
                ) : (
                  <ChevronBlack width={24} />
                )}
              </View>
              {modalVisible.title ? (
                <TextInput
                  style={styles.input}
                  placeholder="공고제목을 입력해주세요."
                  placeholderTextColor={COLORS.grayscale_400}
                  value={formData.recruitTitle}
                  onChangeText={text => handleInputChange('recruitTitle', text)}
                />
              ) : (
                <></>
              )}
            </TouchableOpacity>
            {sections.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.sectionBox}
                onPress={() =>
                  setModalVisible(prev => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }>
                <View style={styles.titleBox}>
                  <Text style={styles.titleText}>{item.title}</Text>
                  {valid[item.id] ? (
                    <CheckOrange width={24} />
                  ) : (
                    <ChevronBlack width={24} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            <Text style={styles.bottomText}>
              모든 항목을 입력하셔야 등록이 완료됩니다
            </Text>
            <View style={[styles.buttonLocation, styles.buttonContainer]}>
              <TouchableOpacity style={[styles.addButton]}>
                <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
                  임시저장
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  isAllValid && {backgroundColor: COLORS.primary_orange},
                ]}
                disabled={!isAllValid}
                onPress={handleSubmit}
                accessibilityState={{disabled: !isAllValid}}>
                <Text
                  style={
                    (styles.addButtonText,
                    isAllValid && {color: COLORS.grayscale_0})
                  }>
                  등록하기
                </Text>
                {!isAllValid ? (
                  <CheckBlack width={24} />
                ) : (
                  <CheckWhite width={24} />
                )}
              </TouchableOpacity>
            </View>
            <ErrorModal
              title={errorModal.title}
              visible={errorModal.visible}
              buttonText={errorModal.buttonText}
              onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
            />

            {/* 게스트하우스 모달 */}
            <GuesthouseModal
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.guesthouse}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  guesthouse: !prev.guesthouse,
                }))
              }
            />
            {/* 공고 요약 */}
            <ShortDescriptionModal
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.shortDescription}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  shortDescription: !prev.shortDescription,
                }))
              }
            />
            {/* 모집 조건 */}
            <RecruitConditionSection
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.recruitCondition}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  recruitCondition: !prev.recruitCondition,
                }))
              }
            />
            {/* 근무 조건 */}
            <WorkConditionSection
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.workCondition}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  workCondition: false,
                }))
              }
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RecruitmentForm;
