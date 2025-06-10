import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import {COLORS} from '@constants/colors';
import styles from './Applicant.styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import CalendarIcon from '@assets/images/Calendar.svg';
import EditIcon from '@assets/images/Edit.svg';
import CheckedCircleIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedCircleIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import ChevronDownIcon from '@assets/images/arrow_drop_down.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';

const Applicant = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {recruitId, recruitTitle, guesthouseName, recruitEnd} = route.params;

  const [resumes, setResumes] = useState();
  const [applicant, setApplicant] = useState({
    message: '',
    startDate: null,
    endDate: null,
    personalInfoConsent: false, // 개인 정보 제 3자 정보 동의 여부
    resumeId: null, // 선택한 이력서
  });
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    fetchResumeList();
  }, []);

  const fetchResumeList = async () => {
    try {
      const response = await userEmployApi.getResumes();
      setResumes(response.data);
    } catch (error) {
      Alert.alert('이력서를 가져오는데 실패했습니다.');
    }
  };

  const handleEditResume = id => {
    navigation.navigate('ApplicantForm', {isEditMode: true, id: id});
  };

  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || applicant[dateField];
    if (dateField === 'startDate') setShowStartDate(false);
    if (dateField === 'endDate') setShowEndDate(false);
    setApplicant(prev => ({...prev, [dateField]: currentDate}));
  };

  const handleSubmit = async () => {
    if (!applicant.resumeId) {
      Alert.alert('이력서를 선택해주세요.');
      return;
    }
    if (!applicant.personalInfoConsent) {
      Alert.alert('개인정보 제3자 제공에 동의해주세요.');
      return;
    }
    if (!applicant.startDate || !applicant.endDate) {
      Alert.alert('근무가능기간을 입력해주세요.');
      return;
    }
    try {
      const parsedData = {
        message: applicant.message,
        startDate: formatDate(applicant.startDate),
        endDate: formatDate(applicant.endDate),
        personalInfoConsent: applicant.personalInfoConsent,
        resumeId: applicant.resumeId,
      };
      await userEmployApi.apply(recruitId, parsedData);
      Alert.alert('지원이 완료되었습니다.');
      navigation.navigate('MyApplicantList');
    } catch (error) {
      Alert.alert('지원서 등록에 실패했습니다.');
    }
  };

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderResumeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>이력서 선택</Text>

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
                  #{tag.hashtag}{' '}
                </Text>
              ))}
            </View>
            <Text style={styles.lastModifiedText}>
              최종수정일 {item.updatedAt.split('T')[0]}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditResume(item.resumeId)}>
            <EditIcon width={24} height={24} color={COLORS.gray} />
          </TouchableOpacity>
        </TouchableOpacity>
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

  const renderPrivacyAgreement = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.privacyRow}
        onPress={() =>
          setApplicant(prev => ({
            ...prev,
            personalInfoConsent: !prev.personalInfoConsent,
          }))
        }>
        <View style={styles.checkboxContainer}>
          {applicant.personalInfoConsent ? (
            <View style={styles.checkedBox}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ) : (
            <View style={styles.uncheckedBox} />
          )}
        </View>

        <TouchableOpacity
          style={styles.privacyTextContainer}
          onPress={() => {
            setIsPrivacyModalOpen(true);
          }}>
          <Text style={styles.privacyText}>
            <Text style={styles.requiredText}>(필수)</Text> 개인정보 제3자 제공
            동의
          </Text>
          <ChevronDownIcon width={24} height={24} />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={isPrivacyModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPrivacyModalOpen(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>개인정보 제3자 제공 동의</Text>

            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.modalText}>
                1. 개인정보를 제공받는 자: 구인 공고 등록 기업{'\n\n'}
                2. 제공하는 개인정보 항목: 이름, 연락처, 이메일, 경력사항,
                자기소개서 등 이력서에 기재한 정보{'\n\n'}
                3. 개인정보를 제공받는 자의 개인정보 이용 목적: 채용 전형 진행,
                채용 여부 결정{'\n\n'}
                4. 개인정보를 제공받는 자의 개인정보 보유 및 이용 기간: 채용
                전형 종료 후 3개월까지{'\n\n'}
                5. 동의를 거부할 권리 및 동의 거부에 따른 불이익: 지원자는
                개인정보 제공 동의를 거부할 권리가 있으나, 동의 거부 시 채용
                전형에 지원이 불가합니다.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setIsPrivacyModalOpen(false);
              }}>
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderSubmitButton = () => (
    <View style={styles.submitButtonContainer}>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>지원하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="지원하기" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{recruitTitle}</Text>
        <View style={styles.tabContainer}>
          <Text style={styles.tabText}>{guesthouseName}</Text>
          <Text style={styles.tabText}>{recruitEnd?.split('T')[0]}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderResumeSelection()}
        {renderWorkPeriod()}
        {renderMessageToOwner()}
        {renderPrivacyAgreement()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {renderSubmitButton()}
    </SafeAreaView>
  );
};

export default Applicant;
