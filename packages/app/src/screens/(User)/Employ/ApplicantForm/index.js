import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';

import userEmployApi from '@utils/api/userEmployApi';
import {userApplyAgrees} from '@data/agree';
import ButtonScarlet from '@components/ButtonScarlet';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import EmployEmpty from '@components/Employ/EmployEmpty';

import EditIcon from '@assets/images/edit_gray.svg';
import CheckedCircleIcon from '@assets/images/radio_button_enabled.svg';
import UncheckedCircleIcon from '@assets/images/radio_button_disabled.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import {COLORS} from '@constants/colors';
import styles from './ApplicantForm.styles';
import useUserStore from '@stores/userStore';

const ApplicantForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {recruitId, startDate, message} = route.params ?? {};

  const [resumes, setResumes] = useState();
  const [applicant, setApplicant] = useState({
    message: '',
    personalInfoConsent: false,
    resumeId: null,
  });
  const [agreements, setAgreements] = useState(userApplyAgrees);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const [footerHeight] = useState(0);
  const userProfile = useUserStore(state => state.userProfile);
  const noResumeState = userProfile?.mbti === 'DEFAULT'; //true이면 정보 부족, false이면 이력서 없음
  const hasNoResume = resumes?.length === 0;

  const tryFetchResumeList = useCallback(async () => {
    try {
      const response = await userEmployApi.getResumes();
      setResumes(response.data);
      if (response.data.length > 0) {
        setApplicant(prev => ({...prev, resumeId: response.data[0].resumeId}));
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '이력서를 가져오는데 실패했습니다',
        buttonText: '확인',
      });
    }
  }, []);

  useEffect(() => {
    const allRequired = agreements
      .filter(item => item.isRequired)
      .every(item => item.isAgree);
    setApplicant(prev => ({...prev, personalInfoConsent: allRequired}));
  }, [agreements]);

  useFocusEffect(
    useCallback(() => {
      tryFetchResumeList();
    }, [tryFetchResumeList]),
  );

  const handleEditResume = id => {
    navigation.navigate('ResumeDetail', {
      id,
      isEditable: true,
      headerTitle: '이력서 수정',
    });
  };

  const handleCreateResume = () => {
    if (noResumeState) {
      navigation.navigate('ProfileUpdate');
      return;
    }

    navigation.navigate('ResumeDetail', {
      isEditable: true,
      role: 'USER',
      isNew: true,
      headerTitle: '이력서 작성',
    });
  };

  const handleAgreeDetail = id => {
    navigation.navigate('AgreeDetail', {id, who: 'USER'});
  };

  const handleAgreement = key => {
    const updated = agreements.map(item =>
      item.id === key ? {...item, isAgree: !item.isAgree} : item,
    );
    setAgreements(updated);
  };

  const handleSubmit = async () => {
    if (!startDate) {
      setErrorModal({
        visible: true,
        message: '입도 가능 날짜를 선택해주세요.',
        buttonText: '확인',
      });
      return;
    }

    try {
      const parsedData = {
        message: message?.trim() || '열심히 하겠습니다.',
        startDate,
        personalInfoConsent: applicant.personalInfoConsent,
        resumeId: applicant.resumeId,
      };
      await userEmployApi.apply(recruitId, parsedData);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {name: 'MainTabs', params: {screen: '채용'}},
            {name: 'ApplySuccess'},
          ],
        }),
      );
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
    <View style={[styles.section, {width: '100%', height: '100%'}]}>
      {resumes?.length === 0 ? (
        noResumeState ? (
          <EmployEmpty
            title={'아직 정보가 부족해요'}
            subTitle={'이력서를 완성하러 가볼까요?'}
          />
        ) : (
          <EmployEmpty title={'작성하신 이력서가 없습니다'} />
        )
      ) : (
        <View>
          <Text style={styles.sectionTitle}>지원할 이력서를 선택해주세요</Text>
          <View style={styles.body}>
            {resumes?.map(item => (
              <TouchableOpacity
                activeOpacity={1}
                key={item.resumeId}
                style={styles.resumeItem}
                onPress={() => {
                  setApplicant(prev => ({
                    ...prev,
                    resumeId:
                      prev.resumeId === item.resumeId ? null : item.resumeId,
                  }));
                }}>
                <View style={styles.resumeLeftSection}>
                  {applicant.resumeId === item.resumeId ? (
                    <CheckedCircleIcon
                      width={24}
                      height={24}
                      color={COLORS.primary_orange}
                    />
                  ) : (
                    <UncheckedCircleIcon
                      width={24}
                      height={24}
                      color={COLORS.gray}
                    />
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
                      activeOpacity={1}
                      style={styles.editButton}
                      onPress={() => handleEditResume(item.resumeId)}>
                      <EditIcon
                        width={24}
                        height={24}
                        color={COLORS.grayscale_400}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderCheckbox = (isChecked, onPress) => (
    <View>
      {isChecked ? (
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.checkbox, styles.checked]}
          onPress={onPress}>
          <CheckOrange width={24} height={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.checkbox}
          onPress={onPress}>
          <CheckGray width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPrivacyAgreement = () => (
    <View style={[styles.section, styles.privacySection]}>
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
                activeOpacity={1}
                onPress={() => handleAgreeDetail(item.id)}>
                <Text style={[styles.textSmall, styles.textBlue]}>보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={'채용공고'} />

      {/* 본문: 스크롤 영역 */}
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: footerHeight + 16,
            width: '100%',
            height: '100%',
          }}>
          {renderResumeSelection()}
        </ScrollView>

        {/* 하단 고정 영역 */}
        <View style={styles.bottomButtonContainer}>
          {!hasNoResume && renderPrivacyAgreement()}
          <ButtonScarlet
            title={hasNoResume ? '이력서 작성하기' : '지원하기'}
            onPress={hasNoResume ? handleCreateResume : handleSubmit}
            disabled={
              hasNoResume
                ? false
                : !applicant.personalInfoConsent || !applicant.resumeId
            }
          />
        </View>
      </View>

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default ApplicantForm;
