import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
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
import styles from './EmployDetail.styles';
import Share from '@assets/images/Share.svg';
import Header from '@components/Header';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import userEmployApi from '@utils/api/userEmployApi';

const {width} = Dimensions.get('window');

const EmployDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params;
  const [activeTab, setActiveTab] = useState('모집조건');
  const [favorites, setFavorites] = useState({
    1: true,
  });
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
    try {
      if (isLiked) {
        await userEmployApi.deleteLikeRecruitById(id);
      } else {
        await userEmployApi.addLikeRecruitById(id);
      }
      setRecruit(prev => {
        return {...prev, liked: !isLiked};
      });
    } catch (error) {
      Alert.alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };
  const handleTabPress = tabName => {
    setActiveTab(tabName);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case '모집조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집기간</Text>
              <Text style={styles.infoValue}>
                {recruit.recruitStart?.split('T')[0]}~{' '}
                {recruit.recruitEnd?.split('T')[0]}
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

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>2025.01.25 전후</Text>
            </View> */}

            {/* <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>초보 가능, 밝은신 분 환영</Text>
            </View> */}
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
                {recruit.workStartDate?.split('T')[0]} ~{' '}
                {recruit.workEndDate?.split('T')[0]}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>{recruit.recruitCondition}</Text>
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
              {recruit?.recruitImages?.map((item, idx) => (
                <Image
                  key={idx}
                  source={require('@assets/images/exphoto.jpeg')} //item.recruitImageUrl
                  style={styles.workplacePhoto}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <Text>{recruit.location}</Text>
          </View>
        );
      default:
        return null;
    }
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

          {/* 메인 이미지 */}
          <View style={styles.mainImageContainer}>
            {recruit?.recruitImages.map((item, idx) =>
              item.isThumbnail ? (
                <Image
                  source={require('@assets/images/exphoto.jpeg')} //item.recruitImageUrl
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              ) : (
                ''
              ),
            )}
          </View>

          {/* 공고 제목 및 정보 */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{recruit.recruitTitle}</Text>
            <View style={styles.tagsContainer}>
              {recruit?.hashtags?.map((tag, idx) => (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.hashtag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.location}>{recruit.location}</Text>
            <Text style={styles.description}>
              {recruit.recruitShortDescription}
            </Text>
            {/* 공고 리뷰 */}
            {/* <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              업체 리뷰 평점({recruit.averageRating}) {recruit.numberOfReviews}
              개 {'>'}
            </Text>
          </TouchableOpacity> */}
          </View>

          {/* 탭 메뉴 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === '모집조건' && styles.activeTab]}
              onPress={() => handleTabPress('모집조건')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === '모집조건' && styles.activeTabText,
                ]}>
                모집조건
              </Text>
              {activeTab === '모집조건' && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === '근무조건' && styles.activeTab]}
              onPress={() => handleTabPress('근무조건')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === '근무조건' && styles.activeTabText,
                ]}>
                근무조건
              </Text>
              {activeTab === '근무조건' && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === '근무지정보' && styles.activeTab,
              ]}
              onPress={() => handleTabPress('근무지정보')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === '근무지정보' && styles.activeTabText,
                ]}>
                근무지정보
              </Text>
              {activeTab === '근무지정보' && (
                <View style={styles.activeTabIndicator} />
              )}
            </TouchableOpacity>
          </View>

          {/* 탭 내용 */}
          {renderTabContent()}

          {/* 상세 정보 */}
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>상세 정보</Text>
            <Text style={styles.detailContent}>{recruit.recruitDetail}</Text>
          </View>
        </ScrollView>
      )}

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            navigation.navigate('Applicant', {
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
