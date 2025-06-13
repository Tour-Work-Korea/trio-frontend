import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styles from './Home.styles';
import {banners, stories, guesthouses, jobs} from './mockData';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import EmptyHeart from '@assets/images/Empty_Heart.svg';
import FillHeart from '@assets/images/Fill_Heart.svg';
import Guesthouse_btn from '@assets/images/home_guesthouse.png';
import Employ_btn from '@assets/images/home_employ.png';
import Party_btn from '@assets/images/home_party.png';
import {useNavigation} from '@react-navigation/native';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
const {width} = Dimensions.get('window');

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const renderGuesthouse = ({item}) => (
    <View style={styles.guesthouseCard}>
      <Image source={item.image} style={styles.guesthouseImage} />
      <Text style={[FONTS.fs_body, styles.guesthouseCategory]}>
        {item.category}
      </Text>
      <Text style={[FONTS.fs_body, styles.guesthouseTitle]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[FONTS.fs_body, styles.guesthousePriceName]}>
        최저가{' '}
        <Text style={[FONTS.fs_h2_bold, styles.guesthousePrice]}>
          {item.price}
        </Text>
      </Text>
    </View>
  );

  const renderJob = ({item}) => (
    <View style={styles.jobCard}>
      <Image source={item.image} style={styles.jobImage} />

      <View style={styles.jobInfo}>
        <Text style={[FONTS.fs_body, styles.jobGuesthouse]}>
          {item.guesthouse}
        </Text>{' '}
        {/* 게스트하우스 이름 */}
        <Text style={[FONTS.fs_body_bold, styles.jobTitle]}>
          {item.title}
        </Text>{' '}
        {/* 모집글 제목 */}
        <Text style={[FONTS.fs_body, styles.jobAdress]}>
          {item.location} {item.address}
        </Text>{' '}
        {/* 주소 */}
        <Text style={[FONTS.fs_body, styles.jobSubInfo]}>
          기한 | {item.period}
        </Text>{' '}
        {/* 기한 */}
      </View>

      <View style={styles.jobSide}>
        <Text style={[FONTS.fs_body, styles.jobCount]}>{item.count}</Text>{' '}
        {/* 명수 */}
        {item.isLiked ? (
          <FillHeart width={15} height={15} />
        ) : (
          <EmptyHeart width={15} height={15} />
        )}
        <TouchableOpacity style={styles.applyButton}>
          <Text style={[FONTS.fs_body, styles.applyButtonText]}>지원하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingHorizontal: 20, alignItems: 'center'}}>
      <Header />

      {/* 배너 */}
      <View style={styles.boxContainer}>
        <View style={styles.bannerContainer}>
          <Carousel
            width={width * 0.9}
            height={120}
            data={banners}
            autoPlay
            loop
            scrollAnimationDuration={2000}
            pagingEnabled={false}
            onSnapToItem={index => setCurrentIndex(index)}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 1,
              parallaxScrollingOffset: 50,
            }}
            renderItem={({item}) => (
              <View>
                <Image source={item.image} style={styles.banner} />
              </View>
            )}
          />

          {/* 페이지네이션 인디케이터 */}
          <View style={styles.indicatorRow}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={styles.indicatorDot(currentIndex === index)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* 버튼 */}
      <View style={styles.boxContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('GuesthouseList');
            }}>
            <ImageBackground source={Guesthouse_btn} style={styles.button}>
              <Text style={styles.buttonText}>숙소</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('EmployList');
            }}>
            <ImageBackground source={Employ_btn} style={styles.button}>
              <Text style={styles.buttonText}>일자리</Text>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Meet');
            }}>
            <ImageBackground source={Party_btn} style={styles.button}>
              <Text style={styles.buttonText}>모임</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>

      {/* 인기 게스트하우스 */}
      <View style={styles.boxContainer}>
        <View style={styles.guesthouseContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.sectionTitle}>인기 게스트하우스</Text>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>더보기</Text>
              <Image
                source={Chevron_right_gray}
                style={{width: 20, height: 20}}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={guesthouses}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={renderGuesthouse}
            contentContainerStyle={styles.guesthouseList}
          />
        </View>
      </View>
      <View style={styles.boxContainer}>
        <View style={styles.bottomView}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>
            추천 일자리
          </Text>
          <FlatList
            data={jobs}
            keyExtractor={item => item.id.toString()}
            renderItem={renderJob}
            scrollEnabled={false}
            contentContainerStyle={{paddingBottom: 24}}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
