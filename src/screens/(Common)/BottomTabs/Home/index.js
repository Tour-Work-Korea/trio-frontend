import React from 'react';
import { View, Text, Image, FlatList, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styles from './Home.styles';
import { banners, stories, guesthouses, jobs } from './mockData';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import EmptyHeart from '@assets/images/Empty_Heart.svg';
import FillHeart from '@assets/images/Fill_Heart.svg';

const { width } = Dimensions.get('window');

const Home = () => {

  const renderStory = ({ item }) => (
    <View style={styles.storyContainer}>
      <View style={styles.storyImageContainer}>
        <Image source={item.image} style={styles.storyImage} />
      </View>
      <Text style={[FONTS.fs_body, styles.storyText]}>{item.title}</Text>
    </View>
  );

  const renderGuesthouse = ({ item }) => (
    <View style={styles.guesthouseCard}>
      <Image source={item.image} style={styles.guesthouseImage} />
      <Text style={[FONTS.fs_body, styles.guesthouseCategory]}>{item.category}</Text>
      <Text style={[FONTS.fs_body, styles.guesthouseTitle]} numberOfLines={1}>{item.title}</Text>
      <Text style={[FONTS.fs_body, styles.guesthousePriceName]}>
        최저가 <Text style={[FONTS.fs_h2_bold, styles.guesthousePrice]}>{item.price}</Text>
      </Text>
    </View>
  );

  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <Image source={item.image} style={styles.jobImage} />
  
      <View style={styles.jobInfo}>
        <Text style={[FONTS.fs_body, styles.jobGuesthouse]}>{item.guesthouse}</Text> {/* 게스트하우스 이름 */}
        <Text style={[FONTS.fs_body_bold, styles.jobTitle]}>{item.title}</Text> {/* 모집글 제목 */}
        <Text style={[FONTS.fs_body, styles.jobAdress]}>
          {item.location} {item.address}
        </Text> {/* 주소 */}
        <Text style={[FONTS.fs_body, styles.jobSubInfo]}>
          기한 | {item.period}
        </Text> {/* 기한 */}
      </View>
  
      <View style={styles.jobSide}>
        <Text style={[FONTS.fs_body, styles.jobCount]}>{item.count}</Text> {/* 명수 */}
        {item.isLiked ? <FillHeart width={15} height={15} /> : <EmptyHeart width={15} height={15} />}
        <TouchableOpacity style={styles.applyButton}>
          <Text style={[FONTS.fs_body, styles.applyButtonText]}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.bannerContainer}>
        <Carousel
          width={width}
          height={160}
          data={banners}
          scrollAnimationDuration={2000}
          pagingEnabled={false}
          renderItem={({ item }) => <Image source={item.image} style={styles.banner} />}
          autoPlay
          loop
        />
      </View>

      <View style={styles.bottomView}>
        <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>스토리로 미리 만나는 게스트하우스!</Text>
        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStory}
          contentContainerStyle={styles.storyList}
        />

        <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>인기 게스트하우스</Text>
        <FlatList
          data={guesthouses}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuesthouse}
          contentContainerStyle={styles.guesthouseList}
        />

        <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>추천 일자리</Text>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJob}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </ScrollView>
  );
};

export default Home;
