import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import userEmployApi from '@utils/api/userEmployApi';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import EmployEmpty from '@components/Employ/EmployEmpty';
import ResultModal from '@components/modals/ResultModal';
import useUserStore from '@stores/userStore';

import styles from './MyResumeList.styles';
import {COLORS} from '@constants/colors';
import EditIcon from '@assets/images/edit_gray';
import TrashIcon from '@assets/images/delete_gray.svg';
import DeleteWaLogo from '@assets/images/delete_wa.svg';
import PlusIcon from '@assets/images/plus_white.svg';
import {FONTS} from '@constants/fonts';

const MyResumeList = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const [resumes, setResumes] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
    buttonText2: null,
    onPress2: null,
  });
  const [loading, setLoading] = useState(true);
  const [deleteCompleted, setDeleteCompleted] = useState(false);
  const noResumeState = userProfile?.mbti === 'DEFAULT'; //true이면 정보 부족, false이면 이력서 없음

  useFocusEffect(
    useCallback(() => {
      tryFetchMyResumes();
    }, []),
  );

  const tryFetchMyResumes = async () => {
    setLoading(true);
    try {
      const response = await userEmployApi.getResumes();
      setResumes(response.data);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        title: t('myPage.couldnTLoadYourResume'),
        buttonText: t('common.confirm'),
      }));
    } finally {
      setLoading(false);
    }
  };

  const tryDeleteResumeById = async id => {
    try {
      await userEmployApi.deleteResume(id);
      setDeleteCompleted(true);
      setTimeout(() => {
        navigation.replace('MyResumeList');
      }, 3000);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        title:
          error?.response?.data?.message ??
          t('myPage.anErrorOccurredWhileDeleting'),
        buttonText: t('common.confirm'),
      }));
    }
  };

  const handleDeletePosting = id => {
    setErrorModal({
      visible: true,
      title: t('myPage.deletedResumesCanTBeRestoredDoYouWantTo'),
      buttonText: t('myPage.putOnHold'),
      buttonText2: t('myPage.delete'),
      onPress2: () => {
        tryDeleteResumeById(id);
        setErrorModal(prev => ({...prev, visible: false}));
      },
    });
  };

  const handleAddResume = () => {
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

  const renderAddResumeButton = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.addButton, styles.addButtonLocation]}
      onPress={handleAddResume}>
      <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
        {t('myPage.addResume')}
      </Text>
      <PlusIcon width={24} height={24} />
    </TouchableOpacity>
  );

  const renderResumeSelection = () => (
    <ScrollView contentContainerStyle={styles.section}>
      {resumes?.map(item => (
        <TouchableOpacity
          activeOpacity={1}
          key={item.resumeId}
          style={styles.resumeItem}
          onPress={() => {
            navigation.navigate('ResumeDetail', {
              id: item.resumeId,
              headerTitle: t('common.myResume'),
            });
          }}>
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
              <View style={styles.editContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('ResumeDetail', {
                      id: item.resumeId,
                      isEditable: true,
                      headerTitle: t('employ.editYourResume'),
                    })
                  }>
                  <EditIcon
                    width={24}
                    height={24}
                    color={COLORS.grayscale_400}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.editButton}
                  onPress={() => handleDeletePosting(item.resumeId)}>
                  <TrashIcon
                    width={24}
                    height={24}
                    color={COLORS.grayscale_400}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header title={t('common.myResume')} />

      {loading ? (
        <></>
      ) : resumes?.length === 0 ? (
        <View style={styles.body}>
          {noResumeState ? (
            <EmployEmpty
              title={t('common.thereIsStillNotEnoughInformation')}
              subTitle={t('common.shallWeGoCompleteOurResume')}
              buttonText={t('myPage.goToWritingResume')}
              onPress={handleAddResume}
            />
          ) : (
            <EmployEmpty
              title={t('common.thereIsNoResumeWritten')}
              buttonText={t('myPage.goToWritingResume')}
              onPress={handleAddResume}
            />
          )}
          {renderAddResumeButton()}
        </View>
      ) : (
        <View style={styles.body}>
          {renderResumeSelection()}
          {renderAddResumeButton()}
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

      <ResultModal
        visible={deleteCompleted}
        onClose={() => {
          setDeleteCompleted(false);
        }}
        title={t('myPage.resumeDeletionHasBeenCompleted')}
        Icon={DeleteWaLogo}
      />
    </View>
  );
};

export default MyResumeList;
