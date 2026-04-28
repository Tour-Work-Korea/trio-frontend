import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  PanResponder,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {
  getGuesthouseMapBoundsByRegionIds,
  getMapRegionFromBounds,
} from '@constants/guesthouseMapRegions';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import {trimJejuPrefix} from '@utils/formatAddress';

import HomeIcon from '@assets/images/home_white_filled.svg';
import TargetIcon from '@assets/images/target_black.svg';
import FillHeart from '@assets/images/heart_filled.svg';
import EmptyHeart from '@assets/images/heart_empty.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ListIcon from '@assets/images/bullet_list_black.svg';
import styles from './GuesthouseListMap.styles';

const DEFAULT_REGION = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};
const CLUSTER_DISTANCE_PX = 28;

const normalizeGuesthouses = guesthouses =>
  (Array.isArray(guesthouses) ? guesthouses : []).map(item => ({
    ...item,
    guesthouseId: item?.guesthouseId ?? item?.id,
    lat: Number(item?.lat ?? item?.latitude),
    lng: Number(item?.lng ?? item?.longitude),
    isLiked: Boolean(item?.isLiked ?? item?.isFavorite),
  }));

const getGuesthouseResponseItems = data => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.guesthouses)) {
    return data.guesthouses;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  if (Array.isArray(data?.data?.guesthouses)) {
    return data.data.guesthouses;
  }

  return [];
};

const getGuesthouseImageUrls = item => {
  const imageUrls = Array.isArray(item?.guesthouseImages)
    ? item.guesthouseImages
      .map(image => image?.guesthouseImageUrl)
      .filter(Boolean)
    : [];

  if (imageUrls.length > 0) {
    return imageUrls;
  }

  return item?.thumbnailImgUrl ? [item.thumbnailImgUrl] : [];
};

const getRegionFromGuesthouses = guesthouses => {
  const validItems = guesthouses.filter(
    item => Number.isFinite(item.lat) && Number.isFinite(item.lng),
  );

  if (validItems.length === 0) {
    return DEFAULT_REGION;
  }

  if (validItems.length === 1) {
    return {
      latitude: validItems[0].lat,
      longitude: validItems[0].lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const latitudes = validItems.map(item => item.lat);
  const longitudes = validItems.map(item => item.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.03),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.03),
  };
};

const getBoundsCenter = bounds => ({
  lat: (bounds.swLat + bounds.neLat) / 2,
  lng: (bounds.swLng + bounds.neLng) / 2,
});

const shouldSuggestResearch = (nextBounds, prevBounds) => {
  if (!nextBounds || !prevBounds) {
    return false;
  }

  const nextCenter = getBoundsCenter(nextBounds);
  const prevCenter = getBoundsCenter(prevBounds);

  const latSpan = Math.abs(prevBounds.neLat - prevBounds.swLat);
  const lngSpan = Math.abs(prevBounds.neLng - prevBounds.swLng);

  return (
    Math.abs(nextCenter.lat - prevCenter.lat) > Math.max(latSpan * 0.18, 0.002)
    || Math.abs(nextCenter.lng - prevCenter.lng) > Math.max(lngSpan * 0.18, 0.002)
  );
};

const getPriceLabel = item => {
  if (item?.isReserved || item?.minPrice == null) {
    return '예약마감';
  }

  return `${Number(item.minPrice).toLocaleString()}원`;
};

const getClusterKey = items =>
  items
    .map(item => String(item.id ?? item.guesthouseId))
    .sort()
    .join(':');

const groupGuesthouses = (guesthouses, region, mapSize) => {
  const map = new Map();

  if (
    !region
    || !mapSize?.width
    || !mapSize?.height
    || !Number.isFinite(region.latitudeDelta)
    || !Number.isFinite(region.longitudeDelta)
  ) {
    guesthouses.forEach(item => {
      if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) {
        return;
      }

      const key = `${item.lat.toFixed(6)}:${item.lng.toFixed(6)}`;
      const current = map.get(key);

      if (current) {
        current.items.push(item);
        return;
      }

      map.set(key, {
        key,
        coordinate: {
          latitude: item.lat,
          longitude: item.lng,
        },
        items: [item],
      });
    });

    return Array.from(map.values()).map(group => {
      const sortedItems = [...group.items].sort((a, b) => {
        if (a.minPrice == null && b.minPrice == null) {
          return 0;
        }
        if (a.minPrice == null) {
          return 1;
        }
        if (b.minPrice == null) {
          return -1;
        }
        return a.minPrice - b.minPrice;
      });

      return {
        ...group,
        key: getClusterKey(group.items),
        count: group.items.length,
        primaryItem: sortedItems[0] ?? group.items[0],
      };
    });
  }

  const longitudeDelta = Math.max(region.longitudeDelta, 0.000001);
  const latitudeDelta = Math.max(region.latitudeDelta, 0.000001);

  const projectPoint = item => ({
    x:
      ((item.lng - (region.longitude - longitudeDelta / 2)) / longitudeDelta)
      * mapSize.width,
    y:
      (((region.latitude + latitudeDelta / 2) - item.lat) / latitudeDelta)
      * mapSize.height,
  });

  const visibleItems = guesthouses.filter(
    item => Number.isFinite(item.lat) && Number.isFinite(item.lng),
  );
  const clusters = [];

  visibleItems.forEach(item => {
    const point = projectPoint(item);
    let matchedCluster = null;

    for (const cluster of clusters) {
      const dx = cluster.screenX - point.x;
      const dy = cluster.screenY - point.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= CLUSTER_DISTANCE_PX) {
        matchedCluster = cluster;
        break;
      }
    }

    if (!matchedCluster) {
      clusters.push({
        items: [item],
        screenX: point.x,
        screenY: point.y,
        latSum: item.lat,
        lngSum: item.lng,
      });
      return;
    }

    matchedCluster.items.push(item);
    matchedCluster.latSum += item.lat;
    matchedCluster.lngSum += item.lng;

    const count = matchedCluster.items.length;
    matchedCluster.screenX =
      ((matchedCluster.screenX * (count - 1)) + point.x) / count;
    matchedCluster.screenY =
      ((matchedCluster.screenY * (count - 1)) + point.y) / count;
  });

  return clusters.map(group => {
    const sortedItems = [...group.items].sort((a, b) => {
      if (a.minPrice == null && b.minPrice == null) {
        return 0;
      }
      if (a.minPrice == null) {
        return 1;
      }
      if (b.minPrice == null) {
        return -1;
      }
      return a.minPrice - b.minPrice;
    });

    return {
      key: getClusterKey(group.items),
      coordinate: {
        latitude: group.latSum / group.items.length,
        longitude: group.lngSum / group.items.length,
      },
      items: group.items,
      count: group.items.length,
      primaryItem: sortedItems[0] ?? group.items[0],
    };
  });
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization?.('whenInUse');
    return status === 'granted';
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const GuesthouseListMap = ({
  route,
  guesthouses,
  embedded = false,
  checkIn: checkInProp,
  checkOut: checkOutProp,
  guestCount: guestCountProp,
  regionIds: regionIdsProp,
  regionBounds: regionBoundsProp,
  onPressListToggle,
}) => {
  const navigation = useNavigation();
  const lastCenteredGuesthouseIdRef = useRef(null);
  const initialPresetFetchDoneRef = useRef(false);
  const sourceGuesthouses = useMemo(
    () => normalizeGuesthouses(guesthouses ?? route?.params?.guesthouses),
    [guesthouses, route?.params?.guesthouses],
  );
  const checkIn = checkInProp ?? route?.params?.checkIn;
  const checkOut = checkOutProp ?? route?.params?.checkOut;
  const guestCount = guestCountProp ?? route?.params?.guestCount ?? 1;
  const regionIds = useMemo(
    () => regionIdsProp ?? route?.params?.regionIds ?? [],
    [regionIdsProp, route?.params?.regionIds],
  );
  const presetBounds = useMemo(
    () =>
      regionBoundsProp
        ?? route?.params?.regionBounds
        ?? getGuesthouseMapBoundsByRegionIds(regionIds),
    [regionBoundsProp, route?.params?.regionBounds, regionIds],
  );
  const presetRegion = useMemo(
    () => getMapRegionFromBounds(presetBounds),
    [presetBounds],
  );

  const mapRef = useRef(null);
  const initialRegion = useMemo(
    () => presetRegion ?? getRegionFromGuesthouses(sourceGuesthouses),
    [presetRegion, sourceGuesthouses],
  );

  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapGuesthouses, setMapGuesthouses] = useState(sourceGuesthouses);
  const [selectedClusterKey, setSelectedClusterKey] = useState(null);
  const [selectedGuesthouseId, setSelectedGuesthouseId] = useState(null);
  const [pendingBounds, setPendingBounds] = useState(null);
  const [lastFetchedBounds, setLastFetchedBounds] = useState(null);
  const [hasFetchedMapGuesthouses, setHasFetchedMapGuesthouses] = useState(false);
  const [showResearchButton, setShowResearchButton] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(initialRegion);
  const [mapSize, setMapSize] = useState({width: 0, height: 0});

  const clusters = useMemo(
    () => groupGuesthouses(mapGuesthouses, currentRegion, mapSize),
    [mapGuesthouses, currentRegion, mapSize],
  );

  const selectedCluster = useMemo(
    () => clusters.find(item => item.key === selectedClusterKey) ?? null,
    [clusters, selectedClusterKey],
  );
  const orderedClusters = useMemo(() => {
    if (!selectedClusterKey) {
      return clusters;
    }

    const normalClusters = clusters.filter(
      item => item.key !== selectedClusterKey,
    );
    const activeCluster = clusters.find(
      item => item.key === selectedClusterKey,
    );

    return activeCluster
      ? [...normalClusters, activeCluster]
      : clusters;
  }, [clusters, selectedClusterKey]);
  const selectedItem = useMemo(() => {
    if (!selectedCluster) {
      return null;
    }

    return (
      selectedCluster.items.find(
        item => String(item.id) === String(selectedGuesthouseId),
      )
      ?? selectedCluster.primaryItem
      ?? null
    );
  }, [selectedCluster, selectedGuesthouseId]);
  const selectedItemIndex = useMemo(() => {
    if (!selectedCluster || !selectedItem) {
      return -1;
    }

    return selectedCluster.items.findIndex(
      item => String(item.id) === String(selectedItem.id),
    );
  }, [selectedCluster, selectedItem]);
  const selectedGlobalIndex = useMemo(() => {
    if (!selectedItem) {
      return -1;
    }

    return mapGuesthouses.findIndex(
      item => String(item.id) === String(selectedItem.id),
    );
  }, [mapGuesthouses, selectedItem]);

  useEffect(() => {
    setMapGuesthouses(sourceGuesthouses);
  }, [sourceGuesthouses]);

  useEffect(() => {
    setCurrentRegion(initialRegion);
  }, [initialRegion]);

  useEffect(() => {
    if (!selectedClusterKey) {
      return;
    }

    if (clusters.some(item => item.key === selectedClusterKey)) {
      return;
    }

    const nextCluster = clusters.find(item =>
      item.items.some(
        guesthouse => String(guesthouse.id) === String(selectedGuesthouseId),
      ),
    );

    if (nextCluster) {
      setSelectedClusterKey(nextCluster.key);
      return;
    }

    setSelectedClusterKey(null);
    setSelectedGuesthouseId(null);
  }, [clusters, selectedClusterKey, selectedGuesthouseId]);

  useEffect(() => {
    if (!selectedCluster) {
      setSelectedGuesthouseId(null);
      return;
    }

    const hasSelectedGuesthouse = selectedCluster.items.some(
      item => String(item.id) === String(selectedGuesthouseId),
    );

    if (!hasSelectedGuesthouse) {
      setSelectedGuesthouseId(selectedCluster.primaryItem?.id ?? null);
    }
  }, [selectedCluster, selectedGuesthouseId]);

  useEffect(() => {
    initialPresetFetchDoneRef.current = false;
    setHasFetchedMapGuesthouses(false);
  }, [presetBounds]);

  const getCurrentBounds = useCallback(async () => {
    const boundaries = await mapRef.current?.getMapBoundaries?.();

    if (!boundaries?.northEast || !boundaries?.southWest) {
      return null;
    }

    const swLat = Math.min(
      boundaries.southWest.latitude,
      boundaries.northEast.latitude,
    );
    const neLat = Math.max(
      boundaries.southWest.latitude,
      boundaries.northEast.latitude,
    );
    const swLng = Math.min(
      boundaries.southWest.longitude,
      boundaries.northEast.longitude,
    );
    const neLng = Math.max(
      boundaries.southWest.longitude,
      boundaries.northEast.longitude,
    );

    return {
      swLat,
      swLng,
      neLat,
      neLng,
    };
  }, []);

  const fetchMapGuesthouses = useCallback(async bounds => {
    if (!checkIn || !checkOut || !bounds) {
      return;
    }

    setLoading(true);

    try {
      const response = await userGuesthouseApi.getGuesthouseMap({
        checkIn,
        checkOut,
        guestCount,
        ...bounds,
      });

      const responseData = response?.data;
      const nextGuesthouses = normalizeGuesthouses(
        getGuesthouseResponseItems(responseData),
      );

      setMapGuesthouses(nextGuesthouses);
      setLastFetchedBounds(bounds);
      setHasFetchedMapGuesthouses(true);
      setPendingBounds(null);
      setShowResearchButton(false);
    } catch (error) {
      console.warn('지도 게스트하우스 조회 실패', error);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guestCount]);

  const fetchUsingCurrentBounds = useCallback(async () => {
    const bounds =
      !initialPresetFetchDoneRef.current && presetBounds
        ? presetBounds
        : await getCurrentBounds();

    if (!bounds) {
      return;
    }

    initialPresetFetchDoneRef.current = true;
    await fetchMapGuesthouses(bounds);
  }, [fetchMapGuesthouses, getCurrentBounds, presetBounds]);

  useEffect(() => {
    if (!mapReady || !checkIn || !checkOut) {
      return;
    }

    fetchUsingCurrentBounds();
  }, [mapReady, checkIn, checkOut, guestCount, fetchUsingCurrentBounds]);

  const handleRegionChangeComplete = useCallback(async region => {
    setCurrentRegion(region);

    const bounds = await getCurrentBounds();

    if (!bounds || !lastFetchedBounds) {
      return;
    }

    if (shouldSuggestResearch(bounds, lastFetchedBounds)) {
      setPendingBounds(bounds);
      setShowResearchButton(true);
      return;
    }

    setPendingBounds(null);
    setShowResearchButton(false);
  }, [getCurrentBounds, lastFetchedBounds]);

  const handleMapLayout = useCallback(event => {
    const {width, height} = event.nativeEvent.layout;

    setMapSize(prev =>
      prev.width === width && prev.height === height
        ? prev
        : {width, height},
    );
  }, []);

  const moveToCurrentLocation = useCallback(async () => {
    const granted = await requestLocationPermission();

    if (!granted) {
      Alert.alert('위치 권한이 필요해요');
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const nextRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };

        setCurrentRegion(nextRegion);
        handleClearSelection();

        mapRef.current?.animateCamera?.(
          {
            center: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            zoom: 14,
          },
          {duration: 400},
        );

        mapRef.current?.animateToRegion(nextRegion, 400);
      },
      error => {
        console.warn('현재 위치 조회 실패', error);
        Alert.alert('현재 위치를 가져오지 못했어요');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      },
    );
  }, [handleClearSelection]);

  const handleClearSelection = useCallback(() => {
    setSelectedClusterKey(null);
    setSelectedGuesthouseId(null);
  }, []);

  const handleMapPress = useCallback(event => {
    if (event?.nativeEvent?.action === 'marker-press') {
      return;
    }

    handleClearSelection();
  }, [handleClearSelection]);

  const handlePressMarker = useCallback(cluster => {
    setSelectedClusterKey(cluster.key);
    setSelectedGuesthouseId(cluster.primaryItem?.id ?? null);
  }, []);

  const handlePressPrevCard = useCallback(() => {
    if (!selectedCluster || selectedCluster.items.length <= 1) {
      return;
    }

    const nextIndex =
      selectedItemIndex <= 0
        ? selectedCluster.items.length - 1
        : selectedItemIndex - 1;

    setSelectedGuesthouseId(selectedCluster.items[nextIndex]?.id ?? null);
  }, [selectedCluster, selectedItemIndex]);

  const handlePressNextCard = useCallback(() => {
    if (!selectedCluster || selectedCluster.items.length <= 1) {
      return;
    }

    const nextIndex =
      selectedItemIndex >= selectedCluster.items.length - 1
        ? 0
        : selectedItemIndex + 1;

    setSelectedGuesthouseId(selectedCluster.items[nextIndex]?.id ?? null);
  }, [selectedCluster, selectedItemIndex]);

  const handleSelectGuesthouseFromGlobalList = useCallback(guesthouse => {
    if (!guesthouse) {
      return;
    }

    setSelectedGuesthouseId(guesthouse.id);

    const nextCluster = clusters.find(cluster =>
      cluster.items.some(item => String(item.id) === String(guesthouse.id)),
    );

    setSelectedClusterKey(nextCluster?.key ?? null);
  }, [clusters]);

  const handleSwipePrevCard = useCallback(() => {
    if (mapGuesthouses.length <= 1 || selectedGlobalIndex < 0) {
      return;
    }

    const nextIndex =
      selectedGlobalIndex <= 0
        ? mapGuesthouses.length - 1
        : selectedGlobalIndex - 1;

    handleSelectGuesthouseFromGlobalList(mapGuesthouses[nextIndex]);
  }, [handleSelectGuesthouseFromGlobalList, mapGuesthouses, selectedGlobalIndex]);

  const handleSwipeNextCard = useCallback(() => {
    if (mapGuesthouses.length <= 1 || selectedGlobalIndex < 0) {
      return;
    }

    const nextIndex =
      selectedGlobalIndex >= mapGuesthouses.length - 1
        ? 0
        : selectedGlobalIndex + 1;

    handleSelectGuesthouseFromGlobalList(mapGuesthouses[nextIndex]);
  }, [handleSelectGuesthouseFromGlobalList, mapGuesthouses, selectedGlobalIndex]);

  const centerToGuesthouse = useCallback(guesthouse => {
    if (
      !mapRef.current
      || !guesthouse
      || !Number.isFinite(guesthouse.lat)
      || !Number.isFinite(guesthouse.lng)
    ) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: guesthouse.lat,
        longitude: guesthouse.lng,
        latitudeDelta: currentRegion?.latitudeDelta ?? DEFAULT_REGION.latitudeDelta,
        longitudeDelta:
          currentRegion?.longitudeDelta ?? DEFAULT_REGION.longitudeDelta,
      },
      280,
    );
  }, [currentRegion]);

  useEffect(() => {
    if (!mapReady || !selectedItem || !selectedGuesthouseId) {
      lastCenteredGuesthouseIdRef.current = null;
      return;
    }

    if (lastCenteredGuesthouseIdRef.current === selectedGuesthouseId) {
      return;
    }

    lastCenteredGuesthouseIdRef.current = selectedGuesthouseId;
    centerToGuesthouse(selectedItem);
  }, [mapReady, selectedGuesthouseId, selectedItem, centerToGuesthouse]);

  const cardPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12
          && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12
          && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -50) {
            handleSwipeNextCard();
            return;
          }

          if (gestureState.dx >= 50) {
            handleSwipePrevCard();
          }
        },
      }),
    [handleSwipeNextCard, handleSwipePrevCard],
  );

  const handlePressCard = useCallback(() => {
    if (!selectedItem) {
      return;
    }

    navigation.navigate('GuesthouseDetail', {
      id: selectedItem.id,
      checkIn,
      checkOut,
      guestCount,
      onLikeChange: (id, nextIsLiked) => {
        setMapGuesthouses(prev =>
          prev.map(item =>
            String(item.id ?? item.guesthouseId) === String(id)
              ? {
                ...item,
                isLiked: nextIsLiked,
                isFavorite: nextIsLiked,
              }
              : item,
          ),
        );
      },
    });
  }, [navigation, selectedItem, checkIn, checkOut, guestCount]);

  const handleToggleFavorite = useCallback(() => {
    if (!selectedItem) {
      return;
    }

    toggleFavorite({
      type: 'guesthouse',
      id: selectedItem.id,
      isLiked: selectedItem.isLiked,
      setList: setMapGuesthouses,
    });
  }, [selectedItem]);

  return (
    <View style={styles.container}>
      {!embedded && (
        <View style={styles.headerContainer}>
          <Header title="게스트하우스 지도" showBackButton={false} />
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onLayout={handleMapLayout}
          onMapReady={() => setMapReady(true)}
          onPanDrag={handleClearSelection}
          onPress={handleMapPress}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}>
          {orderedClusters.map(cluster => {
            const isSelected = cluster.key === selectedCluster?.key;

            return (
              <Marker
                key={cluster.key}
                coordinate={cluster.coordinate}
                anchor={{x: 0.5, y: 1}}
                zIndex={isSelected ? 999 : 1}>
                <View style={styles.markerWrap} pointerEvents="box-none">
                  <View style={styles.markerBubbleOverlay}>
                    {isSelected && (
                      <View style={styles.markerBubble}>
                        {cluster.count > 1 ? (
                          <View style={styles.clusterList}>
                            {cluster.items.map(item => (
                              <View
                                key={String(item.id)}
                                style={styles.clusterListItem}>
                                <View style={styles.clusterListIcon}>
                                  <HomeIcon width={10} height={10} />
                                </View>
                                <Text
                                  numberOfLines={1}
                                  style={[FONTS.fs_12_medium, styles.clusterListName]}>
                                  {item.name}
                                </Text>
                                <Text
                                  style={[FONTS.fs_12_medium, styles.clusterListPrice]}>
                                  {getPriceLabel(item)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={styles.singleMarkerContent}>
                            <View style={styles.homeMarker}>
                              <HomeIcon width={18} height={18} />
                            </View>
                            <View style={styles.singleMarkerTextWrap}>
                              <Text
                                numberOfLines={1}
                                style={[FONTS.fs_12_medium, styles.singleMarkerName]}>
                                {cluster.primaryItem.name}
                              </Text>
                              <Text
                                style={[FONTS.fs_12_medium, styles.singleMarkerPrice]}>
                                {getPriceLabel(cluster.primaryItem)}
                              </Text>
                            </View>
                          </View>
                        )}
                        <View style={styles.markerBubbleTail} />
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.markerContainer}
                    onPress={() => handlePressMarker(cluster)}>
                    {isSelected ? (
                      <View style={styles.selectedMarkerDot} />
                    ) : (
                      <View style={styles.homeMarker}>
                        <HomeIcon width={18} height={18} />
                      </View>
                    )}
                    {!isSelected && cluster.count > 1 && (
                      <View style={styles.markerCountBadge}>
                        <Text
                          style={[FONTS.fs_12_medium, styles.markerCountText]}>
                          {cluster.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {showResearchButton && (
          <View style={styles.researchButtonContainer}>
            <TouchableOpacity
              style={styles.researchButton}
              onPress={() => fetchMapGuesthouses(pendingBounds)}>
              <Text style={[FONTS.fs_12_medium, styles.researchButtonText]}>
                이 지역 다시 검색
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!selectedItem && (
          <View style={styles.bottomControlRow}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={moveToCurrentLocation}>
              <TargetIcon width={20} height={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listToggleButton}
              onPress={onPressListToggle}>
              <ListIcon width={20} height={20} />
              <Text style={[FONTS.fs_14_medium, styles.listToggleButtonText]}>
                목록
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={COLORS.primary_orange} />
          </View>
        )}

        {!loading && hasFetchedMapGuesthouses && clusters.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={[FONTS.fs_14_medium, styles.emptyTitle]}>
              이 지도 영역에는 조건에 맞는 숙소가 없어요
            </Text>
          </View>
        )}

        {!loading && selectedItem && (
          <View style={styles.cardArea}>
            <View style={styles.cardTopControlRow}>
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={moveToCurrentLocation}>
                <TargetIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.listToggleButton}
                onPress={onPressListToggle}>
                <ListIcon width={20} height={20} />
                <Text style={[FONTS.fs_14_medium, styles.listToggleButtonText]}>
                  목록
                </Text>
              </TouchableOpacity>
            </View>
            {selectedCluster?.count > 1 && (
              <View style={styles.cardSwitchContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.cardSwitchButton}
                  onPress={handlePressPrevCard}>
                  <ChevronLeft width={16} height={16} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.cardSwitchButton}
                  onPress={handlePressNextCard}>
                  <ChevronRight width={16} height={16} />
                </TouchableOpacity>
              </View>
            )}
            <View {...cardPanResponder.panHandlers}>
              <TouchableOpacity
                activeOpacity={0.92}
                style={styles.detailCard}
                onPress={handlePressCard}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailWrap}>
                    <Text
                      numberOfLines={1}
                      style={[FONTS.fs_18_semibold, styles.detailTitle]}>
                      {selectedItem.name}
                    </Text>
                    <TouchableOpacity
                      hitSlop={8}
                      style={styles.favoriteButton}
                      onPress={event => {
                        event.stopPropagation?.();
                        handleToggleFavorite();
                      }}>
                      {selectedItem.isLiked ? (
                        <FillHeart width={20} height={20} />
                      ) : (
                        <EmptyHeart width={20} height={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.detailWrap}>
                    <Text
                      numberOfLines={1}
                      style={[FONTS.fs_12_medium, styles.detailAddress]}>
                      {trimJejuPrefix(selectedItem.address)}
                    </Text>
                    <Text style={[FONTS.fs_18_semibold, styles.detailPrice]}>
                      {selectedItem.isReserved || selectedItem.minPrice == null
                        ? '예약마감'
                        : `${selectedItem.minPrice.toLocaleString()}원 ~`}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  {(selectedItem.hashtags ?? []).slice(0, 3).map((tag, index) => (
                    <View key={`${tag}-${index}`} style={styles.tagChip}>
                      <Text style={[FONTS.fs_12_medium, styles.tagText]}>{tag}</Text>
                    </View>
                  ))}
                </View>

              <View style={styles.imageRow}>
                {getGuesthouseImageUrls(selectedItem).length > 0 ? (
                  <Image
                    source={{uri: getGuesthouseImageUrls(selectedItem)[0]}}
                    style={styles.detailImage}
                  />
                ) : (
                  <View style={[styles.detailImage, styles.detailImagePlaceholder]} />
                )}
              </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default GuesthouseListMap;
