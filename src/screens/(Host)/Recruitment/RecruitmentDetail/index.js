// 목업 데이터 객체를 기반으로 구성한 RecruitmentDetail 화면

import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import styles from './RecruitmentDetail.styles';
import Share from '@assets/images/Share.svg';
import Header from '@components/Header';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import hostEmployApi from '../../../../utils/api/hostEmployApi';

const {width} = Dimensions.get('window');

const recruitmentData = {
  recruitId: 3,
  recruitTitle: '여름 시즌 게스트하우스 스태프 모집 수정',
  recruitShortDescription:
    '바다 근처 게스트하우스에서 즐겁게 일하실 분을 모집합니다! 수정',
  averageRating: 0.0,
  numberOfReviews: 0,
  recruitStart: '2025-04-20T10:00:00',
  recruitEnd: '2025-05-15T23:59:00',
  recruitNumberMale: 2,
  recruitNumberFemale: 2,
  location: '강원도 속초시 해변로 123',
  recruitCondition: '숙식 제공, 주 1회 휴무, 유니폼 수정',
  recruitMinAge: 20,
  recruitMaxAge: 30,
  workType: '풀타임',
  workStartDate: '2025-06-01T09:00:00',
  workEndDate: '2025-08-31T18:00:00',
  workPart: '청소 및 손님 응대',
  welfare: '숙식 제공, 워케이션 환경, 바다 근처 활동 가능',
  recruitDetail:
    '속초 바닷가 바로 앞에 위치한 게스트하우스에서 여름 시즌을 함께 보낼 스태프를 모집합니다. 숙식이 제공되며, 일과 후에는 다양한 해양 활동을 즐길 수 있습니다.',
  recruitImages: [
    {
      recruitImageUrl: 'https://example.com/image1.jpg',
      isThumbnail: true,
    },
    {
      recruitImageUrl: 'https://example.com/image2.jpg',
      isThumbnail: false,
    },
  ],
  hashtags: ['파티'],
  guesthouseId: 1,
  guesthouseName: 'testname',
};

const RecruitmentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const recruitId = route.params?.recruitId ?? recruitmentData.recruitId;
  const id = recruitId;

  const [activeTab, setActiveTab] = useState('모집조건');
  const [favorites, setFavorites] = useState({[id]: false});
  const [recruit, setRecruit] = useState(recruitmentData);

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTabPress = tabName => {
    setActiveTab(tabName);
  };

  const formatDate = iso => new Date(iso).toLocaleDateString('ko-KR');

  useEffect(() => {
    const fetchRecruitDetail = async () => {
      try {
        const response = await hostEmployApi.getRecruitDetail(recruitId);
        setRecruit(response.data);
      } catch (error) {
        Alert('공고 상세 조회에 실패했습니다.');
      }
    };
    // fetchRecruitDetail();
  }, []);
  const renderTabContent = () => {
    switch (activeTab) {
      case '모집조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집기간</Text>
              <Text style={styles.infoValue}>
                {formatDate(recruit.recruitStart)} ~{' '}
                {formatDate(recruit.recruitEnd)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집인원</Text>
              <Text style={styles.infoValue}>
                여 {recruit.recruitNumberFemale}명, 남{' '}
                {recruit.recruitNumberMale}명
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>
                {recruit.recruitMinAge} ~ {recruit.recruitMaxAge}세
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>{recruit.recruitCondition}</Text>
            </View>
          </View>
        );
      case '근무조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무형태</Text>
              <Text style={styles.infoValue}>{recruit.workType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주요업무</Text>
              <Text style={styles.infoValue}>{recruit.workPart}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무기간</Text>
              <Text style={styles.infoValue}>
                {formatDate(recruit.workStartDate)} ~{' '}
                {formatDate(recruit.workEndDate)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>{recruit.welfare}</Text>
            </View>
          </View>
        );
      case '근무지정보':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>근무지 사진</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}>
              {recruit.recruitImages.map((img, idx) => (
                <Image
                  key={idx}
                  source={{uri: img.recruitImageUrl}}
                  style={styles.workplacePhoto}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <View style={styles.mapContainer}>
              <Text style={styles.mapText}>{recruit.location}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="공고상세" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              {recruit.guesthouseName}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => toggleFavorite(id)}>
              {favorites[id] ? (
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

        <View style={styles.mainImageContainer}>
          <Image
            source={{
              uri:
                recruit.recruitImages.find(i => i.isThumbnail)
                  ?.recruitImageUrl || '',
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{recruit.recruitTitle}</Text>
          <View style={styles.tagsContainer}>
            {recruit.hashtags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.location}>{recruit.location}</Text>
          <Text style={styles.description}>
            {recruit.recruitShortDescription}
          </Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              업체 리뷰 평점({recruit.averageRating}) 리뷰개수{' '}
              {recruit.numberOfReviews} {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {['모집조건', '근무조건', '근무지정보'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>상세 정보</Text>
          <Text style={styles.detailContent}>{recruit.recruitDetail}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('PostRecruitment', {id})}>
          <Text style={styles.secondaryButtonText}>수정하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => navigation.navigate('ApplicantList', {id})}>
          <Text style={styles.applyButtonText}>지원자 보기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RecruitmentDetail;
