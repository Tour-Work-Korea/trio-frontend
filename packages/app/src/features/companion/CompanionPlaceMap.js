import React, {useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {NaverMapMarkerOverlay} from '@mj-studio/react-native-naver-map';
import NaverMapView from '@components/LocalizedNaverMapView';
import LocationPinIcon from '@assets/images/map_pin_fill_orange.svg';
import {
  SkeletonPulse,
  SkeletonBlock,
} from '../../screens/_components/ContentSkeleton';

export default function CompanionPlaceMap({
  latitude,
  longitude,
  compact = false,
}) {
  const {t} = useTranslation();
  const [ready, setReady] = useState(Platform.OS === 'web');
  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude)) ||
    Math.abs(Number(latitude)) > 90 ||
    Math.abs(Number(longitude)) > 180
  ) {
    return null;
  }
  const coordinate = {latitude: Number(latitude), longitude: Number(longitude)};
  return (
    <View
      pointerEvents="none"
      style={{
        height: compact ? 130 : 200,
        width: compact ? 220 : '100%',
        maxWidth: '100%',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
      <NaverMapView
        style={StyleSheet.absoluteFill}
        initialCamera={{...coordinate, zoom: 16}}
        onInitialized={() => setReady(true)}>
        <NaverMapMarkerOverlay
          {...coordinate}
          width={32}
          height={40}
          anchor={{x: 0.5, y: 1}}>
          <LocationPinIcon width={32} height={40} />
        </NaverMapMarkerOverlay>
      </NaverMapView>
      {!ready && (
        <SkeletonPulse
          title={t('companion.loading')}
          style={StyleSheet.absoluteFill}>
          <SkeletonBlock
            style={{width: '100%', height: '100%', borderRadius: 12}}
          />
        </SkeletonPulse>
      )}
    </View>
  );
}
