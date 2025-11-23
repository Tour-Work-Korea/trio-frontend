import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import styles from './RecruitmentForm.styles';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {computeValidSections} from '@utils/validation/recruitmentFormValidation';

import RecruitConditionSection from './RecruitConditionSection';
import WorkConditionSection from './WorkConditionSection';
import WorkInfoSection from './WorkInfoSection';
import DetailInfoSection from './DetailInfoSection';
import ErrorModal from '@components/modals/ErrorModal';
import GuesthouseModal from './GuesthouseModal';
import ShortDescriptionModal from './ShortDescriptionModal';

import CheckOrange from '@assets/images/check_orange.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import ChevronBlack from '@assets/images/chevron_right_black.svg';
import {COLORS} from '@constants/colors';

const sections = [
  {id: 'guesthouse', title: '게스트하우스'},
  {id: 'shortDescription', title: '공고 요약'},
  {id: 'recruitCondition', title: '모집 조건'},
  {id: 'workCondition', title: '근무 조건'},
  {id: 'workInfo', title: '근무지 정보'},
  {id: 'detailInfo', title: '상세 정보'},
];

const RecruitmentForm = ({route}) => {
  const [formData, setFormData] = useState({
    recruitTitle: '',
    recruitShortDescription: '',
    recruitStart: null,
    recruitEnd: null,
    entryStartDate: null,
    entryEndDate: null,
    recruitNumberMale: 0,
    recruitNumberFemale: 0,
    recruitNumberNoGender: 0,
    recruitCondition: [],
    recruitMinAge: 0,
    recruitMaxAge: 0,
    workType: '',
    workDuration: '',
    workPart: [],
    welfare: [],
    recruitDetail: '',
    recruitImage: [],
    hashtags: [],
    guesthouseId: 0,
  });
  const recruitId = route.params?.recruitId ?? null;
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
    setValid(computeValidSections(formData));
  }, [formData]);

  useEffect(() => {
    const toDate = v => (v ? new Date(v) : null);
    const splitTitles = v =>
      Array.isArray(v)
        ? v
        : typeof v === 'string'
        ? v
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];
    const toCondObjs = v => {
      const arr = Array.isArray(v) ? v : splitTitles(v);
      return arr.map((t, i) =>
        typeof t === 'string' ? {id: -1000 - i, title: t} : t,
      );
    };
    const getPrevRecruit = async id => {
      const response = await hostEmployApi.getRecruitDetail(id);
      const r = response.data;

      setFormData(prev => ({
        ...prev,
        recruitTitle: r.recruitTitle ?? '',
        recruitShortDescription: r.recruitShortDescription ?? '',
        recruitStart: toDate(r.recruitStart),
        recruitEnd: toDate(r.recruitEnd),
        entryStartDate: toDate(r.entryStartDate),
        entryEndDate: toDate(r.entryEndDate),

        recruitNumberFemale: r.recruitNumberFemale ?? 0,
        recruitNumberMale: r.recruitNumberMale ?? 0,
        recruitNumberNoGender: r.recruitNumberNoGender ?? 0,
        recruitMinAge: r.recruitMinAge ?? 0,
        recruitMaxAge: r.recruitMaxAge ?? 0,

        recruitCondition: toCondObjs(r.recruitCondition),
        workPart: splitTitles(r.workPart),
        welfare: splitTitles(r.welfare),

        workType: r.workType ?? '',
        workDuration: r.workDuration ?? '',

        recruitImage: r.recruitImages ?? [],
        recruitDetail: r.recruitDetail ?? '',
        hashtags: (r.hashtags ?? []).map(t => t.id),
        guesthouseId: r.guesthouseId ?? 0,
      }));
    };

    if (recruitId) {
      getPrevRecruit(recruitId);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = () => {
    const payload = {
      ...formData,
      recruitStart: formData.recruitStart.toISOString(),
      recruitEnd: formData.recruitEnd.toISOString(),
      entryStartDate: formData.entryStartDate.toISOString(),
      entryEndDate: formData.entryEndDate.toISOString(),
      recruitCondition: formData.recruitCondition.map(c => c.title).join(', '),
      workPart: formData.workPart.join(', '),
      welfare: formData.welfare.join(', '),
    };

    fetchNewRecruit(payload);
  };

  const fetchNewRecruit = async payload => {
    try {
      await hostEmployApi.createRecruit(payload);
      setErrorModal({
        visible: true,
        title: '새로운 공고를 등록했습니다',
        buttonText: '확인',
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {name: 'MainTabs', params: {screen: '마이'}},
            {name: 'MyRecruitmentList'},
          ],
        }),
      );
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
                  maxLength={30}
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
            {/* 근무지 정보 */}
            <WorkInfoSection
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.workInfo}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  workInfo: false,
                }))
              }
            />
            {/* 상세 정보 */}
            <DetailInfoSection
              handleInputChange={handleInputChange}
              formData={formData}
              visible={modalVisible.detailInfo}
              onClose={() =>
                setModalVisible(prev => ({
                  ...prev,
                  detailInfo: false,
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
