import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import styles from './Home.styles';
import {banners, guesthouses, jobs} from './mockData';
import Header from '@components/Header';
import Banner from './components/Banner';
import Buttons from './components/Buttons';
import Guesthouses from './components/Guesthouses';
import Employ from './components/Employs';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import userEmployApi from '@utils/api/userEmployApi';

const Home = () => {
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [employList, setEmployList] = useState([]);
  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);

  useEffect(() => {
    tryFetchEmploys();
    tryFetchGuesthouses();
  }, []);

  const tryFetchGuesthouses = async () => {
    try {
      const params = {
        checkIn: '2025-05-20',
        checkOut: '2025-05-21',
        guestCount: 2,
        roomCount: 1,
        page: 0,
        size: 10,
        sort: 'averageRating,asc',
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

export default Home;
