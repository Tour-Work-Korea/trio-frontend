import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from '../Employ.styles';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';

// 아이콘 불러오기
import SearchIcon from '@assets/images/search_gray.svg';
import userEmployApi from '@utils/api/userEmployApi';
import Chevron_left_black from '@assets/images/chevron_left_black.svg';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const EmploySearchList = () => {
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);
  const [isEmLoading, setIsEmLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecruitList(page);
  }, [page]);

  //채용 공고 조회
  const fetchRecruitList = async (pageToFetch = 0) => {
    if (isEmLoading || !hasNext) return;
    setIsEmLoading(true);
    try {
      const res = await userEmployApi.getRecruits({
        page: pageToFetch,
        size: 8,
      });
      const newContent = res.data.content;
      setRecruitList(prev => [...prev, ...newContent]);
      setHasNext(!res.data.last);
    } catch (error) {
      setHasNext(false);
      console.warn('fetchRecruitList 실패:', error);
    } finally {
      setIsEmLoading(false);
    }
  };

  const handleEndReached = () => {
    if (!isEmLoading && hasNext) {
      setPage(prev => prev + 1);
    }
  };

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  if (isEmLoading) {
    <Loading title="채용 정보를 가져오는 중입니다..." />;
  }
  return (
    // <SafeAreaView >
    <ScrollView style={[styles.container]} contentContainerStyle={{gap: 12}}>
      {/* 헤더 */}
      <View style={{paddingHorizontal: 20, flexDirection: 'column', gap: 16}}>
        <View style={[styles.headerBox]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Chevron_left_black width={28.8} height={28.8} />
          </TouchableOpacity>

          <Text style={styles.headerText}>채용공고</Text>
          <View style={{width: 28.8}}></View>
        </View>
        {/* 검색창 */}
        <View style={[styles.searchInputContainer]}>
          <SearchIcon width={24} height={24} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="일할 게스트하우스를 찾아보세요"
            placeholderTextColor={COLORS.grayscale_600}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() =>
              navigation.navigate('EmploySearchResult', {search: searchText})
            }
          />
        </View>
      </View>

      {/* 뽑고 있는 게스트하우스 */}
      <View style={styles.employContainer}>
        <View
          style={[
            styles.titleSection,
            {justifyContent: 'center', marginBottom: 4, marginTop: 8},
          ]}>
          <Text style={{...FONTS.fs_14_medium, color: COLORS.grayscale_500}}>
            채용 중인 게스트하우스
          </Text>
        </View>
        <RecruitList
          data={recruitList}
          loading={isEmLoading}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.7}
          onJobPress={handleJobPress}
          onToggleFavorite={toggleLikeRecruit}
          setRecruitList={setRecruitList}
          ListFooterComponent={
            isEmLoading && <ActivityIndicator size="small" color="gray" />
          }
        />
      </View>
    </ScrollView>
    // </SafeAreaView>
  );
};

export default EmploySearchList;
