// 기존 import 문은 동일하게 유지합니다

import React, {useState, useEffect} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import styles from './ApplicantList.styles';
import hostEmployApi from '@utils/api/hostEmployApi';
import FilterIcon from '@assets/images/gray_search.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import ChevronDown from '@assets/images/arrow_drop_down.svg';
import Header from '@components/Header';
import {COLORS} from '@constants/colors';

const mockApplicants = [
  {
    resumeId: 3,
    resumeTitle: '열정 가득한 알바생',
    recruitId: 1,
    recruitTitle: '수정 2번된 겨울 방학 스키장 스태프 모집',
    guesthouseName: 'testname',
    photoUrl: 'https://via.placeholder.com/150',
    nickname: 'host',
    mbti: 'INFP',
    gender: 'F',
    age: 29,
    totalExperience: '2년 11개월',
    workExperience: [
      {companyName: '맥도날드 A', workType: '카운터'},
      {companyName: '버거킹 B', workType: '씽크'},
    ],
    userHashtag: [
      {id: 10, hashtag: '파티'},
      {id: 11, hashtag: '파티X'},
      {id: 12, hashtag: '바다전망'},
    ],
    isLiked: true,
  },
];

const ApplicantList = () => {
  const route = useRoute();
  const {recruitId} = route.params;
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [applicants, setApplicants] = useState(mockApplicants);
  const [selectedGuesthouse, setSelectedGuesthouse] = useState(
    mockApplicants[0].guesthouseName,
  );
  const [currentRecommendedIndex, setCurrentRecommendedIndex] = useState(1);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        let response;
        if (recruitId) {
          response = await hostEmployApi.getApplicantDetail(recruitId);
        } else {
          response = await hostEmployApi.getAllApplicants();
        }

        const data = response.data;
        setApplicants(data);
        if (data.length > 0) {
          setSelectedGuesthouse(data[0].guesthouseName);
        }
      } catch (error) {
        Alert.alert('지원서 조회에 실패했습니다');
      }
    };

    // fetchApplicants();
  }, []);

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApplicantPress = resumeId => {
    navigation.navigate('MyApplicantDetail', {id: resumeId});
  };

  const parseYears = str => {
    const matched = str.match(/(\d+)년/);
    return matched ? parseInt(matched[1], 10) : 0;
  };

  const filteredApplicants = applicants.filter(applicant => {
    switch (selectedFilter) {
      case 'career1':
        return parseYears(applicant.totalExperience) >= 1;
      case 'age20':
        return applicant.age >= 20 && applicant.age < 30;
      case 'age30':
        return applicant.age >= 30 && applicant.age < 40;
      case 'genderF':
        return applicant.gender === 'F';
      case 'genderM':
        return applicant.gender === 'M';
      default:
        return true;
    }
  });

  const renderFilterButtons = () => (
    <View style={styles.filterButtonsContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('all')}>
        <Text style={styles.filterButtonText}>전체</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'career1' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('career1')}>
        <Text style={styles.filterButtonText}>1년 이상</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'age20' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age20')}>
        <Text style={styles.filterButtonText}>20대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'age30' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age30')}>
        <Text style={styles.filterButtonText}>30대</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'genderF' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderF')}>
        <Text style={styles.filterButtonText}>여자</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'genderM' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('genderM')}>
        <Text style={styles.filterButtonText}>남자</Text>
      </TouchableOpacity>
    </View>
  );

  const renderApplicantItem = ({item}) => (
    <TouchableOpacity onPress={() => handleApplicantPress(item.resumeId)}>
      <View style={styles.applicantCard}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.guesthouseName}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.recruitTitle}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.resumeId)}>
            {favorites[item.resumeId] || item.isLiked ? (
              <FilledHeartIcon width={24} height={24} color={COLORS.scarlet} />
            ) : (
              <HeartIcon width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{uri: item.photoUrl}}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.nameText}>{item.nickname}</Text>
            <Text style={styles.genderAgeText}>
              ({item.gender}, {item.age}세)
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.introductionText}>{item.resumeTitle}</Text>
            <View style={styles.tagsRow}>
              {item.userHashtag.map(tag => (
                <Text key={tag.id} style={styles.hashTag}>
                  #{tag.hashtag}
                </Text>
              ))}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{item.mbti}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>경력</Text>
              <Text style={styles.infoValue}>
                {item.workExperience
                  .map(w => `${w.companyName}(${w.workType})`)
                  .join(', ')}
              </Text>
            </View>

            <Text style={styles.careerYears}>{item.totalExperience}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="지원자 조회" />
      {renderFilterButtons()}
      <ScrollView style={styles.scrollView}>
        <FlatList
          data={filteredApplicants}
          renderItem={renderApplicantItem}
          keyExtractor={item => item.resumeId.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicantList;
