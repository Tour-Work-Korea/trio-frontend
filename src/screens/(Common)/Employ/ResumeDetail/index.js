import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import styles from './MyResumeDetail.styles';
import {useNavigation, useRoute} from '@react-navigation/native';
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
import ErrorModal from '@components/modals/ErrorModal';
import Loading from '@components/Loading';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import EmptyState from '@components/EmptyState';
import EmploySuccessIcon from '@assets/images/wa_employ_success';

const ResumeDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    id = null,
    isEditable = false,
    role = 'USER',
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
  const [newResumeSuccess, setNewResumeSuccess] = useState(false);

  useEffect(() => {
    if (id != null) {
      tryFetchResumeById();
    }
  }, []);

  const tryFetchResumeById = async () => {
    try {
      let response;
      if (role === 'HOST') {
        response = await hostEmployApi.getApplicantDetail(id);
      } else {
        response = await userEmployApi.getResumeById(id);
      }
      const parsedFormData = {
        resumeTitle: response.data.resumeTitle || '',
        selfIntro: response.data.selfIntro || '',
        workExperience: response.data.workExperience || [],
        hashtags: response.data.hashtags || [],
      };
      setFormData(parsedFormData);
      setOriginalInfo(response.data);
      console.log('hashtaags:', response.data.hashtags);
    } catch (error) {
      console.warn('이력서 조회 실패:', error);
      setErrorModal({
        visible: true,
        message: '이력서 조회에 실패했습니다',
        buttonText: '확인',
      });
    }
  };

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
          description="알바 지원하러 가볼까요?"
          buttonText="알바 보러가기"
          onPressButton={() =>
            navigation.navigate('MainTabs', {screen: '채용'})
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            flexGrow: 1,
            gap: 20,
          }}>
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
              />
              {/* 해시태그 */}
              <ApplicantTag
                tags={formData?.hashtags}
                isEditable={isEditable}
                setTags={newList =>
                  setFormData(prev => ({...prev, hashtags: newList}))
                }
              />
              <ApplicantSelfIntroduction
                text={formData?.selfIntro}
                isEditable={isEditable}
                setSelfIntro={data =>
                  setFormData(prev => ({...prev, selfIntro: data}))
                }
              />
              {isEditable ? (
                <View style={{marginBottom: 40}}>
                  <ButtonScarlet
                    title={'저장하기'}
                    onPress={() =>
                      id == null ? tryPostResumeById() : tryUpdateResumeById()
                    }
                  />
                </View>
              ) : (
                <View style={{marginBottom: 40}} />
              )}
            </>
          ) : (
            <Loading title={'이력서를 불러오는 중입니다...'} />
          )}
        </ScrollView>
      )}
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default ResumeDetail;
