import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
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
import ErrorModal from '@components/modals/ErrorModal';
import userEmployApi from '@utils/api/userEmployApi';
import useUserStore from '@stores/userStore';

const PopularEmployList = () => {
  const navigation = useNavigation();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const userRole = useUserStore.getState()?.userRole;

  const [recruits, setRecruits] = useState([]);
  const [reviews, setReviews] = useState();

  const [page, setPage] = useState(0);
  const [isRecruitsLast, setIsRecruitsLast] = useState(false);
  const [isRecruitsLoading, setIsRecruitsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      // 첫 진입 시 0페이지 로딩
      tryFetchEmploys(0, false);
      tryFetchEmployReviews();
    }, [tryFetchEmploys]),
  );

  const renderTrendingCard = item => (
    <TouchableOpacity
      key={item.id}
      style={[styles.trendingCard, {width: SCREEN_WIDTH * 0.9}]}
      onPress={() => {
        openReviewLink(item.reviewLink);
      }}>
      {item.reviewImageUrl ? (
        <Image
          source={{uri: item.reviewImageUrl}}
          style={styles.trendingImage}
        />
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
            {Number(item.reviewScore ?? 0).toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.trendingInfo}>
        <Text
          style={[FONTS.fs_16_semibold, styles.trendingName]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.reviewTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const tryFetchEmployReviews = async () => {
    try {
      const response = await userEmployApi.getEmployReviews();
      setReviews(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '공고 리뷰 조회에 실패했습니다',
        buttonText: '확인',
      });
    }
  };

  const tryFetchEmploys = useCallback(
    async (pageToFetch = 0, isLoadMore = false) => {
      // 이미 로딩 중이거나 마지막 페이지면 막기
      if (isRecruitsLoading || (isRecruitsLast && isLoadMore)) {
        return;
      }

      try {
        setIsRecruitsLoading(true);

        const response = await userEmployApi.getRecruits(
          {page: pageToFetch, size: 10},
          userRole === 'USER',
        );

        const {content, last} = response.data;

        setRecruits(prev =>
          pageToFetch === 0 ? content : [...prev, ...content],
        );
        setPage(pageToFetch);
        setIsRecruitsLast(last);
      } catch (error) {
        setErrorModal({
          visible: true,
          message: '추천 공고 조회에 실패했습니다',
          buttonText: '확인',
        });
      } finally {
        setIsRecruitsLoading(false);
      }
    },
    [userRole, isRecruitsLoading, isRecruitsLast],
  );

  const openReviewLink = async url => {
    try {
      const safe = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const supported = await Linking.canOpenURL(safe);
      if (!supported) {
        console.warn('링크 열기 실패');
        return;
      }
      await Linking.openURL(safe);
    } catch (e) {
      console.warn('링크 열기 실패', String(e));
    }
  };

  const moveToDetail = id => {
    navigation.navigate('EmployDetail', {id});
  };

  // ✅ ScrollView 바닥 근처 도달 시 다음 페이지 로딩
  const handleScroll = ({nativeEvent}) => {
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;

    const paddingToBottom = 80; // 바닥에서 80px 남았을 때 호출
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isNearBottom && !isRecruitsLoading && !isRecruitsLast) {
      tryFetchEmploys(page + 1, true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={16}>
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
          data={reviews?.slice(0, 3)}
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
          {reviews?.slice(0, 3).map((_, index) => (
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

        {/* 추천 공고 리스트 */}
        <RecruitList
          data={recruits}
          // 처음에만 로딩 보여주고 싶으면 아래처럼도 가능:
          // loading={recruits.length === 0 && isRecruitsLoading}
          loading={false}
          onEndReached={() => {}}
          onJobPress={moveToDetail}
          setRecruitList={setRecruits}
          scrollEnabled={false} // 부모 ScrollView가 스크롤 담당
          showErrorModal={setErrorModal}
        />

        {/* 아래에서 추가 페이지 로딩 중일 때 스피너 */}
        {isRecruitsLoading && recruits.length > 0 && !isRecruitsLast && (
          <ActivityIndicator
            size="small"
            color="gray"
            style={{marginVertical: 16}}
          />
        )}
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
