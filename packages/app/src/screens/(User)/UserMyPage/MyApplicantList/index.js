import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import userEmployApi from '@utils/api/userEmployApi';
// import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import EmployEmpty from '@components/Employ/EmployEmpty';
// import ResultModal from '@components/modals/ResultModal';
import {formatLocalDateToDot} from '@utils/formatDate';

import styles from './MyApplicantList.styles';
import AppImage from '@components/AppImage';
// import DeleteWaLogo from '@assets/images/delete_wa.svg';

const MyApplicantList = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [applicants, setApplicants] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
    buttonText2: null,
    onPress2: null,
  });
  const [loading, setLoading] = useState(true);
  // const [deleteCompleted, setDeleteCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      tryFetchMyApplicants();
    }, []),
  );

  const tryFetchMyApplicants = async () => {
    setLoading(true);
    try {
      const response = await userEmployApi.getMyApplications();
      setApplicants(response.data);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        title:
          error?.response?.data?.message ||
          t('myPage.anErrorOccurredWhileCheckingApplicationStatus'),

        buttonText: t('common.confirm'),
      }));
    } finally {
      setLoading(false);
    }
  };

  // const tryDeleteApplicantById = async id => {
  //   try {
  //     await userEmployApi.deleteApply(id);
  //     setDeleteCompleted(true);
  //     setTimeout(() => {
  //       navigation.replace('MyApplicantList');
  //     }, 3000);
  //   } catch (error) {
  //     setErrorModal(prev => ({
  //       ...prev,
  //       visible: true,
  //       title: '삭제 중 오류가 발생했어요',
  //       buttonText: '확인',
  //     }));
  //   }
  // };

  // const handleDeleteApplicant = async id => {
  //   setErrorModal({
  //     visible: true,
  //     title:
  //       '지원 취소한 알바는\n다시 지원하기 어려워요\n알바 지원을 취소하시겠습니까?',
  //     buttonText: '닫기',
  //     buttonText2: '지원 취소',
  //     onPress2: () => {
  //       tryDeleteApplicantById(id);
  //       setErrorModal(prev => ({...prev, visible: false}));
  //     },
  //   });
  // };

  const renderApplyItem = ({item}) => (
    <View>
      <View style={styles.RecruitCard}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('EmployDetail', {id: item.recruitId})
          }>
          <View style={styles.jobItemContent}>
            <AppImage
              uri={item.recruitImage}
              style={styles.jobImage}
              resizeMode="cover"
            />

            <View style={styles.jobDetails}>
              <View style={{flex: 1}}>
                {/* 게하 이름+하트 */}
                <View style={[styles.jobHeader, styles.guestHouseHeader]}>
                  <Text style={styles.jobType}>{item.guesthouseName}</Text>
                </View>
                <View style={styles.titleHeader}>
                  {/* 공고 제목 + 날짜 */}
                  <View style={[styles.jobHeader]}>
                    <Text
                      style={styles.jobTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.recruitTitle}
                    </Text>
                  </View>

                  <View style={styles.jobHeader}>
                    <Text style={styles.jobSmall}>{item.recruitAddress}</Text>
                    <Text style={styles.jobSmall}>{item.workPeriod}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('ResumeDetail', {
              id: item.resumeId,
              headerTitle: t('common.myResume'),
            })
          }>
          <Text style={styles.titleText}>{item.resumeTitle}</Text>
          <View style={styles.applyContainer}>
            <Text style={styles.applyText}>{t('myPage.applicationDate')}</Text>
            <Text style={styles.applyText}>
              {formatLocalDateToDot(item.applyDate)}
            </Text>
          </View>
        </TouchableOpacity>
        {/* <ButtonWhite
         title={'지원 취소하기'}
         onPress={() => handleDeleteApplicant(item.id)}
        /> */}
      </View>
      <View style={styles.divider} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={t('common.supportStatus')} />
      {loading ? (
        <></>
      ) : applicants?.length === 0 ? (
        <EmployEmpty
          title={t('myPage.thereAreNoPartTimeJobsIAppliedFor')}
          subTitle={t('myPage.shallWeGoSeeThePartTimeJobWeLike')}
          buttonText={t('myPage.goFindAPartTimeJob')}
          onPress={() => navigation.navigate('MainTabs', {screen: '채용'})}
        />
      ) : (
        <View style={styles.body}>
          <FlatList
            data={applicants}
            renderItem={renderApplyItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      <AlertModal
        visible={errorModal.visible}
        buttonText={errorModal.buttonText}
        buttonText2={errorModal.buttonText2}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        onPress2={errorModal.onPress2}
        title={errorModal.title}
      />

      {/* <ResultModal
         visible={deleteCompleted}
         onClose={() => {
           setDeleteCompleted(false);
         }}
         title="알바 지원을 취소했어요"
         Icon={DeleteWaLogo}
        /> */}
    </View>
  );
};

export default MyApplicantList;
