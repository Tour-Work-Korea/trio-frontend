import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {
  ApplicantTitle,
  ApplicantExperienceSection,
  ApplicantProfileHeader,
  ApplicantSelfIntroduction,
  ApplicantTag,
} from '@components/Employ/ApplicantDetail';
import userEmployApi from '@utils/api/userEmployApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {parseDotDateToLocalDate} from '@utils/formatDate';
import AlertModal from '@components/modals/AlertModal';
import EmployExperienceModal from '@components/modals/Employ/EmployExperienceModal';
import EmploySelfIntroModal from '@components/modals/Employ/EmploySelfIntroModal';
import EmployTagModal from '@components/modals/Employ/EmployTagModal';
import Loading from '@components/Loading';
import Header from '@components/Header';
import EmptyState from '@components/EmptyState';

import styles from './MyResumeDetail.styles';
import EmploySuccessIcon from '@assets/images/wa_employ_success';

const ResumeDetail = ({route}) => {
  const navigation = useNavigation();
  const {
    id = null,
    isEditable = false,
    isNew = false,
    headerTitle = '이력서 수정',
  } = route.params || {};
  const [originalInfo, setOriginalInfo] = useState();
  const [formData, setFormData] = useState({
    resumeTitle: '',
    selfIntro: '',
    workExperience: [],
    hashtags: [],
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const [experienceModal, setExperienceModal] = useState({
    visible: false,
    editingIndex: null,
    editingData: null,
  });
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [selfIntroModalVisible, setSelfIntroModalVisible] = useState(false);
  const [newResumeSuccess, setNewResumeSuccess] = useState(false);

  const handlePressFindRecruit = () => {
    navigation.navigate('MainTabs', {
      screen: '커뮤니티',
      params: {tab: 'staff'},
    });
  };

  const handleOpenAddExperience = () => {
    setExperienceModal({
      visible: true,
      editingIndex: null,
      editingData: null,
    });
  };

  const handleOpenEditExperience = (experience, index) => {
    setExperienceModal({
      visible: true,
      editingIndex: index,
      editingData: experience,
    });
  };

  const handleCloseExperienceModal = () => {
    setExperienceModal(prev => ({...prev, visible: false}));
  };

  const handleApplyExperience = experience => {
    setFormData(prev => {
      const currentExperiences = prev.workExperience ?? [];
      const nextExperiences =
        experienceModal.editingIndex !== null
          ? currentExperiences.map((item, index) =>
              index === experienceModal.editingIndex ? experience : item,
            )
          : [...currentExperiences, experience];

      return {...prev, workExperience: nextExperiences};
    });
    setExperienceModal({
      visible: false,
      editingIndex: null,
      editingData: null,
    });
  };

  const tryFetchResumeById = useCallback(async () => {
    try {
      const response = await userEmployApi.getResumeById(id);
      const parsedFormData = {
        resumeTitle: response.data.resumeTitle || '',
        selfIntro: response.data.selfIntro || '',
        workExperience: response.data.workExperience || [],
        hashtags: response.data.hashtags || response.data.userHashtag || [],
      };
      setFormData(parsedFormData);
      setOriginalInfo(response.data);
    } catch (error) {
      console.warn('이력서 조회 실패:', error);
      setErrorModal({
        visible: true,
        message: '이력서 조회에 실패했습니다',
        buttonText: '확인',
      });
    }
  }, [id]);

  useEffect(() => {
    if (id != null) {
      tryFetchResumeById();
    }
  }, [id, tryFetchResumeById]);

  const tryUpdateResumeById = async () => {
    try {
      const updateData = {
        resumeTitle: formData.resumeTitle,
        selfIntro: formData.selfIntro,
        workExperience: formData.workExperience.map(exp => ({
          ...exp,
          startDate: parseDotDateToLocalDate(exp.startDate),
          endDate: parseDotDateToLocalDate(exp.endDate),
        })),
        hashtags: formData.hashtags?.map(tag => tag.id),
      };

      await userEmployApi.updateResume(originalInfo.id, updateData);
      navigation.goBack();
    } catch (error) {
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message || '이력서 등록에 실패했습니다',
        buttonText: '확인',
      });
      console.warn('이력서 등록 실패:', error);
    }
  };

  const tryPostResumeById = async () => {
    try {
      const newData = {
        resumeTitle: formData.resumeTitle,
        selfIntro: formData.selfIntro,
        workExperience: formData.workExperience.map(exp => ({
          ...exp,
          startDate: parseDotDateToLocalDate(exp.startDate),
          endDate: parseDotDateToLocalDate(exp.endDate),
        })),
        hashtags: formData.hashtags?.map(tag => tag.id),
      };

      await userEmployApi.addResume(newData);
      setNewResumeSuccess(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: error?.response?.data?.message || '이력서 등록에 실패했습니다',
        buttonText: '확인',
      });
      console.warn('이력서 등록 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={headerTitle} />
      {newResumeSuccess ? (
        <EmptyState
          icon={EmploySuccessIcon}
          iconSize={{width: 224, height: 171}}
          title="이력서 작성 완성!"
          description="스탭 지원하러 가볼까요?"
          buttonText="스탭 지원하기"
          onPressButton={handlePressFindRecruit}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {formData ? (
            <>
              {/* 프로필 */}
              {isNew ? <></> : <ApplicantProfileHeader data={originalInfo} />}

              {/* 제목 */}
              <ApplicantTitle
                title={formData?.resumeTitle}
                setTitle={data =>
                  setFormData(prev => ({...prev, resumeTitle: data}))
                }
                isEditable={isEditable}
              />
              {/* 경력 */}
              <ApplicantExperienceSection
                experiences={formData?.workExperience}
                isEditable={isEditable}
                setExperience={newList =>
                  setFormData(prev => ({...prev, workExperience: newList}))
                }
                onAddExperience={handleOpenAddExperience}
                onEditExperience={handleOpenEditExperience}
              />
              {/* 해시태그 */}
              <ApplicantTag
                tags={formData?.hashtags}
                isEditable={isEditable}
                onEditTags={() => setTagModalVisible(true)}
              />
              <ApplicantSelfIntroduction
                text={formData?.selfIntro}
                isEditable={isEditable}
                onEditSelfIntro={() => setSelfIntroModalVisible(true)}
              />
              {isEditable ? (
                <View style={styles.bottomGap}>
                  <ButtonScarlet
                    title={'저장하기'}
                    onPress={() =>
                      id == null ? tryPostResumeById() : tryUpdateResumeById()
                    }
                  />
                </View>
              ) : (
                <View style={styles.bottomGap} />
              )}
            </>
          ) : (
            <Loading title={'이력서를 불러오는 중입니다...'} />
          )}
        </ScrollView>
      )}
      <EmployExperienceModal
        visible={experienceModal.visible}
        initialData={experienceModal.editingData}
        onClose={handleCloseExperienceModal}
        addExperience={handleApplyExperience}
      />
      <EmployTagModal
        visible={tagModalVisible}
        onClose={() => setTagModalVisible(false)}
        addTags={newList =>
          setFormData(prev => ({...prev, hashtags: newList}))
        }
        initialData={formData?.hashtags}
      />
      <EmploySelfIntroModal
        visible={selfIntroModalVisible}
        onClose={() => setSelfIntroModalVisible(false)}
        editSelfIntro={data =>
          setFormData(prev => ({...prev, selfIntro: data}))
        }
        initialData={formData?.selfIntro}
      />
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default ResumeDetail;
