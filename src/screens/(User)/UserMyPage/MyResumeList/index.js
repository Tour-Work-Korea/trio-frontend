import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import userEmployApi from '@utils/api/userEmployApi';
import ErrorModal from '@components/modals/ErrorModal';
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
  const noResumeState =
    userProfile?.mbti === 'DEFAULT' ||
    userProfile?.instagramId === 'ID를 추가해주세요'; //true이면 정보 부족, false이면 이력서 없음

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
        title: '이력서를 불러오는 중 오류가 발생했어요',
        buttonText: '확인',
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
        title: error?.response?.data?.message ?? '삭제 중 오류가 발생했어요',
        buttonText: '확인',
      }));
    }
  };

  const handleDeletePosting = id => {
    setErrorModal({
      visible: true,
      title: '삭제한 이력서는 복구할 수 없어요\n삭제를 진행하시겠어요?',
      buttonText: '보류하기',
      buttonText2: '삭제하기',
      onPress2: () => {
        tryDeleteResumeById(id);
        setErrorModal(prev => ({...prev, visible: false}));
      },
    });
  };

  const renderResumeSelection = () => (
    <ScrollView contentContainerStyle={styles.section}>
      {resumes?.map(item => (
        <TouchableOpacity
          key={item.resumeId}
          style={styles.resumeItem}
          onPress={() => {
            navigation.navigate('ResumeDetail', {
              id: item.resumeId,
              headerTitle: '나의 이력서',
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
                <Text style={styles.lastModifiedText}>최종수정일</Text>
                <Text style={styles.lastModifiedText}>
                  {item.updatedAt.split('T')[0]}
                </Text>
              </View>
              <View style={styles.editContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('ResumeDetail', {
                      id: item.resumeId,
                      isEditable: true,
                      headerTitle: '이력서 수정',
                    })
                  }>
                  <EditIcon
                    width={24}
                    height={24}
                    color={COLORS.grayscale_400}
                  />
                </TouchableOpacity>
                <TouchableOpacity
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
      <Header title={'나의 이력서'} />

      {loading ? (
        <></>
      ) : resumes?.length === 0 ? (
        noResumeState ? (
          <EmployEmpty
            title={'아직 정보가 부족해요'}
            subTitle={'이력서를 완성하러 가볼까요?'}
            buttonText={'이력서 작성하러 가기'}
            onPress={() => {
              navigation.navigate('ProfileUpdate');
            }}
          />
        ) : (
          <EmployEmpty
            title={'작성하신 이력서가 없습니다'}
            buttonText={'이력서 작성하러 가기'}
            onPress={() => {
              navigation.navigate('ResumeDetail', {
                isEditable: true,
                role: 'USER',
                isNew: true,
                headerTitle: '이력서 작성',
              });
            }}
          />
        )
      ) : (
        <View style={styles.body}>
          {renderResumeSelection()}
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonLocation]}
            onPress={() =>
              navigation.navigate('ResumeDetail', {
                isEditable: true,
                role: 'USER',
                isNew: true,
                headerTitle: '이력서 작성',
              })
            }>
            <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
              이력서 추가하기
            </Text>
            <PlusIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      )}
      <ErrorModal
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
        title="이력서 삭제가 완료되었어요"
        Icon={DeleteWaLogo}
      />
    </View>
  );
};

export default MyResumeList;
