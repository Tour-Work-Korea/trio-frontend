import React, {useEffect, useState, useCallback} from 'react';
import {SafeAreaView, Alert} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import styles from './MyLikeRecruitList.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';
import ErrorModal from '@components/modals/ErrorModal';

export default function MyLikeRecruitList() {
  const navigation = useNavigation();
  const [recruits, setRecruits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  useFocusEffect(
    useCallback(() => {
      fetchRecruitList();
    }, []),
  );
  //좋아요한 채용 공고 조회
  const fetchRecruitList = async () => {
    setLoading(true);
    try {
      const res = await userEmployApi.getLikeRecruits();
      setRecruits(res.data);
    } catch (error) {
      Alert.alert('채용 공고 불러오기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});
  const handleApplyPress = recruit =>
    navigation.navigate('ApplicantForm', {
      recruitId: recruit?.recruitId,
      recruitTitle: recruit.recruitTitle,
      guesthouseName: recruit.guesthouseName,
      recruitEnd: recruit.recruitEnd,
    });
  const handleLikePress = (recruitId, isLiked, setRecruitList) => {
    toggleLikeRecruit({
      id: recruitId,
      isLiked,
      setRecruitList,
      showErrorModal: setErrorModal,
    });
    setTimeout(() => {
      navigation.replace('MyLikeRecruitList'); // 또는 현재 라우트명
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'즐겨찾기한 공고'} />
      <RecruitList
        data={recruits}
        loading={loading}
        onJobPress={handleJobPress}
        onApplyPress={handleApplyPress}
        onToggleFavorite={handleLikePress}
        setRecruitList={setRecruits}
      />
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </SafeAreaView>
  );
}
