import React, {useCallback, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import ErrorModal from '@components/modals/ErrorModal';
import ApplicantItem from '@components/Employ/ApplicantItem';
import ApplicantCard from './ApplicantCard';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import styles from './ApplicantList.styles';

const ApplicantListByRecruit = ({route}) => {
  const {recruit} = route.params;
  const navigation = useNavigation();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    onPress: null,
    onPress2: null,
    buttonText: '',
    buttonText2: '',
  });
  const [applicants, setApplicants] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchApplicants();
    }, []),
  );

  const fetchApplicants = async () => {
    try {
      const response = await hostEmployApi.getApplicantsByRecruit(
        recruit?.recruitId,
      );
      setApplicants(response.data);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        buttonText: '확인',
        title:
          error?.response?.data?.message ??
          '지원자를 불러오는 중 오류가 발생했습니다',
      }));
    } finally {
    }
  };

  const handleViewDetail = recruitId => {
    navigation.navigate('ResumeDetail', {
      id: recruitId,
      role: 'HOST',
      headerTitle: '지원서',
    });
  };

  return (
    <View style={styles.container}>
      <Header title="지원서 조회" />
      <View style={styles.body}>
        <ApplicantItem item={recruit} onPress={handleViewDetail} />
        <View style={styles.applyHeaderBox}>
          <Text style={styles.applyHeaderText}>
            지원서 ({applicants.length})
          </Text>
        </View>
        {applicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 지원자가 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={applicants}
            renderItem={({item}) => (
              <ApplicantCard
                item={item}
                handleApplicantPress={handleViewDetail}
              />
            )}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}

        <ErrorModal
          title={errorModal.title}
          buttonText={errorModal.buttonText}
          buttonText2={errorModal.buttonText2}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
          onPress2={errorModal.onPress2}
          visible={errorModal.visible}
        />
      </View>
    </View>
  );
};

export default ApplicantListByRecruit;
