import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {formatGuesthouseAddress} from '@utils/formatAddress';

import CopyIcon from '@assets/images/copy_fill_black.svg';
import LocationPinIcon from '@assets/images/map_pin_fill_orange.svg';

const DEFAULT_COORDINATE = {
  latitude: 37.5666103,
  longitude: 126.9783882,
};

const CommunityLocationMap = ({route}) => {
  const {
    placeName,
    address,
    roadAddress,
    addressDetail,
    latitude,
    longitude,
    lat,
    lng,
  } = route?.params ?? {};

  const parsedLat = Number(latitude ?? lat);
  const parsedLng = Number(longitude ?? lng);
  const hasCoordinate = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  const coordinate = hasCoordinate
    ? {latitude: parsedLat, longitude: parsedLng}
    : DEFAULT_COORDINATE;
  const displayAddress =
    formatGuesthouseAddress(roadAddress || address, addressDetail) ||
    roadAddress ||
    address;

  const handleCopyAddress = () => {
    if (!displayAddress) {
      return;
    }

    Clipboard.setString(displayAddress);
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
        <Header title={placeName || '장소 위치'} />
      </View>

      <View style={styles.mapContainer}>
        <NaverMapView
          style={styles.map}
          initialCamera={{
            ...coordinate,
            zoom: 16,
          }}>
          {hasCoordinate ? (
            <NaverMapMarkerOverlay
              latitude={coordinate.latitude}
              longitude={coordinate.longitude}
              width={44}
              height={56}
              anchor={{x: 0.5, y: 1}}>
              <LocationPinIcon width={44} height={56} />
            </NaverMapMarkerOverlay>
          ) : null}
        </NaverMapView>

        <TouchableOpacity
          activeOpacity={1}
          style={styles.addressCard}
          onPress={handleCopyAddress}>
          <CopyIcon width={24} height={24} />
          <View style={styles.addressTextWrap}>
            <Text
              style={[FONTS.fs_16_medium, styles.placeName]}
              numberOfLines={1}>
              {placeName || '장소 위치'}
            </Text>
            <Text
              style={[FONTS.fs_14_regular, styles.addressText]}
              numberOfLines={1}>
              {displayAddress || '주소 정보가 없어요'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunityLocationMap;

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
    left: 24,
    right: 24,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
    borderRadius: 12,
  },
  addressTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  placeName: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  addressText: {
    color: COLORS.grayscale_500,
  },
});
