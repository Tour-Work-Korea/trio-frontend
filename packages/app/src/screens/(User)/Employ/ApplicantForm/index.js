import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
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
        message: t('employ.failedToRetrieveResume'),
        buttonText: t('common.confirm'),
      });
    }
  }, [t]);

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
      headerTitle: t('employ.editYourResume'),
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
      headerTitle: t('employ.writeAResume'),
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
        message: t('employ.pleaseSelectAnAvailableDate'),
        buttonText: t('common.confirm'),
      });
      return;
    }

    try {
      const parsedData = {
        message: message?.trim() || t('employ.iWillWorkHard'),
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
        message:
          error?.response?.data?.message || t('employ.yourApplicationFailed'),
        buttonText: t('common.confirm'),
      });
      console.warn('지원서 등록 실패: ', error);
    }
  };

  const renderResumeSelection = () => (
    <View style={[styles.section, {width: '100%', height: '100%'}]}>
      {resumes?.length === 0 ? (
        noResumeState ? (
          <EmployEmpty
            title={t('common.thereIsStillNotEnoughInformation')}
            subTitle={t('common.shallWeGoCompleteOurResume')}
          />
        ) : (
          <EmployEmpty title={t('common.thereIsNoResumeWritten')} />
        )
      ) : (
        <View>
          <Text style={styles.sectionTitle}>
            {t('employ.pleaseSelectAResumeToApply')}
          </Text>
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
                      <Text style={styles.lastModifiedText}>
                        {t('common.lastModifiedDate')}
                      </Text>
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
                    {t('common.required')}
                  </Text>
                ) : null}
                <Text style={styles.textAgreeTitle}>{t(item.titleKey)}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleAgreeDetail(item.id)}>
                <Text style={[styles.textSmall, styles.textBlue]}>
                  {t('common.view')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={t('common.recruitmentNotice')} />

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
            title={
              hasNoResume ? t('employ.writeAResume') : t('common.apply_c60c86')
            }
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
