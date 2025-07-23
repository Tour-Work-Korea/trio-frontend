import React, {useState, useCallback} from 'react';
import {
  SafeAreaView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';
import ErrorModal from '@components/modals/ErrorModal';
import {COLORS} from '@constants/colors';
import Chevron_left_black from '@assets/images/chevron_left_black.svg';
import {FONTS} from '@constants/fonts';

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
      <View style={[styles.headerBox]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Chevron_left_black width={28.8} height={28.8} />
        </TouchableOpacity>

        <Text style={styles.headerText}>즐겨찾는 공고</Text>
        <View style={{width: 28.8}}></View>
      </View>
      <View style={styles.contentContainer}>
        <RecruitList
          data={recruits}
          loading={loading}
          onJobPress={handleJobPress}
          onApplyPress={handleApplyPress}
          onToggleFavorite={handleLikePress}
          setRecruitList={setRecruits}
        />
      </View>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_100,
  },
  headerBox: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
  contentContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingVertical: 30,
    flex: 1,
  },
});
