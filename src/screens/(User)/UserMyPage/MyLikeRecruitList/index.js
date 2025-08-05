import React, {useState, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import userEmployApi from '@utils/api/userEmployApi';
import ErrorModal from '@components/modals/ErrorModal';
import {COLORS} from '@constants/colors';
import Header from '@components/Header';
import EmployEmpty from '@components/Employ/EmployEmpty';

export default function MyLikeRecruitList() {
  const navigation = useNavigation();
  const [recruits, setRecruits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
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
      setErrorModal({
        visible: true,
        title: '즐겨찾기한 공고를 불러오는 중 오류가 발생했습니다',
        buttonText: '확인',
      });
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
  const handleLikePress = ({id, isLiked, setRecruitList}) => {
    toggleLikeRecruit({
      id,
      isLiked,
      setRecruitList,
      showErrorModal: setErrorModal,
    });

    setTimeout(() => {
      navigation.replace('MyLikeRecruitList');
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Header title={'즐겨찾는 공고'} />
      <View style={styles.contentContainer}>
        {loading ? (
          <></>
        ) : recruits?.length === 0 ? (
          <EmployEmpty
            title={'아직 즐겨찾는 알바가 없어요'}
            subTitle={'마음에 드는 알바를 빠르게 볼 수 있어요 !'}
            buttonText={'알바 찾으러 가기'}
            onPress={() => navigation.navigate('MainTabs', {screen: '채용'})}
          />
        ) : (
          <RecruitList
            data={recruits}
            loading={loading}
            onJobPress={handleJobPress}
            onApplyPress={handleApplyPress}
            onToggleFavorite={handleLikePress}
            setRecruitList={setRecruits}
            onEndReached={() => {}}
            scrollEnabled={false}
            showErrorModal={setErrorModal}
          />
        )}
      </View>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_100,
  },
  contentContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 24,
    flex: 1,
  },
});
