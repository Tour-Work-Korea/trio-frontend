import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './ApplicantDetail.styles';
import {useNavigation} from '@react-navigation/native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import Header from '@components/Header';

// 목업 데이터
const applicantData = {
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
    {
      id: '2',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
    {
      id: '3',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
    {
      id: '4',
      period: '2022.03 - 2022.09',
      company: '음식점',
      duties: '서빙, 설거지, 손님응대, 계산, 청소',
    },
  ],
  selfIntroduction:
    '자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다. 자기소개서입니다.',
  attachments: [
    {id: '1', name: '첨부파일1'},
    {id: '2', name: '첨부파일2'},
  ],
};

const ApplicantDetail = () => {
  const navigation = useNavigation();

  const handleEdit = () => {
    // 수정 기능 구현
    Alert.alert('알림', '수정 기능이 구현될 예정입니다.');
  };

  const handleDelete = () => {
    // 삭제 기능 구현
    Alert.alert(
      '지원자 삭제',
      '정말로 이 지원자를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // 삭제 로직 구현
            Alert.alert('알림', '삭제되었습니다.');
            navigation.goBack();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeaderContainer}>
      <Text style={styles.pageTitle}>
        많은 업무에 항상 최선을 다하는 인재입니다.
      </Text>

      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <ProfileIcon width={80} height={80} />
        </View>

        <Text style={styles.profileName}>
          {applicantData.name} {applicantData.gender} • {applicantData.age}세(
          {applicantData.birthYear})
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>연락처</Text>
              <Text style={styles.infoValue}>{applicantData.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{applicantData.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>{applicantData.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{applicantData.mbti}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>인스타그램</Text>
              <Text style={styles.infoValue}>{applicantData.socialMedia}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>해시태그</Text>
              <Text style={styles.infoValueHashtag}>
                {applicantData.hashtag}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderExperienceSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>경력</Text>
        <Text style={styles.experienceTotal}>
          {applicantData.totalExperience}
        </Text>
      </View>

      <View style={styles.experienceCard}>
        <View style={styles.timelineContainer}>
          {applicantData.experiences.map((exp, index) => (
            <View key={exp.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View
                style={[
                  styles.timelineLine,
                  index === applicantData.experiences.length - 1 &&
                    styles.lastTimelineLine,
                ]}
              />

              <View style={styles.experienceContent}>
                <Text style={styles.experiencePeriod}>{exp.period}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceDuties}>{exp.duties}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSelfIntroduction = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>자기소개서</Text>

      <View style={styles.introductionCard}>
        <Text style={styles.introductionText}>
          {applicantData.selfIntroduction}
        </Text>
      </View>
    </View>
  );

  const renderAttachments = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>첨부파일</Text>

      {applicantData.attachments.map(file => (
        <TouchableOpacity key={file.id} style={styles.attachmentButton}>
          <Text style={styles.attachmentText}>{file.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.bottomButtonContainer}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          handleDelete();
        }}>
        <Text style={styles.secondaryButtonText}>삭제하기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => {
          navigation.navigate('ApplicantForm', applicantData.id);
        }}>
        <Text style={styles.applyButtonText}>수정하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'나의 이력서 상세'} />
      <ScrollView style={styles.scrollView}>
        {renderProfileHeader()}
        {renderExperienceSection()}
        {renderSelfIntroduction()}
        {renderAttachments()}
      </ScrollView>
      {renderActionButtons()}
    </SafeAreaView>
  );
};

export default ApplicantDetail;
