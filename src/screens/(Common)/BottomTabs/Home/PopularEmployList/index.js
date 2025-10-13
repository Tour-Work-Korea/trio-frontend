import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
const {width: SCREEN_WIDTH} = Dimensions.get('window');

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import styles from './PopularGuesthouseList.styles';

import HeaderImg from '@assets/images/employ_popular_header.svg';
import Workaways from '@assets/images/workaways_text_white.svg';
import StarIcon from '@assets/images/star_white.svg';
import LeftChevron from '@assets/images/chevron_left_white.svg';
import {RecruitList} from '@components/Employ/RecruitList';
import {toggleLikeRecruit} from '@utils/handleFavorite';
import ErrorModal from '@components/modals/ErrorModal';
import userEmployApi from '@utils/api/userEmployApi';
import useUserStore from '@stores/userStore';

const dummyReviewData = [
  {
    id: 1,
    title: '비지터 게스트하우스 후기',
    rate: '4.5',
    thumbnailUrl:
      'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1758075021542_214137.jpg',
  },
  {
    id: 2,
    title: '백패커 게스트하우스 후기',
    rate: '5.0',
    thumbnailUrl:
      'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1758075021542_214137.jpg',
  },
  {
    id: 3,
    title: '제주누리 게스트하우스 후기',
    rate: '3.8',
    thumbnailUrl:
      'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1758075021542_214137.jpg',
  },
];

const PopularEmployList = () => {
  const navigation = useNavigation();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });
  const userRole = useUserStore.getState()?.userRole;
  const [recruits, setRecruits] = useState([]);
  const [reviews, setReviews] = useState(dummyReviewData);

  useFocusEffect(
    useCallback(() => {
      tryFetchEmploys();
    }, [tryFetchEmploys]),
  );

  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);

  const renderTrendingCard = item => (
    <TouchableOpacity
      key={item.id}
      style={[styles.trendingCard, {width: SCREEN_WIDTH * 0.9}]}
      onPress={() => {}}>
      {item.thumbnailUrl ? (
        <Image source={{uri: item.thumbnailUrl}} style={styles.trendingImage} />
      ) : (
        <View
          style={[
            styles.trendingImage,
            {backgroundColor: COLORS.grayscale_200},
          ]}
        />
      )}
      <View style={styles.trendingRating}>
        <View style={styles.ratingRow}>
          <StarIcon width={14} height={14} />
          <Text style={[FONTS.fs_14_medium, styles.ratingText]}>
            {Number(item.rate ?? 0).toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.trendingInfo}>
        <Text style={[FONTS.fs_16_semibold, styles.trendingName]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const tryFetchEmploys = useCallback(async () => {
    try {
      const response = await userEmployApi.getRecruits(
        {page: 0, size: 10},
        userRole === 'USER',
      );
      setRecruits(response.data.content);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '추천 공고 조회에 실패했습니다',
        buttonText: '확인',
      });
    } finally {
    }
  }, []);

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <HeaderImg style={styles.headerImg} />
        <View style={styles.headerTitle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <LeftChevron width={28} height={28} />
          </TouchableOpacity>
          <Text style={[FONTS.fs_20_semibold, styles.headerTitleText]}>
            인기 공고
          </Text>
        </View>
        <View style={styles.headerSubtitle}>
          <Workaways />
          <Text style={[FONTS.fs_16_medium, styles.headerSubtitleText]}>
            가장 인기 있는 공고들만 모아봤어요
          </Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <Text style={[FONTS.fs_16_semibold, styles.title]}>게하 스텝 후기</Text>
        <FlatList
          ref={flatListRef}
          data={reviews.slice(0, 3)}
          renderItem={({item}) => renderTrendingCard(item)}
          keyExtractor={item => String(item.guesthouseId)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const page = Math.round(offsetX / SCREEN_WIDTH);
            setCurrentPage(page);
          }}
          style={styles.trendingList}
        />
        {/* 인디케이터 */}
        <View style={styles.indicatorContainer}>
          {reviews.slice(0, 3).map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                currentPage === index && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={[FONTS.fs_16_semibold, styles.title]}>추천 일자리</Text>
        <RecruitList
          data={recruits}
          onEndReached={() => {}}
          onJobPress={moveToDetail}
          onToggleFavorite={toggleLikeRecruit}
          setRecruitList={setRecruits}
          scrollEnabled={false}
          showErrorModal={setErrorModal}
        />
      </View>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </ScrollView>
  );
};

export default PopularEmployList;
