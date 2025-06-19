import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import styles from './MyRecruitmentDetail.styles';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';

import RecruitProfileSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitProfileSection';
import RecruitTapSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitTapSection';
import RecruitDescriptionSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitDescriptionSection';

const MyRecruitmentDetail = () => {
  const route = useRoute();
  const recruitId = route.params ?? null;
  const [recruit, setRecruit] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRecruitDetail = async () => {
      try {
        const response = await hostEmployApi.getRecruitDetail(recruitId);
        setRecruit(response.data);
      } catch (error) {
        Alert('공고 상세 조회에 실패했습니다.');
      }
    };
    fetchRecruitDetail();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="공고상세" />
      {recruit == null ? (
        <></>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.headerButton}>
                <Text style={styles.headerButtonText}>
                  {recruit.guesthouseName}
                </Text>
              </View>
            </View>
            <RecruitProfileSection recruit={recruit} />
            <RecruitTapSection recruit={recruit} />
            <RecruitDescriptionSection description={recruit.recruitDetail} />
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('PostRecruitment', recruit)}>
              <Text style={styles.secondaryButtonText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => navigation.navigate('ApplicantList', recruitId)}>
              <Text style={styles.applyButtonText}>지원자 보기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default MyRecruitmentDetail;
