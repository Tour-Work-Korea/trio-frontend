import React from 'react';
import {View, ScrollView} from 'react-native';
import styles from './Home.styles';
import {banners, guesthouses, jobs} from './mockData';
import Header from '@components/Header';
import Banner from './components/Banner';
import Buttons from './components/Buttons';
import Guesthouses from './components/Guesthouses';
import Employ from './components/Employs';

const Home = () => {
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
        <Guesthouses guesthouses={guesthouses} />
      </View>

      {/* 추천 일자리 */}
      <View style={styles.boxContainer}>
        <Employ jobs={jobs} />
      </View>
    </ScrollView>
  );
};

export default Home;
