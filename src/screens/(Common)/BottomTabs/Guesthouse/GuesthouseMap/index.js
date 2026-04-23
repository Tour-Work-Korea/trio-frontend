import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';

import CopyIcon from '@assets/images/copy_fill_black.svg';
import HomeIcon from '@assets/images/home_white_filled.svg';

const DEFAULT_COORDINATE = {
  latitude: 33.4999,
  longitude: 126.53,
};

const GuesthouseMap = ({route}) => {
  const {
    guesthouseName,
    guesthouseAddress,
    latitude,
    longitude,
  } = route?.params ?? {};

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasCoordinate = Number.isFinite(lat) && Number.isFinite(lng);
  const coordinate = hasCoordinate
    ? {latitude: lat, longitude: lng}
    : DEFAULT_COORDINATE;

  const region = {
    ...coordinate,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  };

  const handleCopyAddress = () => {
    if (!guesthouseAddress) {
      return;
    }

    Clipboard.setString(guesthouseAddress);
    Toast.show({
      type: 'success',
      text1: '주소를 복사했어요!',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title={guesthouseName || '게스트하우스 위치'} />
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={region}>
          {hasCoordinate && (
            <Marker coordinate={coordinate}>
              <View style={styles.markerContainer}>
                <View style={styles.homeMarker}>
                  <HomeIcon width={24} height={24} />
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addressCard}
          onPress={handleCopyAddress}
        >
          <CopyIcon width={24} height={24} />
          <Text
            style={[FONTS.fs_16_medium, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {guesthouseAddress || '주소 정보가 없어요'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuesthouseMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  headerContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    zIndex: 2,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  addressCard: {
    position: 'absolute',
    top: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 50,
  },
  addressText: {
    flex: 1,
    color: COLORS.grayscale_800,
  },
  markerContainer: {
    alignItems: 'center',
  },
  homeMarker: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.grayscale_0,
  },
  markerTail: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary_orange,
    marginTop: 4,
  },
});
