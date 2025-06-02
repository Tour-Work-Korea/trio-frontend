import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import DeleteIcon from '@assets/images/delete.svg';
import CalendarIcon from '@assets/images/Calendar.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@components/Header';
import styles from './ApplicantForm.styles';
import userInfoApi from '@utils/api/userInfoApi';
import {Image} from 'react-native-svg';
import userEmployApi from '@utils/api/userEmployApi';

const dummy = {
  resumeTitle: '열정 가득한 알바생!!!!',
  selfIntro: '끈기와 책임감이 가득한 청년입니다.',
  workExperience: [
    {
      companyName: '맥도날드 A',
      workType: '카운터',
      startDate: '2022-01-01',
      endDate: '2023-06-30',
      description: '주문 처리 및 고객 응대',
    },
    {
      companyName: '버거킹 B',
      workType: '씽크',
      startDate: '2023-07-01',
      endDate: '2025-01-01',
      description: '설거지',
    },
  ],
  hashtags: [1, 2, 3],
};

const ApplicantForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id = null, isEditMode = false} = route.params || {};
  const [baseInfo, setBaseInfo] = useState();
  const [currentJob, setCurrentJob] = useState({
    companyName: '',
    startDate: new Date(),
    endDate: new Date(),
    workType: '',
    description: '',
  });
  const [formData, setFormData] = useState({
    resumeTitle: '',
    selfIntro: '',
    workExperience: [],
    hashtags: [],
  });

  // 날짜 선택 관련 상태
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    getMyInfo();
    // setFormData(dummy);
    if (id != null) {
      tryFetchResumeData();
    }
  }, []);

  //기본 정보 조회
  const getMyInfo = async () => {
    try {
      const response = await userInfoApi.getMyInfo();
      setBaseInfo(response.data);
    } catch (error) {
      Alert.alert('기본 정보를 불러오는데 실패했습니다..');
    }
  };

  //기존 이력서 정보 조회(수정 시)
  const tryFetchResumeData = async () => {
    try {
      const response = await userEmployApi.getResumeById(id);
      const data = response.data;
      const parsedFormData = {
        resumeTitle: data.resumeTitle || '',
        selfIntro: data.selfIntro || '',
        workExperience: data.workExperience || [],
        // hashtags: data.hashtag?.map(item => item.hashtag) || [],
        hashtags: [],
      };

      setFormData(parsedFormData);
    } catch (error) {
      Alert.alert('기존 정보를 불러오는데 실패했습니다');
    }
  };

  //입력값 갱신 함수
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  //경력 핸들러
  const handleCurrentJobChange = (field, value) => {
    setCurrentJob(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  //해시태그 핸들러
  const handleTagToggle = tagId => {
    const isSelected = formData.hashtags.includes(tagId);

    // 선택되지 않았고 이미 3개라면 막기
    if (!isSelected && formData.hashtags.length >= 3) {
      Alert.alert('알림', '태그는 최대 3개까지 선택할 수 있어요.');
      return;
    }

    const updatedHashtags = isSelected
      ? formData.hashtags.filter(hashtagId => hashtagId !== tagId)
      : [...formData.hashtags, tagId];

    setFormData(prev => ({
      ...prev,
      hashtags: updatedHashtags,
    }));
  };

  const handleAddExperience = () => {
    if (!currentJob.companyName || !currentJob.workType) {
      Alert.alert('알림', '회사명과 담당 업무를 입력해주세요.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, currentJob],
    }));
    setCurrentJob({
      companyName: '',
      startDate: new Date(),
      endDate: new Date(),
      workType: '',
      description: '',
    });
  };

  const handleDeleteExperience = index => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.resumeTitle || !formData.selfIntro) {
      Alert.alert('알림', '제목과 자기소개를 입력해주세요.');
      return;
    }

    const formattedWorkExperience = formData.workExperience.map(exp => ({
      ...exp,
      startDate: new Date(exp.startDate).toISOString().split('T')[0],
      endDate: new Date(exp.endDate).toISOString().split('T')[0],
    }));

    const payload = {
      ...formData,
      workExperience: formattedWorkExperience,
    };
    //id가 없을 경우 새 이력서 등록 아닌 경우 수정

    try {
      if (id == null) {
        userEmployApi.addResume(payload);
        Alert.alert('제출 완료', '이력서가 저장되었습니다.');
        navigation.navigate('MyApplicantList');
      } else {
        userEmployApi.updateResume(id, payload);
        Alert.alert('제출 완료', '이력서가 수정되었습니다.');
        navigation.navigate('MyApplicantList');
      }
    } catch (error) {
      Alert.alert(' 이력서 등록/수정에 실패했습니다.');
    }
  };

  const handleEditMemberInfo = () => {
    Alert.alert('알림', '회원정보 수정 페이지로 이동합니다.');
    // 회원정보 수정 페이지로 이동하는 로직
  };

  const renderBasicInfo = () => (
    <View style={styles.sectionContainer}>
      {/* 이력서 제목 */}
      <Text style={styles.sectionTitle}>이력서 제목</Text>
      <TextInput
        style={styles.textInput}
        placeholder="이력서 제목을 입력하세요."
        value={formData.resumeTitle}
        onChangeText={text => handleInputChange('resumeTitle', text)}
      />

      {/* 기본 정보 */}
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
          {baseInfo?.photoUrl === '사진을 추가해주세요' ? (
            <ProfileIcon width={80} height={80} />
          ) : (
            <Image
              source={{uri: baseInfo?.photoUrl}}
              style={{width: 80, height: 80, borderRadius: 40}}
              resizeMode="cover"
            />
          )}
        </View>
        <Text style={styles.profileName}>
          {baseInfo?.name} {baseInfo?.gender} • {baseInfo?.age}세(
          {baseInfo?.birthYear})
        </Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>연락처</Text>
            <Text style={styles.infoValue}>{baseInfo?.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일</Text>
            <Text style={styles.infoValue}>{baseInfo?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주소</Text>
            <Text style={styles.infoValue}>{baseInfo?.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MBTI</Text>
            <Text style={styles.infoValue}>{baseInfo?.mbti}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>인스타그램</Text>
            <Text style={styles.infoValue}>{baseInfo?.instagramId}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderExperienceSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>경력</Text>
      {formData.workExperience.map((exp, idx) => (
        <View key={idx} style={styles.experienceCard}>
          <View style={styles.experienceHeader}>
            <Text style={styles.experiencePeriod}>
              {new Date(exp.startDate).toISOString().split('T')[0]} -{' '}
              {new Date(exp.endDate).toISOString().split('T')[0]}
            </Text>
            <View style={styles.experienceActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteExperience(idx)}>
                <DeleteIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.experienceCompany}>{exp.companyName}</Text>
          <Text style={styles.experienceDuties}>{exp.workType}</Text>
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
          value={currentJob.companyName}
          onChangeText={text => handleCurrentJobChange('companyName', text)}
        />

        <Text style={styles.formLabel}>근무 기간</Text>
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.datePickerButtonText}>
              {currentJob.startDate
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
              {currentJob.endDate
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
          placeholder="담당업무를 적어주세요."
          value={currentJob.duties}
          onChangeText={text => handleCurrentJobChange('workType', text)}
          multiline
        />

        <Text style={styles.formLabel}>상세 정보</Text>
        <TextInput
          style={styles.textInput}
          placeholder="상세 내용을 적어주세요."
          value={currentJob.duties}
          onChangeText={text => handleCurrentJobChange('description', text)}
          multiline
        />
      </View>
      {showStartDatePicker && (
        <DateTimePicker
          value={currentJob.startDate}
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
          value={currentJob.endDate}
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

  const renderSelfIntro = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>자기소개서</Text>
      <TextInput
        style={styles.textAreaInput}
        placeholder="나에 대해 자유롭게 작성해주세요."
        value={formData.selfIntro}
        onChangeText={text => handleInputChange('selfIntro', text)}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );

  const renderTags = () => {
    const tagOptions = [
      {label: '성실함', id: 1},
      {label: '책임감', id: 2},
      {label: '친화력', id: 3},
      {label: '파티O', id: 4},
      {label: '파티X', id: 5},
    ];

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>태그</Text>
        <Text style={styles.tagDescription}>
          태그는 나의 특징을 나타내줘요! (최대 3개 선택가능)
        </Text>
        <View style={styles.tagGrid}>
          {tagOptions.map(tag => {
            const isSelected = formData.hashtags.includes(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagButton,
                  isSelected && styles.tagButtonSelected,
                ]}
                onPress={() => handleTagToggle(tag.id)}>
                <Text
                  style={[
                    styles.tagButtonText,
                    isSelected && styles.tagButtonTextSelected,
                  ]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`이력서 ${isEditMode ? '수정' : '등록'}`} />
      <ScrollView style={styles.scrollView}>
        {renderBasicInfo()}
        {renderExperienceSection()}
        {renderSelfIntro()}
        {renderTags()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            이력서 {isEditMode ? '수정' : '등록'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ApplicantForm;
