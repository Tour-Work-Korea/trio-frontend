import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import AlertModal from '@components/modals/AlertModal';
import ResultModal from '@components/modals/ResultModal';
import ApplicantItem from '@components/Employ/ApplicantItem';
import PrevRecruitModal from '@components/modals/Employ/PrevRecruitModal';

import ApplyLogo from '@assets/images/wa_blue_apply.svg';
import styles from './MyRecruitmentList.styles';
import BlueSmileLogo from '@assets/images/logo_blue_smile.svg';
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
  const [prevRecruitModalVisible, setPrevRecruitModalVisible] = useState(false);
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
    navigation.navigate('EmployDetail', {
      id: recruit?.recruitId,
      fromHost: true,
    });
  };

  const handleDeletePosting = id => {
    setErrorModal({
      visible: true,
      title: '마감 요청은 되돌릴 수 없는 작업이에요\n계속 진행하시겠어요?',
      onPress: () => confirmDelete(id),
      onPress2: () => setErrorModal(prev => ({...prev, visible: false})),
      buttonText: '요청할래요',
      buttonText2: '보류할게요',
    });
  };

  const confirmDelete = id => {
    setErrorModal(prev => ({...prev, visible: false}));
    fetchDeleteRecruit(id);
  };
  const fetchDeleteRecruit = async id => {
    try {
      await hostEmployApi.requestDeleteRecruit(id, '마감요청');
      setResultModalVisible(true);
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ?? '마감요청 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    }
  };

  const handleClickNewRecruit = () => {
    setErrorModal({
      visible: true,
      title:
        '이전에 작성한 공고를 불러와 등록하시겠어요,\n아니면 새로 작성하시겠어요?',
      onPress: () => {
        setPrevRecruitModalVisible(true);
        setErrorModal(prev => ({...prev, visible: false}));
      },
      onPress2: () => {
        navigation.navigate('RecruitmentForm');
        setErrorModal(prev => ({...prev, visible: false}));
      },
      buttonText: '공고 불러오기',
      buttonText2: '새로 작성하기',
    });
  };

  const handlePickPrevRecruit = id => {
    navigation.navigate('RecruitmentForm', {
      recruitId: id,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="나의 공고"
        onPress={() => navigation.navigate('MainTabs', {screen: '마이'})}
      />
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
                <ApplicantItem
                  item={item}
                  onPress={handleViewDetail}
                  isRemovable={true}
                  handleDeletePosting={() =>
                    handleDeletePosting(item.recruitId)
                  }
                />
              )}
              keyExtractor={item => item.recruitId.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonLocation]}
          onPress={handleClickNewRecruit}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
            알바공고 등록하기
          </Text>
          <PlusIcon width={24} height={24} />
        </TouchableOpacity>

        <AlertModal
          title={errorModal.title ?? null}
          message={errorModal.message ?? null}
          buttonText={errorModal.buttonText}
          buttonText2={errorModal.buttonText2}
          onPress={errorModal.onPress}
          onPress2={errorModal.onPress2}
          visible={errorModal.visible}
        />
        <PrevRecruitModal
          visible={prevRecruitModalVisible}
          items={myRecruits}
          onClose={() => setPrevRecruitModalVisible(false)}
          onPick={handlePickPrevRecruit}
        />
      </View>
      <ResultModal
        visible={resultModalVisible}
        onClose={() => {
          setResultModalVisible(false);
        }}
        title={'마감요청이 되었어요!'}
        Icon={BlueSmileLogo}
      />
    </View>
  );
};

export default MyRecruitmentList;
