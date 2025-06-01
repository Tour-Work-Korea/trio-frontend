import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import EditIcon from '@assets/images/gray_chevron_right.svg';
import DeleteIcon from '@assets/images/delete.svg';
import CalendarIcon from '@assets/images/Calendar.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@components/Header';
import styles from './ApplicantForm.styles';

// 목업 데이터 (수정 모드일 때 사용)
const resumeData = {
  id: '1',
  name: '김지원',
  gender: '여자',
  birthYear: 2002,
  age: 22,
  phone: '010-0000-0000',
  email: 'email@email.com',
  address: '서울특별시 성동구',
  mbti: 'ENFP',
  socialMedia: 'instaID',
  hashtag: '#활발 #발랄',
  totalExperience: '총 2년 6개월',
  experiences: [
    {
      id: '1',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
  ],
  currentJob: {
    company: '',
    startDate: new Date(),
    endDate: new Date(),
    duties: '',
  },
  selfIntroduction: '',
  tags: {
    성실함: false,
    영어가능: false,
    동반자있음: false,
    파티X: false,
    친소한담: false,
    책임감: false,
    파티O: false,
    소규모: false,
    특식담당O: false,
  },
  attachments: [{id: '1', name: '첨부파일1'}],
};

const ApplicantForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id = null, isEditMode = false} = route.params || {};

  const [formData, setFormData] = useState(
    isEditMode
      ? resumeData
      : {
          id: '1',
          name: '초본',
          gender: '여자',
          birthYear: 2002,
          age: 22,
          phone: '010-0000-0000',
          email: 'email@email.com',
          address: '서울특별시 성동구',
          mbti: 'ENFP',
          socialMedia: 'instaID',
          hashtag: '#활발 #발랄',
          totalExperience: '',
          experiences: [],
          currentJob: {
            company: '',
            startDate: new Date(),
            endDate: new Date(),
            duties: '',
          },
          selfIntroduction: '',
          tags: {
            성실함: false,
            영어가능: false,
            동반자있음: false,
            파티X: false,
            친소한담: false,
            책임감: false,
            파티O: false,
            소규모: false,
            특식담당O: false,
          },
          attachments: [],
        },
  );

  // 날짜 선택 관련 상태
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrentJobChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      currentJob: {
        ...prev.currentJob,
        [field]: value,
      },
    }));
  };

  const handleTagToggle = tag => {
    const selectedCount = Object.values(formData.tags).filter(Boolean).length;
    const isSelected = formData.tags[tag];

    // 이미 선택된 상태가 아니고, 3개 이상이면 추가 선택 막기
    if (!isSelected && selectedCount >= 3) {
      Alert.alert('알림', '태그는 최대 3개까지 선택할 수 있어요.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [tag]: !isSelected,
      },
    }));
  };
  const handleAddExperience = () => {
    if (!formData.currentJob.company || !formData.currentJob.duties) {
      Alert.alert('알림', '회사명과 담당 업무를 입력해주세요.');
      return;
    }

    const startDateStr = formData.currentJob.startDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '.');
    const endDateStr = formData.currentJob.endDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '.');
    const period = `${startDateStr.substring(0, 7)} - ${endDateStr.substring(
      0,
      7,
    )}`;

    const newExperience = {
      id: Date.now().toString(),
      period,
      company: formData.currentJob.company,
      duties: formData.currentJob.duties,
    };

    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
      currentJob: {
        company: '',
        startDate: new Date(),
        endDate: new Date(),
        duties: '',
      },
    }));
  };

  const handleDeleteExperience = id => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id),
    }));
  };

  const handleDeleteAttachment = id => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file.id !== id),
    }));
  };

  const handleSubmit = () => {
    // 필수 입력 필드 검증
    if (!formData.name || !formData.phone || !formData.email) {
      Alert.alert('알림', '이름, 연락처, 이메일은 필수 입력 항목입니다.');
      return;
    }

    // 폼 제출 로직
    Alert.alert('성공', '이력서가 저장되었습니다.');
    navigation.goBack();
  };

  const handleEditMemberInfo = () => {
    Alert.alert('알림', '회원정보 수정 페이지로 이동합니다.');
    // 회원정보 수정 페이지로 이동하는 로직
  };

  const renderBasicInfo = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <TouchableOpacity
          style={styles.editMemberButton}
          onPress={handleEditMemberInfo}>
          <Text style={styles.editMemberButtonText}>회원정보 수정</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <ProfileIcon width={80} height={80} />
        </View>

        <Text style={styles.profileName}>
          {formData.name} {formData.gender} • {formData.age}세(
          {formData.birthYear})
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>연락처</Text>
            <Text style={styles.infoValue}>{formData.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{formData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{formData.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MBTI</Text>
            <Text style={styles.infoValue}>{formData.mbti}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>인스타그램</Text>
            <Text style={styles.infoValue}>{formData.socialMedia}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderExperienceSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>경력</Text>
        {formData.experiences.length > 0 && (
          <Text style={styles.experienceTotal}>
            총 {formData.totalExperience || '0년 0개월'}
          </Text>
        )}
      </View>

      {formData.experiences.map(exp => (
        <View key={exp.id} style={styles.experienceCard}>
          <View style={styles.experienceHeader}>
            <Text style={styles.experiencePeriod}>{exp.period}</Text>
            <View style={styles.experienceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <EditIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteExperience(exp.id)}>
                <DeleteIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.experienceCompany}>{exp.company}</Text>
          <Text style={styles.experienceDuties}>{exp.duties}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddExperience}>
        <Text style={styles.addButtonText}>경력 추가</Text>
      </TouchableOpacity>

      <View style={styles.currentJobSection}>
        <Text style={styles.formLabel}>회사명/직종</Text>
        <TextInput
          style={styles.textInput}
          placeholder="회사명 또는 업종을 입력하세요."
          value={formData.currentJob.company}
          onChangeText={text => handleCurrentJobChange('company', text)}
        />

        <Text style={styles.formLabel}>근무 기간</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {formData.currentJob.startDate
                .toISOString()
                .split('T')[0]
                .replace(/-/g, '.')}
            </Text>
            <CalendarIcon width={20} height={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {formData.currentJob.endDate
                .toISOString()
                .split('T')[0]
                .replace(/-/g, '.')}
            </Text>
            <CalendarIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.formLabel}>담당 업무</Text>
        <TextInput
          style={styles.textInput}
          placeholder="담당업무와 내용을 적어주세요."
          value={formData.currentJob.duties}
          onChangeText={text => handleCurrentJobChange('duties', text)}
          multiline
        />
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={formData.currentJob.startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              handleCurrentJobChange('startDate', selectedDate);
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.currentJob.endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              handleCurrentJobChange('endDate', selectedDate);
            }
          }}
        />
      )}
    </View>
  );

  const renderSelfIntroduction = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>자기소개서</Text>
      <TextInput
        style={styles.textAreaInput}
        placeholder="나에 대해 자유롭게 작성해주세요."
        value={formData.selfIntroduction}
        onChangeText={text => handleInputChange('selfIntroduction', text)}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );

  const renderTags = () => {
    const tagGroups = [
      ['성실함', '영어가능', '동반자있음'],
      ['파티X', '친소한담', '책임감'],
      ['파티O', '소규모', '특식담당O'],
    ];

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>태그</Text>
        <Text style={styles.tagDescription}>
          태그는 나의 특징을 나타내줘요! (최대 3개 선택가능)
        </Text>

        {tagGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.tagRow}>
            {group.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.tagOption}
                onPress={() => handleTagToggle(tag)}>
                <View
                  style={[
                    styles.radioButton,
                    formData.tags[tag] && styles.radioButtonSelected,
                  ]}>
                  {formData.tags[tag] && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderAttachments = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>첨부파일</Text>

      {formData.attachments.map(file => (
        <View key={file.id} style={styles.attachmentRow}>
          <Text style={styles.attachmentName}>{file.name}</Text>
          <TouchableOpacity
            style={styles.deleteAttachmentButton}
            onPress={() => handleDeleteAttachment(file.id)}>
            <DeleteIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.uploadFileButton}>
        <Text style={styles.uploadFileText}>
          프로필이나 나를 어필할 수 있는 것들을 올려주세요.
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="이력서 작성/수정" />
      <ScrollView style={styles.scrollView}>
        {renderBasicInfo()}
        {renderExperienceSection()}
        {renderSelfIntroduction()}
        {renderTags()}
        {renderAttachments()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            이력서 {isEditMode ? '저장/수정' : '등록'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ApplicantForm;
