import React, {useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import styles from './EmployDetail.styles';
import Share from '@assets/images/Share.svg';
import Header from '@components/Header';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';

const {width} = Dimensions.get('window');

const EmployDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {id} = route.params;
  const [activeTab, setActiveTab] = useState('모집조건');
  const [favorites, setFavorites] = useState({
    1: true,
  });

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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
              <Text style={styles.infoValue}>2025.01.22(토) ~ 채용시 마감</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집인원</Text>
              <Text style={styles.infoValue}>여 1명, 남 1명</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>22 ~ 33세 (93년생까지)</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>2025.01.25 전후</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>초보 가능, 밝은신 분 환영</Text>
            </View>
          </View>
        );
      case '근무조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무형태</Text>
              <Text style={styles.infoValue}>주 4일 근무, 3일 휴무</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주요업무</Text>
              <Text style={styles.infoValue}>예약 관리 보조, 객실 청소</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무기간</Text>
              <Text style={styles.infoValue}>1달 이상</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>
                자원금 매달 00만원, 숙식 제공
              </Text>
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
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />{' '}
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />{' '}
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />{' '}
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />{' '}
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.workplacePhoto}
              />
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            <View style={styles.mapContainer}>
              <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.mapImage}
                resizeMode="cover"
              />
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
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerButton}>
            <Text style={styles.headerButtonText}>게스트하우스 이름</Text>
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

        {/* 메인 이미지 */}
        <View style={styles.mainImageContainer}>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* 공고 제목 및 정보 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>공고 제목</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>#해시태그1</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>#해시태그2</Text>
            </View>
          </View>
          <Text style={styles.location}>근무지 위치</Text>
          <Text style={styles.description}>공고 요약</Text>
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              업체 리뷰 평점(4.8) 리뷰개수 {'>'}
            </Text>
          </TouchableOpacity>
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
            style={[styles.tab, activeTab === '근무지정보' && styles.activeTab]}
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
          <Text style={styles.detailContent}>상세 정보</Text>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            navigation.navigate('Applicant');
          }}>
          <Text style={styles.applyButtonText}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmployDetail;
