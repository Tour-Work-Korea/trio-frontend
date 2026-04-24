import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import HomeIcon from '@assets/images/home_white_filled.svg';

const DEFAULT_REGION = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const getMarkerItems = guesthouses =>
  (Array.isArray(guesthouses) ? guesthouses : [])
    .map(item => {
      const latitude = Number(item?.latitude ?? item?.lat);
      const longitude = Number(item?.longitude ?? item?.lng);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        id: item?.id ?? item?.guesthouseId ?? `${latitude}-${longitude}`,
        name: item?.name ?? item?.guesthouseName ?? '게스트하우스',
        coordinate: {
          latitude,
          longitude,
        },
      };
    })
    .filter(Boolean);

const getRegionFromMarkers = markers => {
  if (markers.length === 0) {
    return DEFAULT_REGION;
  }

  if (markers.length === 1) {
    return {
      ...markers[0].coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const latitudes = markers.map(item => item.coordinate.latitude);
  const longitudes = markers.map(item => item.coordinate.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
  };
};

const GuesthouseListMap = ({route}) => {
  const markers = useMemo(
    () => getMarkerItems(route?.params?.guesthouses),
    [route?.params?.guesthouses],
  );
  const initialRegion = useMemo(() => getRegionFromMarkers(markers), [markers]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="게스트하우스 지도" />
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={initialRegion}>
          {markers.map(item => (
            <Marker
              key={String(item.id)}
              coordinate={item.coordinate}
              title={item.name}>
              <View style={styles.markerContainer}>
                <View style={styles.homeMarker}>
                  <HomeIcon width={20} height={20} />
                </View>
                <View style={styles.markerTail} />
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.summaryCard}>
          <Text style={[FONTS.fs_14_medium, styles.summaryTitle]}>
            지도에 표시된 숙소
          </Text>
          <Text style={[FONTS.fs_16_semibold, styles.summaryCount]}>
            {markers.length}개
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GuesthouseListMap;

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
  summaryCard: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: COLORS.grayscale_900,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    color: COLORS.grayscale_600,
  },
  summaryCount: {
    color: COLORS.grayscale_900,
  },
  markerContainer: {
    alignItems: 'center',
  },
  homeMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
