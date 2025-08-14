import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import ButtonScarlet from '@components/ButtonScarlet';
import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import styles from './MyRecruitmentList.styles';
import ErrorModal from '@components/modals/ErrorModal';
import ResultModal from '@components/modals/ResultModal';
import LogoBlueSmile from '@assets/images/logo_blue_smile.svg';
import PlusIcon from '@assets/images/plus_white.svg';
import {FONTS} from '@constants/fonts';

const MyRecruitmentList = () => {
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
  const [selectedRecruitId, setSelectedRecruitId] = useState(null);
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
      Alert.alert('내 공고 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = recruitId => {
    navigation.navigate('MyRecruitmentDetail', recruitId);
  };

  const handleDeletePosting = id => {
    setSelectedRecruitId(id);
    setErrorModal({
      visible: true,
      title: '마감 요청은 되돌릴 수 없는 작업이에요\n계속 진행하시겠어요?',
      onPress2: confirmDelete,
      onPress: () => setErrorModal(prev => ({...prev, visible: false})),
      buttonText2: '요청할래요',
      buttonText: '보류할게요',
    });
  };

  const confirmDelete = () => {
    setErrorModal(prev => ({...prev, visible: false}));
    fetchDeleteRecruit();
  };
  const fetchDeleteRecruit = async () => {
    try {
      await hostEmployApi.requestDeleteRecruit(selectedRecruitId, '마감요청');
      setResultModalVisible(true);
    } catch (error) {
      setResultModalVisible(true);
      setErrorModal({
        visible: true,
        title: '마감요청 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    }
  };
  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.recruitId)}>
      <View style={styles.postingCard}>
        <Text style={[styles.guestHouseText]}>{item.guesthouseName}</Text>

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {item.recruitTitle}
          </Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => handleDeletePosting(item.recruitId)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.deleteButton}>마감요청</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="나의 공고" />
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
              renderItem={renderPostingItem}
              keyExtractor={item => item.recruitId.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonLocation]}
          onPress={() => navigation.navigate('RecruitmentForm')}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
            알바공고 등록하기
          </Text>
          <PlusIcon width={24} height={24} />
        </TouchableOpacity>

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

export default MyRecruitmentList;
