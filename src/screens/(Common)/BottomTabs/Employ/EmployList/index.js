import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './EmployList.styles';

// 아이콘 불러오기
import SearchIcon from '@assets/images/gray_search.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import ChevronRight from '@assets/images/gray_chevron_right.svg';
import Header from '@components/Header';
import userEmployApi from '@utils/api/userEmployApi';

// 목업 데이터
const jobListings = [
  {
    recruitId: 2,
    recruitTitle: '수정한 테스트 여름 시즌 게스트하우스 스태프 모집',
    guesthouseId: 1,
    guesthouseName: '임시게하',
    thumbnailImage: 'https://example.com/image1.jpg',
    hashtags: [
      {
        hashtag: '투어가능',
        hashtagType: 'RECRUIT_HASHTAG',
      },
      {
        hashtag: '숙식제공',
        hashtagType: 'RECRUIT_HASHTAG',
      },
      {
        hashtag: '즉시입도O',
        hashtagType: 'RECRUIT_HASHTAG',
      },
    ],
    address: '강원도 속초시 해변로 123',
    workDate: '2주',
    deadline: '2025-11-25',
    isLiked: true,
  },
];

const EmployList = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecruitList();
  }, []);

  const fetchRecruitList = async () => {
    if (loading || !hasNext) return;
    setLoading(true);
    try {
      const res = await userEmployApi.getRecruits({page, size: 10}); // ← 페이지 기반 API 호출
      const newContent = res.data.content;
      setRecruitList(prev => [...prev, ...newContent]);
      setPage(prev => prev + 1);
      setHasNext(!res.data.last); // 'last'가 true이면 더 없음
    } catch (error) {
      Alert.alert('채용 공고 불러오기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  const toggleFavorite = id => {};

  const handleApply = id => {
    // 지원하기 버튼 클릭 시 상세 페이지로 이동
    navigation.navigate('Applicant', {id});
  };

  const renderJobItem = ({item}) => (
    <View style={styles.jobItem}>
      <TouchableOpacity
        style={styles.jobItemContent}
        onPress={() =>
          navigation.navigate('EmployDetail', {id: item.recruitId})
        }>
        <Image
          source={require('@assets/images/exphoto.jpeg')} //item.thumbnailImage
          style={styles.jobImage}
          resizeMode="cover"
        />
        <View style={styles.jobDetails}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobType}>{item.guesthouseName}</Text>
            {item.deadline && (
              <Text style={styles.deadline}>{item.deadline}</Text>
            )}
          </View>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.recruitTitle}
            </Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.recruitId)}>
              {item.isLiked ? (
                <FilledHeartIcon width={20} height={20} />
              ) : (
                <HeartIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.jobHeader}>
            <View>
              {item.hashtags && (
                <View style={styles.tagsContainer}>
                  {item.hashtags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      {tag.hashtag}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.jobLocation}>{item.address}</Text>
              <Text style={styles.jobPeriod}>{item.workDate}</Text>
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApply(item.recruitId)}>
              <Text style={styles.applyButtonText}>지원하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = (title, onMorePress) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onMorePress} style={styles.moreButton}>
        <Text style={styles.moreButtonText}>더보기</Text>
        <ChevronRight width={16} height={16} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        ListHeaderComponent={
          <>
            {/* 검색 섹션 */}
            <View style={styles.searchSection}>
              <View style={styles.searchInputContainer}>
                <SearchIcon width={20} height={20} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="지역, 직군으로 검색"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>검색하기</Text>
              </TouchableOpacity>
            </View>

            {renderSectionHeader('추천 알바', () => {})}
          </>
        }
        data={recruitList}
        renderItem={renderJobItem}
        keyExtractor={item => item.recruitId.toString()}
        onEndReached={fetchRecruitList}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && (
            <View style={{padding: 16}}>
              <Text style={{textAlign: 'center'}}>불러오는 중...</Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

export default EmployList;
