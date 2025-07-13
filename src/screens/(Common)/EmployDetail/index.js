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
import userEmployApi from '@utils/api/userEmployApi';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import {
  RecruitProfileSection,
  RecruitTapSection,
  RecruitDescriptionSection,
  RecruitHeaderSection,
} from '@components/Employ/EmployDetail';
import Loading from '@components/Loading';
import ButtonScarlet from '@components/ButtonScarlet';

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
    toggleLikeRecruit(id, isLiked, setRecruit);
  };

  if (!recruit) {
    return <Loading title="채용 공고를 불러오고 있어요" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 해시태그) */}
        <RecruitHeaderSection
          tags={recruit?.hashtags}
          guesthouseName={recruit?.guesthouseName}
        />
        <View style={{paddingHorizontal: 20}}>
          {/* 상단 기본 정보(공고 제목, 위치, 요약) */}
          <RecruitProfileSection
            recruit={recruit}
            toggleFavorite={toggleFavorite}
          />
          <View style={styles.devide} />
          {/* 탭 */}
          <RecruitTapSection recruit={recruit} />
          <View style={styles.devide} />
          <RecruitDescriptionSection description={recruit?.recruitDetail} />
        </View>
        {/* 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <ButtonScarlet
            onPress={() => {
              navigation.navigate('ApplicantForm', {
                recruitId: recruit?.recruitId,
                recruitTitle: recruit?.recruitTitle,
                guesthouseName: recruit?.guesthouseName,
                recruitEnd: recruit?.recruitEnd,
              });
            }}
            title="지원하기"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EmployDetail;
