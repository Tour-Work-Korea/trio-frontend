import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {COLORS} from '@constants/colors';
import styles from './ApplicantForm.styles';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import userEmployApi from '@utils/api/userEmployApi';
import {checkUserPermission} from '@utils/auth/verifyPermission';

import CalendarIcon from '@assets/images/Calendar.svg';
import Chevron_left_black from '@assets/images/chevron_left_black.svg';
import EditIcon from '@assets/images/Edit.svg';
import CheckedCircleIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedCircleIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import {userApplyAgrees} from '@data/agree';
import ButtonScarlet from '@components/ButtonScarlet';
import ErrorModal from '@components/modals/ErrorModal';

const ApplicantForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {recruitId} = route.params;

  const [resumes, setResumes] = useState();
  const [applicant, setApplicant] = useState({
    message: '',
    startDate: null,
    endDate: null,
    personalInfoConsent: false,
    resumeId: null,
  });
  const [agreements, setAgreements] = useState(userApplyAgrees);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  //약관동의 여부 확인
  useEffect(() => {
    const allRequired = agreements
      .filter(item => item.isRequired)
      .every(item => item.isAgree);
    setApplicant(prev => ({...prev, personalInfoConsent: allRequired}));
  }, [agreements]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const hasPermission = await checkUserPermission(navigation);
        if (hasPermission) {
          fetchResumeList();
        }
      };
      init();
    }, []),
  );

  const fetchResumeList = async () => {
    try {
      const response = await userEmployApi.getResumes();
      setResumes(response.data);

      if (response.data.length > 0) {
        setApplicant(prev => ({
          ...prev,
          resumeId: response.data[0].resumeId,
        }));
      }
    } catch (error) {
      Alert.alert('이력서를 가져오는데 실패했습니다.');
    }
  };

  const handleEditResume = id => {
    navigation.navigate('MyResumeDetail', {id, isEditable: true});
  };

  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || applicant[dateField];
    if (dateField === 'startDate') setShowStartDate(false);
    if (dateField === 'endDate') setShowEndDate(false);
    setApplicant(prev => ({...prev, [dateField]: currentDate}));
  };

  //약관동의 상세 보기
  const handleAgreeDetail = (title, detail) => {
    navigation.navigate('AgreeDetail', {title, detail});
  };
  //약관동의 체크 핸들러
  const handleAgreement = key => {
    const updated = agreements.map(item =>
      item.id === key ? {...item, isAgree: !item.isAgree} : item,
    );
    setAgreements(updated);
  };

  const handleSubmit = async () => {
    try {
      const parsedData = {
        //message, startDate, endDate는 임시
        message: '열심히 하겠습니다.',
        startDate: '2026-01-01',
        endDate: '2026-12-25',
        personalInfoConsent: applicant.personalInfoConsent,
        resumeId: applicant.resumeId,
      };
      await userEmployApi.apply(recruitId, parsedData);
      navigation.navigate('ApplySuccess');
    } catch (error) {
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message || '지원에 실패했습니다.',
        buttonText: '확인',
      });
      console.warn('지원서 등록 실패: ', error);
    }
  };

  const renderResumeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>지원할 이력서를 선택해주세요</Text>

      {resumes?.map(item => (
        <TouchableOpacity
          key={item.resumeId}
          style={styles.resumeItem}
          onPress={() => {
            if (item.resumeId === applicant.resumeId) {
              setApplicant(prev => ({...prev, resumeId: null}));
            } else {
              setApplicant(prev => ({...prev, resumeId: item.resumeId}));
            }
          }}>
          <View style={styles.resumeLeftSection}>
            {applicant.resumeId === item.resumeId ? (
              <CheckedCircleIcon
                width={24}
                height={24}
                color={COLORS.scarlet}
              />
            ) : (
              <UncheckedCircleIcon width={24} height={24} color={COLORS.gray} />
            )}
          </View>

          <View style={styles.resumeMiddleSection}>
            <Text style={styles.resumeTitle}>{item.resumeTitle}</Text>
            <View style={styles.tagsContainer}>
              {item.hashtags.map((tag, index) => (
                <Text key={index} style={styles.tagText}>
                  {tag.hashtag}
                </Text>
              ))}
            </View>
            <View style={styles.modifiedContainer}>
              <View style={styles.modifiedTextBox}>
                <Text style={styles.lastModifiedText}>최종수정일</Text>
                <Text style={styles.lastModifiedText}>
                  {item.updatedAt.split('T')[0]}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditResume(item.resumeId)}>
                <EditIcon width={24} height={24} color={COLORS.grayscale_400} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
  const renderCheckbox = (isChecked, onPress) => (
    <View>
      {isChecked ? (
        <TouchableOpacity
          style={[styles.checkbox, styles.checked]}
          onPress={onPress}>
          <CheckOrange width={24} height={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.checkbox} onPress={onPress}>
          <CheckGray width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );
  const renderPrivacyAgreement = () => (
    <View style={[styles.section, {marginBottom: 20}]}>
      {/* 동의 목록 */}
      <View style={styles.horizontalLine} />
      {agreements.map(item => (
        <View style={[styles.parentWrapperFlexBox]} key={item.id}>
          <View style={[styles.checkboxGroup, styles.parentWrapperFlexBox]}>
            {renderCheckbox(item.isAgree, () => handleAgreement(item.id))}
            <View style={[styles.frameContainer, styles.parentWrapperFlexBox]}>
              <View style={[styles.parent, styles.parentWrapperFlexBox]}>
                {item.isRequired ? (
                  <Text style={[styles.textRequired, styles.textBlue]}>
                    [필수]
                  </Text>
                ) : null}
                <Text style={styles.textAgreeTitle}>{item.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAgreeDetail(item.title, item.description)}>
                <Text style={[styles.textSmall, styles.textBlue]}>보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
  const renderWorkPeriod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>희망 근무기간</Text>

      <View style={styles.datePickerRow}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowStartDate(true)}>
          <View style={styles.datePickerContent}>
            <Text style={styles.dateText}>
              {applicant.startDate
                ? new Date(applicant.startDate).toLocaleDateString('ko-KR')
                : '시작일자'}
            </Text>
            <CalendarIcon width={24} height={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowEndDate(true)}>
          <View style={styles.datePickerContent}>
            <Text style={styles.dateText}>
              {applicant.endDate
                ? new Date(applicant.endDate).toLocaleDateString('ko-KR')
                : '마감일자'}
            </Text>
            <CalendarIcon width={24} height={24} />
          </View>
        </TouchableOpacity>
      </View>

      {showStartDate && (
        <DateTimePicker
          value={applicant.startDate ?? new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'startDate')}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={applicant.endDate ?? new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'endDate')}
        />
      )}
    </View>
  );
  const renderMessageToOwner = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>사장님께 한마디</Text>

      <TextInput
        style={styles.messageInput}
        placeholder="지원 동기나 각오를 입력하거나 사장님께서 따로 작성해달라고 한 항목을 입력해주세요"
        value={applicant.message}
        onChangeText={text => setApplicant(prev => ({...prev, message: text}))}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={{paddingHorizontal: 20}}>
        <View style={styles.headerBox}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Chevron_left_black width={28.8} height={28.8} />
          </TouchableOpacity>
          <Text style={styles.headerText}>채용공고</Text>
          <View width={28.8} height={28.8} />
        </View>

        <ScrollView style={styles.scrollView}>
          {renderResumeSelection()}
          {/* {renderWorkPeriod()}
        {renderMessageToOwner()} */}
        </ScrollView>
      </View>
      <View style={styles.bottomButtonContainer}>
        {renderPrivacyAgreement()}
        <ButtonScarlet
          title="지원하기"
          onPress={handleSubmit}
          disabled={!applicant.personalInfoConsent || !applicant.resumeId}
        />
      </View>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default ApplicantForm;
