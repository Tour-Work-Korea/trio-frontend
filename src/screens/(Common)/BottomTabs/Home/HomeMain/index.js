import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {banners, guesthouses, jobs} from './mockData';
import Header from '@components/Header';
import Banner from './Banner';
import Buttons from './Buttons';
import Guesthouses from './Guesthouses';
import Employ from './Employs';

import Logo from '@assets/images/logo_orange.svg';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import userEmployApi from '@utils/api/userEmployApi';
import useUserStore from '@stores/userStore';
import {useFocusEffect} from '@react-navigation/native';

const HomeMain = () => {
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [employList, setEmployList] = useState([]);
  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);
  const userRole = useUserStore.getState()?.userRole;

  useFocusEffect(
    useCallback(() => {
      tryFetchEmploys();
      tryFetchGuesthouses();
    }, [tryFetchEmploys, tryFetchGuesthouses]),
  );

  const tryFetchGuesthouses = useCallback(async () => {
    try {
      const { data } = await userGuesthouseApi.getPopularGuesthouses();
      setGuesthouseList(data);
    } catch (error) {
      console.warn('게스트하우스 조회 실패', error);
    } finally {
      setIsGHLoading(false);
    }
  }, []);

  const tryFetchEmploys = useCallback(async () => {
    try {
      const response = await userEmployApi.getRecruits(
        {page: 0, size: 10},
        userRole === 'USER',
      );
      setEmployList(response.data.content);
    } catch (error) {
      console.warn('공고 조회 실패', error);
    } finally {
      setIsEmLoading(false);
    }
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingHorizontal: 20}}>
      {/* 헤더 */}
      <View style={styles.Header}>
        <Logo />
      </View>

      {/* 배너 */}
      <View style={styles.boxContainer}>
        <Banner banners={banners} />
      </View>

      {/* 버튼 */}
      <View style={styles.boxContainer}>
        <Buttons />
      </View>

      {/* 인기 게스트하우스 */}
      <View style={styles.boxContainer}>
        {isGHLoading ? (
          <Text>로딩 중</Text>
        ) : (
          <Guesthouses guesthouses={guesthouseList} />
        )}
      </View>

      {/* 추천 일자리 */}
      <View style={styles.boxContainer}>
        {isEmLoading ? (
          <Text>로딩 중</Text>
        ) : (
          <Employ jobs={employList} setEmployList={setEmployList} />
        )}
      </View>
    </ScrollView>
  );
};

export default HomeMain;
