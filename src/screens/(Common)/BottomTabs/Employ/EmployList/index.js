import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './EmployList.styles';

// 아이콘 불러오기
import SearchIcon from '@assets/images/gray_search.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import ChevronRight from '@assets/images/gray_chevron_right.svg';
import Header from '@components/Header';

// 목업 데이터
const jobListings = [
  {
    id: '1',
    category: 'guesthouse',
    type: '업체명',
    title: '제목',
    tags: ['#해시태그1', '#해시태그2'],
    location: '근무지',
    period: '기간',
    deadline: '3/23',
    image: 'exphoto.jpeg',
    isFavorite: true,
  },
  {
    id: '2',
    category: 'guesthouse',
    type: '농명이 연구소',
    title: '농명이 연구소에서 N 달 살이 스텝 모집',
    tags: ['#해시태그1', '#해시태그2'],
    location: '제주시 애월리 20002-7',
    period: '기간 | 2개월 이상',
    deadline: '3/23',
    image: 'exphoto.jpeg',
    isFavorite: false,
  },
  {
    id: '3',
    category: 'guesthouse',
    type: '조브라더스',
    title: '조브라더스에서 여성 스텝 모집',
    tags: ['#해시태그1', '#해시태그2'],
    location: '제주시 애월리 20002-7',
    period: '기간 | 1개월 이상',
    deadline: '3/25',
    image: 'exphoto.jpeg',
    isFavorite: false,
  },
];

const EmployList = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState({
    1: true,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const toggleFavorite = id => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApply = id => {
    // 지원하기 버튼 클릭 시 상세 페이지로 이동
    navigation.navigate('Applicant', {id});
  };

  const renderJobItem = ({item}) => (
    <View style={styles.jobItem}>
      <TouchableOpacity
        style={styles.jobItemContent}
        onPress={() => navigation.navigate('EmployDetail', {id: item.id})}>
        <Image
          source={require('@assets/images/exphoto.jpeg')}
          style={styles.jobImage}
          resizeMode="cover"
        />
        <View style={styles.jobDetails}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobType}>{item.type}</Text>
            {item.deadline && (
              <Text style={styles.deadline}>{item.deadline}</Text>
            )}
          </View>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}>
              {favorites[item.id] ? (
                <FilledHeartIcon width={20} height={20} />
              ) : (
                <HeartIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.jobHeader}>
            <View>
              {item.tags && (
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.jobLocation}>{item.location}</Text>
              <Text style={styles.jobPeriod}>{item.period}</Text>
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApply(item.id)}>
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

  const renderCategoryChips = () => {
    const categories = [
      {id: 'cafe', label: '카페 스텝'},
      {id: 'restaurant', label: '외식/음료'},
      {id: 'activity', label: '물류/택배'},
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip,
            ]}
            onPress={() => setSelectedCategory(category.id)}>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id &&
                  styles.selectedCategoryChipText,
              ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
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
        <View style={styles.bodyContainer}>
          {/* 게스트하우스 섹션 */}
          <View style={styles.section}>
            {renderSectionHeader('알바 + 게스트하우스를 한번에', () => {})}
            <FlatList
              data={jobListings.filter(job => job.category === 'guesthouse')}
              renderItem={renderJobItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
          {/* 추천 알바 섹션 */}
          <View style={styles.section}>
            {renderSectionHeader('추천 알바', () => {})}
            {renderCategoryChips()}
            <FlatList
              data={jobListings.filter(job => job.category)}
              renderItem={renderJobItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployList;
