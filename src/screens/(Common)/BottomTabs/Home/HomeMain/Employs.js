import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './Home.styles';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import {useNavigation} from '@react-navigation/native';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import {RecruitList} from '@components/Employ/RecruitList';
import ErrorModal from '@components/modals/ErrorModal';

export default function Employs({jobs, setEmployList}) {
  const navigation = useNavigation();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  return (
    <View style={styles.jobContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>추천 일자리</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => {
            navigation.navigate('MainTabs', {screen: '채용'});
          }}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>
      <RecruitList
        data={jobs}
        onEndReached={() => {}}
        onJobPress={moveToDetail}
        onToggleFavorite={toggleLikeRecruit}
        setRecruitList={setEmployList}
        scrollEnabled={false}
        showErrorModal={setErrorModal}
      />
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
}
