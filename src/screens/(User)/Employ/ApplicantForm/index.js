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
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';

import EditIcon from '@assets/images/edit_gray.svg';
import CheckedCircleIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedCircleIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import {COLORS} from '@constants/colors';
import styles from './ApplicantForm.styles';

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
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const allRequired = agreements
      .filter(item => item.isRequired)
      .every(item => item.isAgree);
    setApplicant(prev => ({...prev, personalInfoConsent: allRequired}));
  }, [agreements]);

  useFocusEffect(
    useCallback(() => {
      tryFetchResumeList();
    }, [navigation]),
  );

  const tryFetchResumeList = async () => {
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
  };

  const handleEditResume = id => {
    navigation.navigate('ResumeDetail', {
      id,
      isEditable: true,
      headerTitle: '이력서 수정',
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
    try {
      const parsedData = {
        message: '열심히 하겠습니다.',
        startDate: '2026-01-01',
        endDate: '2026-12-25',
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>지원할 이력서를 선택해주세요</Text>
      <View style={styles.body}>
        {resumes?.map(item => (
          <TouchableOpacity
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
                  color={COLORS.scarlet}
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
              <TouchableOpacity onPress={() => handleAgreeDetail(item.id)}>
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
          }}>
          {renderResumeSelection()}
        </ScrollView>

        {/* 하단 고정 영역 */}
        <View
          style={styles.bottomButtonContainer}
          onLayout={e => setFooterHeight(e.nativeEvent.layout.height)}>
          {renderPrivacyAgreement()}
          <ButtonScarlet
            title="지원하기"
            onPress={handleSubmit}
            disabled={!applicant.personalInfoConsent || !applicant.resumeId}
          />
        </View>
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
