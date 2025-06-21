import React, {useState} from 'react';
import {View, Image, Dimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styles from './Home.styles';

const {width} = Dimensions.get('window');
export default function Banner({banners}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
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
  );
}
