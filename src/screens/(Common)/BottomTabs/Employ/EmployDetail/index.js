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
import {
  employDetailDeeplink,
  copyDeeplinkToClipboard,
} from '@utils/deeplinkGenerator';

import Share from '@assets/images/Share.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';

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
    <ScrollView style={styles.container}>
      <View style={styles.scrollView}>
        <RecruitHeaderSection
          tags={recruit.hashtags}
          guesthouseName={recruit.guesthouseName}
        />
        <RecruitProfileSection recruit={recruit} />
        <RecruitTapSection recruit={recruit} />
        <RecruitDescriptionSection description={recruit.recruitDetail} />
      </View>

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
    </ScrollView>
  );
};

export default EmployDetail;
