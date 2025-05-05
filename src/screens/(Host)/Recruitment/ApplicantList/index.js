import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {useNavigation} from '@react-navigation/native';

// 아이콘 불러오기
import FilterIcon from '@assets/images/gray_search.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import ChevronDown from '@assets/images/arrow_drop_down.svg';
import Header from '@components/Header';

// 목업 데이터
const applicantsData = [
  {
    id: '1',
    name: '최원곤',
    gender: '남',
    age: 28,
    profileImage: 'exphoto.jpeg',
    guesthouse: '설렙 게스트하우스',
    jobTitle: '공고제목',
    introduction: '조용하지만 착실한 일꾼입니다.',
    tags: ['#작심삼일', '#저분한'],
    mbti: 'ISTJ',
    careerDetails: '편의점(6개월), 음식점(1년 6개월)',
    careerYears: '경력 2년',
    isFavorite: false,
    isRecommended: true,
  },
  {
    id: '2',
    name: '최원곤',
    gender: '남',
    age: 28,
    profileImage: 'exphoto.jpeg',
    guesthouse: '설렙 게스트하우스',
    jobTitle: '공고제목',
    introduction: '조용하지만 착실한 일꾼입니다.',
    tags: ['#작심삼일', '#저분한'],
    mbti: 'ISTJ',
    careerDetails: '편의점(6개월), 음식점(1년 6개월)',
    careerYears: '경력 2년',
    isFavorite: false,
    isRecommended: false,
  },
  {
    id: '3',
    name: '이원하',
    gender: '여',
    age: 22,
    profileImage: 'exphoto.jpeg',
    guesthouse: '설렙 게스트하우스',
    jobTitle: '공고제목',
    introduction: '다양한 알바로 다져진 경험으로 일하겠습니다.',
    tags: ['#경험', '#활발'],
    mbti: 'ESFP',
    careerDetails: '학원(2년), 피팅모델(6개월), 카페(1년), 과외(3개월), ...',
    careerYears: '경력 2년 10개월',
    isFavorite: true,
    isRecommended: false,
  },
  {
    id: '4',
    name: '김지수',
    gender: '여',
    age: 25,
    profileImage: 'exphoto.jpeg',
    guesthouse: '설렙 게스트하우스',
    jobTitle: '공고제목',
    introduction: '성실하고 책임감 있게 일하겠습니다.',
    tags: ['#성실함', '#책임감'],
    mbti: 'INFJ',
    careerDetails: '카페(1년), 호텔(6개월)',
    careerYears: '경력 1년 6개월',
    isFavorite: false,
    isRecommended: false,
  },
];

const ApplicantList = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState({
    3: true,
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedGuesthouse, setSelectedGuesthouse] =
    useState('설렙 게스트하우스');
  const [currentRecommendedIndex, setCurrentRecommendedIndex] = useState(1);
  const totalRecommended = applicantsData.filter(
    item => item.isRecommended,
  ).length;

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApplicantPress = id => {
    // 지원자 상세 페이지로 이동
    navigation.navigate('ApplicantDetail', {id});
  };

  const renderApplicantItem = ({item}) => (
    <View style={styles.applicantCard}>
      <View style={styles.cardHeader}>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>설렙 게스트하우스</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>공고제목</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}>
          {favorites[item.id] ? (
            <FilledHeartIcon width={24} height={24} color={COLORS.scarlet} />
          ) : (
            <HeartIcon width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.applicantInfo}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.genderAgeText}>
            ({item.gender}, {item.age}세)
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.introductionText}>{item.introduction}</Text>
          <View style={styles.tagsRow}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.hashTag}>
                {tag}
              </Text>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MBTI</Text>
            <Text style={styles.infoValue}>{item.mbti}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>경력</Text>
            <Text style={styles.infoValue}>{item.careerDetails}</Text>
          </View>

          <Text style={styles.careerYears}>{item.careerYears}</Text>
        </View>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterButtonsContainer}>
      <Header title="지원자 조회" />
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('all')}>
        <FilterIcon width={20} height={20} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'career' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('career')}>
        <Text style={styles.filterButtonText}>경력</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'age' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('age')}>
        <Text style={styles.filterButtonText}>나이</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'gender' && styles.selectedFilterButton,
        ]}
        onPress={() => setSelectedFilter('gender')}>
        <Text style={styles.filterButtonText}>성별</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecommendedSection = () => {
    const recommendedApplicants = applicantsData.filter(
      item => item.isRecommended,
    );

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.highlightedText}>추천</Text> 지원자
          </Text>
          <Text style={styles.subTitle}>이런 지원자는 어떠세요?</Text>
          <Text style={styles.pageIndicator}>
            {currentRecommendedIndex}/{totalRecommended}
          </Text>
        </View>

        {recommendedApplicants.length > 0 &&
          renderApplicantItem({item: recommendedApplicants[0]})}
      </View>
    );
  };

  const renderLatestSection = () => {
    const latestApplicants = applicantsData.filter(item => !item.isRecommended);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.latestHeaderLeft}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.highlightedText}>최신</Text> 지원자
            </Text>
            <Text style={styles.subTitle}>최근에 지원한 인재를 확인하세요</Text>
          </View>

          <TouchableOpacity style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedGuesthouse}</Text>
            <ChevronDown width={20} height={20} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={latestApplicants}
          renderItem={renderApplicantItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderFilterButtons()}

      <ScrollView style={styles.scrollView}>
        {renderRecommendedSection()}
        {renderLatestSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  scrollView: {
    flex: 1,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilterButton: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  filterButtonText: {
    ...FONTS.fs_body_small,
    color: COLORS.black,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  latestHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
  },
  highlightedText: {
    color: COLORS.scarlet,
  },
  subTitle: {
    ...FONTS.fs_body_small,
    color: COLORS.gray,
  },
  pageIndicator: {
    ...FONTS.fs_body_bold,
    color: COLORS.scarlet,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownButtonText: {
    ...FONTS.fs_body_small,
    color: COLORS.black,
    marginRight: 4,
  },
  applicantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    ...FONTS.fs_body_small,
    color: COLORS.black,
  },
  favoriteButton: {
    padding: 4,
  },
  applicantInfo: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  nameText: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    textAlign: 'center',
  },
  genderAgeText: {
    ...FONTS.fs_body_small,
    color: COLORS.gray,
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  introductionText: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hashTag: {
    ...FONTS.fs_body_small,
    color: COLORS.scarlet,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.black,
    width: 50,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    flex: 1,
  },
  careerYears: {
    ...FONTS.fs_body_bold,
    color: COLORS.scarlet,
    marginTop: 8,
  },
  separator: {
    height: 8,
  },
});

export default ApplicantList;
