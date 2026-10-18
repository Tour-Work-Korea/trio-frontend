import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, ScrollView} from 'react-native';

import styles from './EmployDetail.styles';
import userEmployApi from '@utils/api/userEmployApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import RecruitDescriptionSection from './RecruitDescriptionSection';
import RecruitHeaderSection from './RecruitHeaderSection';
import RecruitProfileSection from './RecruitProfileSection';
import RecruitTapSection from './RecruitTapSection';
import Loading from '@components/Loading';
import ButtonScarlet from '@components/ButtonScarlet';
import useUserStore from '@stores/userStore';
import AlertModal from '@components/modals/AlertModal';
import hostEmployApi from '@utils/api/hostEmployApi';
import {showErrorModal} from '@utils/loginModalHub';

const EmployDetail = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;
  const {id, fromHost = false} = route.params ?? {};
  const [recruit, setRecruit] = useState({});
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const tryFetchRecruitById = useCallback(async () => {
    try {
      let response;
      if (fromHost) {
        response = await hostEmployApi.getRecruitDetail(id);
      } else {
        response = await userEmployApi.getRecruitById(id, userRole === 'USER');
      }
      setRecruit(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: t('employ.failedToCheckAnnouncementDetails'),
        buttonText: t('common.confirm'),
      });
    }
  }, [fromHost, id, userRole, t]);

  useEffect(() => {
    tryFetchRecruitById();
  }, [tryFetchRecruitById]);

  const handleFavorite = async isLiked => {
    toggleFavorite({
      type: 'recruit',
      id,
      isLiked,
      setItem: setRecruit,
    });
  };

  if (!recruit) {
    return <Loading title={t('employ.loadingJobPostings')} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 해시태그) */}
        <RecruitHeaderSection
          tags={recruit?.hashtags}
          guesthouseName={recruit?.guesthouseName}
          recruitImages={recruit?.recruitImages}
        />

        <View style={styles.contentContainer}>
          {/* 상단 기본 정보(공고 제목, 위치, 요약) */}
          <RecruitProfileSection
            recruit={recruit}
            toggleFavorite={handleFavorite}
          />

          <View style={styles.devide} />
          {/* 탭 */}
          <RecruitTapSection recruit={recruit} />
          <View style={styles.devide} />
          <RecruitDescriptionSection description={recruit?.recruitDetail} />
        </View>
        {/* 하단 버튼 */}
        {!fromHost && (
          <View style={styles.bottomButtonContainer}>
            <ButtonScarlet
              onPress={() => {
                if (userRole !== 'USER') {
                  showErrorModal({
                    message: t('common.toApplyPleaseLogInToPartTimeJob'),
                    buttonText2: t('common.cancel'),
                    buttonText: t('common.logIn'),
                    onPress: () => {
                      navigation.navigate('Login');
                    },
                    onPress2: () => {},
                  });
                } else {
                  navigation.navigate('ApplicantInfo', {
                    recruitId: recruit?.recruitId,
                    recruitTitle: recruit?.recruitTitle,
                    guesthouseName: recruit?.guesthouseName,
                    recruitEnd: recruit?.recruitEnd,
                    entryStartDate: recruit?.entryStartDate,
                    entryEndDate: recruit?.entryEndDate,
                  });
                }
              }}
              title={t('common.apply_c60c86')}
            />
          </View>
        )}
      </ScrollView>
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmployDetail;
