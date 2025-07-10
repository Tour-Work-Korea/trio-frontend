import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native'; 

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

import LeftChevron from '@assets/images/chevron_left_black.svg';

const GuesthouseMap = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const requestLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('위치 권한 거부됨');
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (pos) => {
          console.log('현재 위치', pos.coords);
          setRegion({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          });
        },
        (err) => {
          console.log('위치 에러', err);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    };
    requestLocation();
  }, []);

  if (!region) return <View style={styles.loading}><Text>위치 로딩중...</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
      >
        <Marker coordinate={region}>
          <View style={styles.priceMarker}>
            <Text style={[FONTS.fs_14_medium, styles.priceText]}>₩10,000</Text>
          </View>
        </Marker>
      </MapView>

      <View style={styles.mapButtonContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
          navigation.goBack();
          }}
        >
          <LeftChevron width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.mapButtonText]}>카테고리로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuesthouseMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceMarker: {
    backgroundColor: COLORS.primary_orange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  priceText: {
    color: COLORS.grayscale_0,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapButtonText: {
    marginLeft: 8,
    color: COLORS.grayscale_800,
  },
});
