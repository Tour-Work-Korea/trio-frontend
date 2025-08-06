import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {View, ScrollView, Alert} from 'react-native';
import styles from './MyRecruitmentDetail.styles';
import {
  RecruitProfileSection,
  RecruitTapSection,
  RecruitDescriptionSection,
  RecruitHeaderSection,
} from '@components/Employ/EmployDetail';
import hostEmployApi from '@utils/api/hostEmployApi';
import ErrorModal from '@components/modals/ErrorModal';
import Loading from '@components/Loading';

const MyRecruitmentDetail = () => {
  const route = useRoute();
  const recruitId = route.params ?? null;
  const [recruit, setRecruit] = useState();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  useEffect(() => {
    const fetchRecruitDetail = async () => {
      try {
        const response = await hostEmployApi.getRecruitDetail(recruitId);
        setRecruit(response.data);
      } catch (error) {
        setErrorModal({
          visible: true,
          message: '공고 조회에 실패했습니다',
          buttonText: '확인',
        });
      }
    };
    fetchRecruitDetail();
  }, []);
  if (recruit == null) {
    return <Loading title={'공고를 불러오는 중이에요'} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 해시태그) */}
        <RecruitHeaderSection
          tags={recruit?.hashtags}
          guesthouseName={recruit?.guesthouseName}
          recruitImages={recruit?.recruitImages}
        />
        <View style={{paddingHorizontal: 20}}>
          {/* 상단 기본 정보(공고 제목, 위치, 요약) */}
          <RecruitProfileSection
            recruit={recruit}
            toggleFavorite={() =>
              setErrorModal({
                visible: true,
                message: '알바 로그인 후 이용가능해요',
                buttonText: '확인',
              })
            }
          />
          <View style={styles.devide} />
          {/* 탭 */}
          <RecruitTapSection recruit={recruit} />
          <View style={styles.devide} />
          <RecruitDescriptionSection description={recruit?.recruitDetail} />
        </View>
      </ScrollView>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default MyRecruitmentDetail;
