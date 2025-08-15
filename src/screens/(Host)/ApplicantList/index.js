import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import styles from './ApplicantList.styles';
import ErrorModal from '@components/modals/ErrorModal';
import ResultModal from '@components/modals/ResultModal';
import LogoBlueSmile from '@assets/images/logo_blue_smile.svg';
import ApplicantItem from '@components/Employ/ApplicantItem';

const ApplicantList = () => {
  const navigation = useNavigation();
  const [myRecruits, setMyRecruits] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    onPress: null,
    onPress2: null,
    buttonText: '',
    buttonText2: '',
  });
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getMyRecruits();
    }, []),
  );

  const getMyRecruits = async () => {
    setLoading(true);
    try {
      const response = await hostEmployApi.getMyRecruits();
      setMyRecruits(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '나의 공고 조회 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = recruit => {
    navigation.navigate('ApplicantListByRecruit', {recruit});
  };

  return (
    <View style={styles.container}>
      <Header title="지원서 조회" />
      <View style={styles.body}>
        {loading ? (
          <></>
        ) : myRecruits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ApplyLogo width={187} />
            <View style={styles.textContainer}>
              <Text style={styles.emptyTitle}>등록한 알바 공고가 없어요</Text>
              <Text style={styles.emptySubTitle}>
                지금 바로 공고를 등록 해보세요!
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <FlatList
              data={myRecruits}
              renderItem={({item}) => (
                <ApplicantItem item={item} onPress={handleViewDetail} />
              )}
              keyExtractor={item => item.recruitId.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        <ErrorModal
          title={errorModal.title}
          buttonText={errorModal.buttonText}
          buttonText2={errorModal.buttonText2}
          onPress={errorModal.onPress}
          onPress2={errorModal.onPress2}
          visible={errorModal.visible}
        />
      </View>
      <ResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
        }}
        title={'마감요청이 되었어요!'}
        Icon={LogoBlueSmile}
      />
    </View>
  );
};

export default ApplicantList;
