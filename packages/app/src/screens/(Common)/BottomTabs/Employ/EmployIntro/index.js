import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {RecruitList} from '@components/Employ/RecruitList';
import useUserStore from '@stores/userStore';
import {toggleFavorite} from '@utils/toggleFavorite';
import userEmployApi from '@utils/api/userEmployApi';
import ScreenSkeleton from './LoadingSkeleton';
import AlertModal from '@components/modals/AlertModal';
import Header from '@components/Header';
import styles from './EmployIntro.styles';
import SearchIcon from '@assets/images/search_gray.svg';
import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';
import {COLORS} from '@constants/colors';

const PAGE_SIZE = 10;

const EmployIntro = () => {
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [recruitList, setRecruitList] = useState([]);

  const [page, setPage] = useState(0); // 현재 페이지
  const [hasNext, setHasNext] = useState(true); // 다음 페이지 존재 여부

  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 로딩
  const [isMoreLoading, setIsMoreLoading] = useState(false); // 추가 로딩

  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;

  const fetchRecruitList = useCallback(
    async (pageToLoad = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsMoreLoading(true);
        } else {
          setIsInitialLoading(true);
        }

        const body = {
          searchKeyword: '', // 검색 기능 붙이면 여기 searchText 사용
          page: pageToLoad,
          size: PAGE_SIZE,
          sortBy: 'string', // 백엔드 정의에 맞게 실제 값으로 변경
          hashtagIds: [],
          locationIds: [],
        };

        const response = await userEmployApi.getRecruits(
          body,
          // userRole === 'USER',
        );

        const {content, last, number} = response.data; // Spring Data Page 가정

        if (pageToLoad === 0) {
          // 첫 페이지
          setRecruitList(content);
        } else {
          // 이어 붙이기
          setRecruitList(prev => [...prev, ...content]);
        }

        setPage(number); // 또는 setPage(pageToLoad);
        setHasNext(!last); // last=true 이면 마지막 페이지
      } catch (error) {
        console.warn('공고 조회 실패', error);
        setErrorModal({
          visible: true,
          message: t(
            'employ.theAnnouncementCouldNotBeLoadedPleaseTryAgainLater',
          ),
          buttonText: t('common.confirm'),
        });
      } finally {
        if (isLoadMore) {
          setIsMoreLoading(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [userRole, t],
  );

  useFocusEffect(
    useCallback(() => {
      fetchRecruitList(0, false);
    }, [fetchRecruitList]),
  );

  const handleJobPress = id => navigation.navigate('EmployDetail', {id});

  const handleEndReached = () => {
    if (isInitialLoading || isMoreLoading || !hasNext) {
      return;
    }
    fetchRecruitList(page + 1, true);
  };

  if (isInitialLoading && page === 0) {
    return (
      <View style={styles.container}>
        <Header title={t('common.recruitmentNotice')} />
        <ScreenSkeleton layout={styles} title={t('common.retrievingJobOpenings')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t('common.recruitmentNotice')} />
      <View style={styles.scrollContent}>
        {/* 검색창 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EmploySearchList')}>
          <View style={styles.searchInputContainer}>
            <SearchIcon width={24} height={24} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.findAGuesthouseToWorkIn')}
              value={searchText}
              onChangeText={setSearchText}
              editable={false}
            />
          </View>
        </TouchableOpacity>
        {/* 추천 일자리 */}
        <View style={styles.employContainer}>
          <View style={[styles.titleSection]}>
            <Text style={styles.titleText}>
              <Text style={{color: COLORS.primary_orange}}>Work+Stay</Text>
              {t('common.atOnce')}
            </Text>
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => {
                navigation.navigate('EmploySearchList');
              }}>
              <Text style={styles.seeMoreText}>{t('common.seeMore')}</Text>
              <ChevronRightIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
          <RecruitList
            data={recruitList}
            loading={false}
            onJobPress={handleJobPress}
            onToggleFavorite={toggleFavorite}
            setRecruitList={setRecruitList}
            onEndReached={handleEndReached}
            scrollEnabled={true}
            ListFooterComponent={
              isMoreLoading ? (
                <ActivityIndicator
                  size="small"
                  color="gray"
                  style={{marginVertical: 16}}
                />
              ) : null
            }
            showErrorModal={setErrorModal}
          />
        </View>
      </View>
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default EmployIntro;
