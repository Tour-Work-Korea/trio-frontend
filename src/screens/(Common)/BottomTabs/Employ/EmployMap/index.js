import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import LeftChevron from '@assets/images/chevron_left_black.svg';

const EmployMap = () => {
  const navigation = useNavigation();

  // 제주도 내 임의 좌표 두 개
  const marker1 = {latitude: 33.499621, longitude: 126.531188};

  // 랜더링 될 때 기준 좌표
  const region = {
    // 좌표
    latitude: 33.4999,
    longitude: 126.53,
    // 줌 레벨
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={{flex: 1}}>
      <MapView style={styles.map} region={region}>
        {/* 공고 마커 */}
        <Marker coordinate={marker1}>
          <View style={styles.priceMarker}>
            <Text style={[FONTS.fs_14_medium, styles.priceText]}>
              게스트하우스 이름
            </Text>
          </View>
        </Marker>
      </MapView>

      <View style={styles.mapButtonContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <LeftChevron width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>
            돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmployMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  // 가격 마커
  priceMarker: {
    backgroundColor: COLORS.primary_orange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  priceText: {
    color: COLORS.grayscale_0,
  },

  // 마감 마커
  closedMarker: {
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
  },
  closedText: {
    color: COLORS.grayscale_500,
  },

  // 돌아가기 버튼
  mapButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    padding: 10,
    borderRadius: 12,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapButtonText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
});
