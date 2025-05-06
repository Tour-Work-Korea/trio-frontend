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
} from 'react-native';
import {COLORS} from '@constants/colors';
import styles from './Applicant.styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import CalendarIcon from '@assets/images/Calendar.svg';
import EditIcon from '@assets/images/Edit.svg';
import CheckedCircleIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedCircleIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import ChevronDownIcon from '@assets/images/arrow_drop_down.svg';
import * as DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@components/Header';

// 목업 데이터
const resumeData = [
  {
    id: '1',
    title: '많은 업무에 항상 최선을 다하는 인재입니다.',
    tags: ['해시태그1', '해시태그2'],
    lastModified: '2025.04.13',
  },
  {
    id: '2',
    title: '많은 업무에 항상 최선을 다하는 인재입니다.',
    tags: ['해시태그1', '해시태그2'],
    lastModified: '2025.04.13',
  },
  {
    id: '3',
    title: '많은 업무에 항상 최선을 다하는 인재입니다.',
    tags: ['해시태그1', '해시태그2'],
    lastModified: '2025.04.13',
  },
];

const Applicant = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const jobId = route.params?.jobId;
  const jobTitle = route.params?.jobTitle || '공고 제목';

  const [selectedResumeId, setSelectedResumeId] = useState('1');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ); // 30일 후
  const [message, setMessage] = useState('');
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // 날짜 선택 관련 상태
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleResumeSelect = id => {
    setSelectedResumeId(id);
  };

  const handleEditResume = id => {
    navigation.navigate('ApplicantForm', {isEditMode: true, resumeId: id});
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const togglePrivacyAgreement = () => {
    setIsPrivacyAgreed(!isPrivacyAgreed);
  };

  const openPrivacyModal = () => {
    setIsPrivacyModalOpen(true);
  };

  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedResumeId) {
      alert('이력서를 선택해주세요.');
      return;
    }

    if (!isPrivacyAgreed) {
      alert('개인정보 제3자 제공에 동의해주세요.');
      return;
    }

    // 지원 제출 로직
    alert('지원이 완료되었습니다.');
    navigation.goBack();
  };

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const renderResumeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>이력서 선택</Text>

      {resumeData.map(resume => (
        <TouchableOpacity
          key={resume.id}
          style={styles.resumeItem}
          onPress={() => handleResumeSelect(resume.id)}>
          <View style={styles.resumeLeftSection}>
            {selectedResumeId === resume.id ? (
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
            <Text style={styles.resumeTitle}>{resume.title}</Text>
            <View style={styles.tagsContainer}>
              {resume.tags.map((tag, index) => (
                <Text key={index} style={styles.tagText}>
                  #{tag}{' '}
                </Text>
              ))}
            </View>
            <Text style={styles.lastModifiedText}>
              최종수정일 {resume.lastModified}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditResume(resume.id)}>
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
          onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.datePickerLabel}>근무시작일자</Text>
          <View style={styles.datePickerContent}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <CalendarIcon width={24} height={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowEndDatePicker(true)}>
          <Text style={styles.datePickerLabel}>근무종료일자</Text>
          <View style={styles.datePickerContent}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <CalendarIcon width={24} height={24} />
          </View>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate}
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
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
      />
    </View>
  );

  const renderPrivacyAgreement = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.privacyRow}
        onPress={togglePrivacyAgreement}>
        <View style={styles.checkboxContainer}>
          {isPrivacyAgreed ? (
            <View style={styles.checkedBox}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ) : (
            <View style={styles.uncheckedBox} />
          )}
        </View>

        <TouchableOpacity
          style={styles.privacyTextContainer}
          onPress={openPrivacyModal}>
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
        onRequestClose={closePrivacyModal}>
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
              onPress={closePrivacyModal}>
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
        <Text style={styles.headerTitle}>{jobTitle}</Text>
        <View style={styles.tabContainer}>
          <Text style={styles.tabText}>기업명</Text>
          <Text style={styles.tabText}>마감일</Text>
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
