import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import styles from './MyApplicantList.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import userEmployApi from '@utils/api/userEmployApi';
import ButtonWhite from '@components/ButtonWhite';
import ErrorModal from '@components/modals/ErrorModal';
import Header from '@components/Header';
import EmployEmpty from '@components/Employ/EmployEmpty';

const MyApplicantList = () => {
  const navigation = useNavigation();
  const [applicants, setApplicants] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
    buttonText2: null,
    onPress2: null,
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        tryFetchMyApplicants();
      }, 500);
    }, []),
  );

  const tryFetchMyApplicants = async () => {
    setLoading(true);
    try {
      const response = await userEmployApi.getMyApplications();
      setApplicants(response.data);
    } catch (error) {
      setErrorModal(prev => ({
        ...prev,
        visible: true,
        title: '지원현황 조회 중 오류가 발생했어요',
        buttonText: '확인',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplicant = id => {
    setErrorModal(prev => ({
      ...prev,
      visible: true,
      title: '추후 서비스 예정이에요!',
      buttonText: '확인',
    }));
  };

  const renderApplyItem = ({item}) => (
    <View style={styles.RecruitCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('EmployDetail', {id: item.recruitId})
        }>
        <View style={styles.jobItemContent}>
          <Image
            source={{uri: item.thumbnailImage}}
            style={styles.jobImage}
            resizeMode="cover"
          />
          <View style={styles.jobDetails}>
            <View style={{flex: 1}}>
              {/* 게하 이름+하트 */}
              <View style={[styles.jobHeader, {marginBottom: 4}]}>
                <Text style={styles.jobType}>{item.guesthouseName}</Text>
              </View>
              <View
                style={{
                  justifyContent: 'space-between',
                  flex: 1,
                }}>
                {/* 공고 제목 + 날짜 */}
                <View style={[styles.jobHeader]}>
                  <Text
                    style={styles.jobTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.recruitTitle}
                  </Text>
                </View>

                <View style={styles.jobHeader}>
                  <Text style={styles.jobSmall}>제주도 서귀포시</Text>
                  <Text style={styles.jobSmall}>2주 이상</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ResumeDetail', {id: item.resumeId})
        }>
        <Text style={{...FONTS.fs_14_medium, color: COLORS.grayscale_900}}>
          {item.resumeTitle}
        </Text>
      </TouchableOpacity>
      <ButtonWhite
        title={'지원 취소하기'}
        onPress={() => handleDeleteApplicant(item.id)}
        textColor={COLORS.grayscale_400}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={'지원 현황'} />
      {loading ? (
        <></>
      ) : applicants?.length === 0 ? (
        <EmployEmpty
          title={'지원한 알바가 없어요'}
          subTitle={'마음에 드는 알바를 보러 가볼까요?'}
          buttonText={'알바 찾으러 가기'}
          onPress={() => navigation.navigate('MainTabs', {screen: '채용'})}
        />
      ) : (
        <View style={styles.body}>
          <FlatList
            data={applicants}
            renderItem={renderApplyItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      <ErrorModal
        visible={errorModal.visible}
        buttonText={errorModal.buttonText}
        buttonText2={errorModal.buttonText2}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        onPress2={errorModal.onPress2}
        title={errorModal.title}
      />
    </View>
  );
};

export default MyApplicantList;
