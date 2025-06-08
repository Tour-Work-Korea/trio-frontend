import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {View, Text, ScrollView, SafeAreaView, Alert} from 'react-native';
import styles from './RecruitmentDetail.styles';
import Header from '@components/Header';
import hostEmployApi from '@utils/api/hostEmployApi';
import RecruitProfileSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitProfileSection';
import RecruitTapSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitTapSection';
import RecruitDescriptionSection from '../../../(Common)/BottomTabs/Employ/EmployDetail/components/RecruitDescriptionSection';

const RecruitmentDetail = () => {
  const route = useRoute();
  const recruitId = route.params?.recruitId;
  const id = recruitId;
  const [recruit, setRecruit] = useState();

  useEffect(() => {
    const fetchRecruitDetail = async () => {
      try {
        const response = await hostEmployApi.getRecruitDetail(id);
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
        <ScrollView style={styles.scrollView}>
          {/* 헤더 */}
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
      )}
    </SafeAreaView>
  );
};

export default RecruitmentDetail;
