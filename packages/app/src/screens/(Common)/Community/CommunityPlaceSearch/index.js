import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import {StackActions, useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import naverPlaceApi from '@utils/api/naverPlaceApi';
import {normalizePlaceSearchResult} from '@utils/communityLocation';
import styles from './CommunityPlaceSearch.styles';
import LocationPinIcon from '@assets/images/map_pin_fill_orange.svg';
import SearchIcon from '@assets/images/search_gray.svg';
import TargetIcon from '@assets/images/target_black.svg';

const PLACE_SEARCH_MIN_LENGTH = 2;
const PLACE_SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_CAMERA = {
  latitude: 37.5666103,
  longitude: 126.9783882,
  zoom: 15,
};

if (Platform.OS === 'android') {
  Geolocation.setRNConfiguration({
    locationProvider: 'playServices',
    skipPermissionRequests: true,
  });
}

const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    return {granted: true, enableHighAccuracy: true};
  }

  const hasFinePermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  const hasCoarsePermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );

  if (hasFinePermission || hasCoarsePermission) {
    return {
      granted: true,
      enableHighAccuracy: hasFinePermission,
    };
  }

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  const fineGranted =
    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
    PermissionsAndroid.RESULTS.GRANTED;
  const coarseGranted =
    granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
    PermissionsAndroid.RESULTS.GRANTED;

  return {
    granted: fineGranted || coarseGranted,
    enableHighAccuracy: fineGranted,
  };
};

const getCurrentPositionAsync = options =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });

const CommunityPlaceSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {initialQuery = ''} = route.params ?? {};
  const mapRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isCurrentLocationLoading, setIsCurrentLocationLoading] =
    useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const trimmedQuery = query.trim();
  const mapLocation = useMemo(() => {
    const location = selectedResult ?? results[0];

    return Number.isFinite(location?.latitude) &&
      Number.isFinite(location?.longitude)
      ? location
      : null;
  }, [results, selectedResult]);
  const mapFocusLocation = mapLocation ?? currentLocation;
  const camera = mapFocusLocation
    ? {
        latitude: mapFocusLocation.latitude,
        longitude: mapFocusLocation.longitude,
        zoom: 16,
      }
    : DEFAULT_CAMERA;

  useEffect(() => {
    if (trimmedQuery.length < PLACE_SEARCH_MIN_LENGTH) {
      setResults([]);
      setSelectedResult(null);
      setErrorMessage('');
      setIsSearching(false);
      return;
    }

    const searchTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setErrorMessage('');

        const response = await naverPlaceApi.searchLocal({
          query: trimmedQuery,
        });
        const rawResults = response.data?.items ?? [];
        const nextResults = rawResults
          .map(normalizePlaceSearchResult)
          .filter(Boolean);

        setResults(nextResults);
        setSelectedResult(nextResults[0] ?? null);
      } catch (error) {
        console.warn('searchCommunityPlaces 실패:', error);
        setResults([]);
        setSelectedResult(null);
        setErrorMessage(
          error?.message === 'NAVER_SEARCH_CREDENTIALS_MISSING'
            ? '네이버 검색 키가 설정되지 않았어요.'
            : '장소 검색에 실패했어요.',
        );
      } finally {
        setIsSearching(false);
      }
    }, PLACE_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(searchTimer);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!mapLocation) {
      return;
    }

    mapRef.current?.animateCameraTo?.({
      latitude: mapLocation.latitude,
      longitude: mapLocation.longitude,
      zoom: 16,
    });
  }, [mapLocation]);

  const moveToCurrentLocation = async ({showPermissionAlert = false} = {}) => {
    if (isCurrentLocationLoading) {
      return;
    }

    try {
      setIsCurrentLocationLoading(true);
      const permission = await requestLocationPermission();

      if (!permission.granted) {
        if (showPermissionAlert) {
          Alert.alert(
            '위치 권한이 필요해요',
            '현재 위치를 사용하려면 설정에서 위치 접근 권한을 허용해주세요.',
            [
              {text: '취소', style: 'cancel'},
              {text: '설정 열기', onPress: () => Linking.openSettings()},
            ],
          );
        }
        return;
      }

      const position = await getCurrentPositionAsync({
        enableHighAccuracy: permission.enableHighAccuracy,
        timeout: 10000,
        maximumAge: 30000,
      });
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(nextLocation);
      mapRef.current?.animateCameraTo?.({
        ...nextLocation,
        zoom: 16,
      });
    } catch (error) {
      console.warn('community place current location 실패:', error);
      if (showPermissionAlert) {
        Alert.alert('현재 위치를 가져오지 못했어요');
      }
    } finally {
      setIsCurrentLocationLoading(false);
    }
  };

  useEffect(() => {
    moveToCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectLocation = location => {
    Keyboard.dismiss();
    navigation.dispatch(
      StackActions.popTo('CommunityWrite', {selectedLocation: location}),
    );
  };

  const handlePressResult = location => {
    setSelectedResult(location);
    Keyboard.dismiss();
  };

  const renderResults = () => {
    if (trimmedQuery.length < PLACE_SEARCH_MIN_LENGTH) {
      return (
        <Text style={[FONTS.fs_14_regular, styles.guideText]}>
          두 글자 이상 입력해주세요.
        </Text>
      );
    }

    if (isSearching) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#FF6B00" />
        </View>
      );
    }

    if (errorMessage) {
      return (
        <Text style={[FONTS.fs_14_regular, styles.errorText]}>
          {errorMessage}
        </Text>
      );
    }

    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultList}>
        {results.length > 0 ? (
          results.map((item, index) => (
            <TouchableOpacity
              key={`${item.placeName}-${item.roadAddress}-${index}`}
              activeOpacity={0.8}
              style={[
                styles.resultItem,
                selectedResult === item && styles.selectedResultItem,
              ]}
              onPress={() => handlePressResult(item)}>
              <LocationPinIcon width={22} height={22} />
              <View style={styles.resultTextWrap}>
                <Text
                  style={[FONTS.fs_14_medium, styles.resultTitle]}
                  numberOfLines={1}>
                  {item.placeName || '장소명 없음'}
                </Text>
                <Text
                  style={[FONTS.fs_12_medium, styles.resultMeta]}
                  numberOfLines={1}>
                  {[item.category, item.roadAddress || item.address]
                    .filter(Boolean)
                    .join(' · ') || '주소 정보가 없어요'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.selectButton}
                onPress={() => handleSelectLocation(item)}>
                <Text style={[FONTS.fs_14_semibold, styles.selectButtonText]}>
                  선택
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
            검색 결과가 없어요.
          </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="장소 찾기" onPress={() => navigation.goBack()} />
      <View style={styles.inputWrap}>
        <SearchIcon width={18} height={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          style={[FONTS.fs_14_regular, styles.input]}
          placeholder="주소나 장소명으로 검색"
          placeholderTextColor="#9AA1AA"
        />
      </View>

      <View style={styles.mapSection}>
        <NaverMapView
          ref={mapRef}
          style={styles.map}
          initialCamera={camera}>
          {mapLocation ? (
            <NaverMapMarkerOverlay
              latitude={mapLocation.latitude}
              longitude={mapLocation.longitude}
              width={44}
              height={56}
              anchor={{x: 0.5, y: 1}}>
              <LocationPinIcon width={44} height={56} />
            </NaverMapMarkerOverlay>
          ) : null}
          {!mapLocation && currentLocation ? (
            <NaverMapMarkerOverlay
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              width={28}
              height={28}
              anchor={{x: 0.5, y: 0.5}}>
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </NaverMapMarkerOverlay>
          ) : null}
        </NaverMapView>
        {mapLocation ? (
          <View style={styles.mapBubble}>
            <Text style={[FONTS.fs_14_semibold, styles.mapBubbleText]}>
              목록에서 장소를 선택해 주세요
            </Text>
            <View style={styles.mapBubbleTail} />
          </View>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.targetButton}
          onPress={() => {
            moveToCurrentLocation({showPermissionAlert: true});
          }}>
          {isCurrentLocationLoading ? (
            <ActivityIndicator size="small" color="#1C1D1F" />
          ) : (
            <TargetIcon width={22} height={22} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultPanel}>{renderResults()}</View>
    </View>
  );
};

export default CommunityPlaceSearch;
