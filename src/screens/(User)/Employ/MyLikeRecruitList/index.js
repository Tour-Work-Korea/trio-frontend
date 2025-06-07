import React, {useEffect, useState} from 'react';
import {SafeAreaView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './MyLikeRecruitList.styles';
import {RecruitList} from '@components/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';

export default function MyLikeRecruitList() {
  const navigation = useNavigation();
  const [recruitList, setRecruitList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecruitList();
  }, []);

  //좋아요한 채용 공고 조회
  const fetchRecruitList = async () => {
    setLoading(true);
    try {
      const res = await userEmployApi.getLikeRecruits(); // ← 페이지 기반 API 호출
      setRecruitList(res.data);
    } catch (error) {
      Alert.alert('채용 공고 불러오기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});
  const handleApplyPress = recruit =>
    navigation.navigate('Applicant', {
      recruitId: recruit?.recruitId,
      recruitTitle: recruit.recruitTitle,
      guesthouseName: recruit.guesthouseName,
      recruitEnd: recruit.recruitEnd,
    });

  return (
    <SafeAreaView style={styles.container}>
      <Header title={'즐겨찾기한 공고'} />
      <RecruitList
        data={recruitList}
        loading={loading}
        onJobPress={handleJobPress}
        onApplyPress={handleApplyPress}
        onToggleFavorite={toggleLikeRecruit}
        setRecruitList={setRecruitList}
      />
    </SafeAreaView>
  );
}
