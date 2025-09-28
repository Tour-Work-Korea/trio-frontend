import React, {useState, useCallback} from 'react';
import {View, Image, Dimensions, TouchableOpacity, Linking} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styles from './Home.styles';

const {width} = Dimensions.get('window');

export default function Banner({banners = []}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!banners.length) return null;

  // 각 배너 연결된 링크 열기
  const openBannerLink = useCallback(async (url) => {
    if (!url || typeof url !== 'string') return;
    const safeUrl = url.trim();
    // http/https 만 허용
    if (!/^https?:\/\//i.test(safeUrl)) return;
    try {
      const can = await Linking.canOpenURL(safeUrl);
      if (can) await Linking.openURL(safeUrl);
    } catch {
      // 실패하면 무시
      console.warn('링크 없음');
    }
  }, []);

  return (
    <View style={styles.bannerContainer}>
      <Carousel
        width={width * 0.9}
        height={120}
        data={banners}
        autoPlay
        loop
        scrollAnimationDuration={3000}
        pagingEnabled={false}
        onSnapToItem={index => setCurrentIndex(index)}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 1,
          parallaxScrollingOffset: 50,
        }}
        renderItem={({item, index}) => {
          const src = item.url;
          if (!src) return <View key={index} style={styles.banner} />;
          return (
            <TouchableOpacity
              key={item?.id ?? index}
              activeOpacity={0.9}
              onPress={() => openBannerLink(item?.link)}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.banner}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        }}
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
