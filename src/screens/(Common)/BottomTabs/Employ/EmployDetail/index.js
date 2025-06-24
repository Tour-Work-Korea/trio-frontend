import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import styles from './EmployDetail.styles';
import Share from '@assets/images/Share.svg';
import Header from '@components/Header';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import userEmployApi from '@utils/api/userEmployApi';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import {
  RecruitProfileSection,
  RecruitTapSection,
  RecruitDescriptionSection,
} from '@components/Employ/EmployDetail';

const EmployDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params;
  const [recruit, setRecruit] = useState();

  useEffect(() => {
    fetchRecruitById();
  }, []);

  const fetchRecruitById = async () => {
    try {
      const response = await userEmployApi.getRecruitById(id);
      setRecruit(response.data);
    } catch (error) {
      Alert.alert('공고 상세 조회에 실패했습니다.');
    }
  };

  const toggleFavorite = async isLiked => {
    toggleLikeRecruit(id, isLiked);
    setRecruit(prev => {
      return {...prev, liked: !isLiked};
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="공고 상세" />
      {recruit == null ? (
        <></>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerButton}>
              <Text style={styles.headerButtonText}>
                {recruit.guesthouseName}
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => toggleFavorite(recruit.liked)}>
                {recruit.liked ? (
                  <FilledHeartIcon width={24} height={24} />
                ) : (
                  <HeartIcon width={24} height={24} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Share width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
          <RecruitProfileSection recruit={recruit} />
          <RecruitTapSection recruit={recruit} />
          <RecruitDescriptionSection description={recruit.recruitDetail} />
        </ScrollView>
      )}

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            navigation.navigate('ApplicantForm', {
              recruitId: recruit?.recruitId,
              recruitTitle: recruit.recruitTitle,
              guesthouseName: recruit.guesthouseName,
              recruitEnd: recruit.recruitEnd,
            });
          }}>
          <Text style={styles.applyButtonText}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmployDetail;
