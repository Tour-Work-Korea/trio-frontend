import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import dayjs from 'dayjs';

import styles from './Home.styles';
import {banners, guesthouses, jobs} from './mockData';
import Header from '@components/Header';
import Banner from './Banner';
import Buttons from './Buttons';
import Guesthouses from './Guesthouses';
import Employ from './Employs';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import userEmployApi from '@utils/api/userEmployApi';

const HomeMain = () => {
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [employList, setEmployList] = useState([]);
  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);

  useEffect(() => {
    tryFetchEmploys();
    tryFetchGuesthouses();
  }, []);

  const tryFetchGuesthouses = async () => {
    const today = dayjs();
    const tomorrow = today.add(1, 'day');

    try {
      const params = {
        checkIn: today.format('YYYY-MM-DD'),
        checkOut: tomorrow.format('YYYY-MM-DD'),
        guestCount: 1,
        page: 0,
        size: 10,
        sort: 'RECOMMEND',
        keyword: '외도',
      };
      const response = await userGuesthouseApi.getGuesthouseList(params);
      setGuesthouseList(response.data.content);
    } catch (error) {
      console.warn('게스트하우스 조회 실패', error);
    } finally {
      setIsGHLoading(false);
    }
  };

  const tryFetchEmploys = async () => {
    try {
      const response = await userEmployApi.getRecruits({page: 0, size: 10});
      setEmployList(response.data.content);
    } catch (error) {
      console.warn('공고 조회 실패', error);
    } finally {
      setIsEmLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingHorizontal: 20}}>
      <Header />

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
