import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import userEmployApi from '@utils/api/userEmployApi';
import ButtonScarlet from '@components/ButtonScarlet';

import styles from './MyResumeList.styles';
import {COLORS} from '@constants/colors';
import Chevron_left_black from '@assets/images/chevron_left_black.svg';
import EditIcon from '@assets/images/edit_gray';
import TrashIcon from '@assets/images/delete_gray.svg';
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';
/*
 * 나의 이력서 목록 페이지
 */
const MyResumeList = () => {
  const navigation = useNavigation();
  const [resumes, setResumes] = useState();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
    buttonText2: null,
    onPress2: null,
  });

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        tryFetchMyResumes();
      }, 500);
    }, []),
  );

  const tryFetchMyResumes = async () => {
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
    }
  };

  const tryDeleteResumeById = async id => {
    try {
      await userEmployApi.deleteResume(id);
      setTimeout(() => {
        navigation.replace('MyResumeList');
      }, 500);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        title: '삭제 중 오류가 발생했어요',
        buttonText: '확인',
      }));
    }
  };

  const handleDeletePosting = id => {
    setErrorModal({
      visible: true,
      title: '정말 삭제하시겠어요?',
      buttonText: '취소',
      buttonText2: '삭제',
      onPress2: () => {
        tryDeleteResumeById(id);
      },
    });
  };

  // 이력서 리스트 렌더링
  const renderResumeSelection = () => (
    <View style={styles.section}>
      {resumes?.map(item => (
        <TouchableOpacity
          key={item.resumeId}
          style={styles.resumeItem}
          onPress={() => {
            navigation.navigate('MyResumeDetail', {
              id: item.resumeId,
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
              <View style={{flexDirection: 'row', gap: 8}}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate('MyResumeDetail', {
                      id: item.resumeId,
                      isEditable: true,
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'나의 이력서'} />
      <View style={styles.body}>
        {renderResumeSelection()}
        <ButtonScarlet title="이력서 작성하기" to="ResumeForm" />
      </View>
      <ErrorModal
        visible={errorModal.visible}
        buttonText={errorModal.buttonText}
        buttonText2={errorModal.buttonText2}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        onPress2={errorModal.onPress2}
        title={errorModal.title}
      />
    </SafeAreaView>
  );
};

export default MyResumeList;
