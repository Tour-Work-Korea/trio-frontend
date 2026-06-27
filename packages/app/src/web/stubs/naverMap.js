import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NAVER_CLIENT_ID} from '@env';

const MapContext = createContext(null);
let naverMapsPromise = null;
const CLICK_SUPPRESSION_MS = 450;
const DRAG_THRESHOLD_PX = 2;
const WHEEL_SUPPRESSION_MS = 650;
let globalSuppressClickUntil = 0;

const suppressMapClicks = (duration = CLICK_SUPPRESSION_MS) => {
  globalSuppressClickUntil = Date.now() + duration;
};

const shouldSuppressMapClick = () => Date.now() < globalSuppressClickUntil;

const loadNaverMaps = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Naver Maps is only available in browser'));
  }

  if (window.naver?.maps) {
    return Promise.resolve(window.naver.maps);
  }

  if (naverMapsPromise) {
    return naverMapsPromise;
  }

  naverMapsPromise = new Promise((resolve, reject) => {
    if (!NAVER_CLIENT_ID) {
      reject(new Error('NAVER_CLIENT_ID is missing'));
      return;
    }

    const existingScript = document.querySelector('[data-trio-naver-map]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.naver.maps));
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.trioNaverMap = 'true';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      NAVER_CLIENT_ID,
    )}`;
    script.onload = () => resolve(window.naver.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return naverMapsPromise;
};

const getCenterFromProps = ({initialCamera, initialRegion}) => {
  if (initialCamera?.latitude && initialCamera?.longitude) {
    return {
      latitude: initialCamera.latitude,
      longitude: initialCamera.longitude,
      zoom: initialCamera.zoom ?? 15,
    };
  }

  if (initialRegion?.latitude && initialRegion?.longitude) {
    return {
      latitude:
        initialRegion.latitude + (initialRegion.latitudeDelta ?? 0) / 2,
      longitude:
        initialRegion.longitude + (initialRegion.longitudeDelta ?? 0) / 2,
      zoom: initialRegion.zoom ?? 12,
    };
  }

  return {
    latitude: 33.4996,
    longitude: 126.5312,
    zoom: 12,
  };
};

const getBoundsFromRegion = (maps, region) => {
  if (
    !maps
    || !region
    || !Number.isFinite(region.latitude)
    || !Number.isFinite(region.longitude)
    || !Number.isFinite(region.latitudeDelta)
    || !Number.isFinite(region.longitudeDelta)
  ) {
    return null;
  }

  return new maps.LatLngBounds(
    new maps.LatLng(region.latitude, region.longitude),
    new maps.LatLng(
      region.latitude + region.latitudeDelta,
      region.longitude + region.longitudeDelta,
    ),
  );
};

const fitMapToRegion = (map, maps, region) => {
  const bounds = getBoundsFromRegion(maps, region);

  if (!bounds) {
    return false;
  }

  try {
    map.fitBounds(bounds, {
      bottom: 48,
      left: 24,
      right: 24,
      top: 48,
    });
  } catch {
    map.fitBounds(bounds);
  }

  return true;
};

const getRegionFromMap = map => {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const sw = bounds?.getSW?.();
  const ne = bounds?.getNE?.();

  return {
    latitude: center.lat(),
    longitude: center.lng(),
    region: {
      latitudeDelta: ne && sw ? Math.abs(ne.lat() - sw.lat()) : undefined,
      longitudeDelta: ne && sw ? Math.abs(ne.lng() - sw.lng()) : undefined,
    },
  };
};

export const NaverMapView = forwardRef(function NaverMapView(
  {
    children,
    initialCamera,
    initialRegion,
    onLayout,
    onCameraChanged,
    onCameraIdle,
    onInitialized,
    onTapMap,
    style,
    ...props
  },
  ref,
) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const suppressClickUntilRef = useRef(0);
  const pointerStartRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const [maps, setMaps] = useState(null);
  const [map, setMap] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const suppressNextClick = () => {
    suppressClickUntilRef.current = Date.now() + CLICK_SUPPRESSION_MS;
    suppressMapClicks();
  };
  const shouldSuppressClick = () =>
    Date.now() < suppressClickUntilRef.current || shouldSuppressMapClick();
  const handleMapClick = () => {
    if (pointerMovedRef.current || shouldSuppressClick()) {
      pointerMovedRef.current = false;
      return;
    }

    onCameraChanged?.({reason: 'Tap'});
    onTapMap?.();
  };
  const handleLayout = event => {
    onLayout?.(event);
  };

  useImperativeHandle(ref, () => ({
    animateRegionTo: region => {
      if (!mapRef.current || !maps || !region) {
        return;
      }

      if (fitMapToRegion(mapRef.current, maps, region)) {
        return;
      }

      const center = getCenterFromProps({initialRegion: region});
      mapRef.current.panTo(new maps.LatLng(center.latitude, center.longitude));
    },
    animateCameraTo: camera => {
      if (!mapRef.current || !maps || !camera) {
        return;
      }

      mapRef.current.panTo(new maps.LatLng(camera.latitude, camera.longitude));

      if (camera.zoom != null) {
        mapRef.current.setZoom(camera.zoom);
      }
    },
  }), [maps]);

  useEffect(() => {
    let cancelled = false;

    loadNaverMaps()
      .then(nextMaps => {
        if (!cancelled) {
          setMaps(nextMaps);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setErrorMessage(error?.message || '네이버 지도를 불러오지 못했어요');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!maps || !mapElementRef.current || mapRef.current) {
      return undefined;
    }

    const mapElement = mapElementRef.current;
    const center = getCenterFromProps({initialCamera, initialRegion});
    const nextMap = new maps.Map(mapElement, {
      center: new maps.LatLng(center.latitude, center.longitude),
      zoom: center.zoom,
    });

    if (!initialCamera) {
      requestAnimationFrame(() => {
        fitMapToRegion(nextMap, maps, initialRegion);
      });
    }

    mapRef.current = nextMap;
    setMap(nextMap);
    onInitialized?.();

    const idleListener = maps.Event.addListener(nextMap, 'idle', () => {
      const nextRegion = getRegionFromMap(nextMap);
      onCameraIdle?.(nextRegion);
    });
    const clickListener = maps.Event.addListener(nextMap, 'click', () => {
      onCameraChanged?.({reason: 'Tap'});
    });
    const suppressFromMapChange = () => {
      suppressClickUntilRef.current = Date.now() + WHEEL_SUPPRESSION_MS;
      suppressMapClicks(WHEEL_SUPPRESSION_MS);
    };
    const suppressFromMapGesture = () => {
      suppressFromMapChange();
      onCameraChanged?.({reason: 'Gesture'});
    };
    const dragStartListener = maps.Event.addListener(nextMap, 'dragstart', () => {
      suppressFromMapGesture();
    });
    const dragListener = maps.Event.addListener(nextMap, 'drag', suppressFromMapGesture);
    const dragEndListener = maps.Event.addListener(nextMap, 'dragend', suppressFromMapGesture);
    const boundsChangedListener = maps.Event.addListener(nextMap, 'bounds_changed', suppressFromMapChange);
    const centerChangedListener = maps.Event.addListener(nextMap, 'center_changed', suppressFromMapChange);
    const zoomChangedListener = maps.Event.addListener(nextMap, 'zoom_changed', suppressFromMapChange);
    const suppressFromDomGesture = event => {
      if (event?.type === 'pointermove') {
        const start = pointerStartRef.current;

        if (!start) {
          return;
        }

        const dx = Math.abs((event?.clientX ?? 0) - start.x);
        const dy = Math.abs((event?.clientY ?? 0) - start.y);

        if (dx <= DRAG_THRESHOLD_PX && dy <= DRAG_THRESHOLD_PX) {
          return;
        }
      }

      suppressClickUntilRef.current = Date.now() + WHEEL_SUPPRESSION_MS;
      suppressMapClicks(WHEEL_SUPPRESSION_MS);
      onCameraChanged?.({reason: 'Gesture'});
    };
    const documentPointerStart = {x: 0, y: 0, active: false};
    const handleDocumentPointerDown = event => {
      if (!mapElement.contains(event.target)) {
        documentPointerStart.active = false;
        return;
      }

      documentPointerStart.active = true;
      documentPointerStart.x = event.clientX ?? 0;
      documentPointerStart.y = event.clientY ?? 0;
    };
    const handleDocumentPointerMove = event => {
      if (!documentPointerStart.active || !mapElement.contains(event.target)) {
        return;
      }

      const dx = Math.abs((event.clientX ?? 0) - documentPointerStart.x);
      const dy = Math.abs((event.clientY ?? 0) - documentPointerStart.y);

      if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
        suppressMapClicks(WHEEL_SUPPRESSION_MS);
        suppressClickUntilRef.current = Date.now() + WHEEL_SUPPRESSION_MS;
        onCameraChanged?.({reason: 'Gesture'});
      }
    };
    const handleDocumentPointerUp = () => {
      documentPointerStart.active = false;
    };
    const handleDocumentWheel = event => {
      if (!mapElement.contains(event.target)) {
        return;
      }

      suppressMapClicks(WHEEL_SUPPRESSION_MS);
      suppressClickUntilRef.current = Date.now() + WHEEL_SUPPRESSION_MS;
      onCameraChanged?.({reason: 'Gesture'});
    };

    mapElement.addEventListener('wheel', suppressFromDomGesture, {
      capture: true,
      passive: true,
    });
    mapElement.addEventListener('pointermove', suppressFromDomGesture, {
      capture: true,
      passive: true,
    });
    document.addEventListener('pointerdown', handleDocumentPointerDown, true);
    document.addEventListener('pointermove', handleDocumentPointerMove, true);
    document.addEventListener('pointerup', handleDocumentPointerUp, true);
    document.addEventListener('wheel', handleDocumentWheel, true);

    return () => {
      globalSuppressClickUntil = 0;
      maps.Event.removeListener(idleListener);
      maps.Event.removeListener(clickListener);
      maps.Event.removeListener(dragStartListener);
      maps.Event.removeListener(dragListener);
      maps.Event.removeListener(dragEndListener);
      maps.Event.removeListener(boundsChangedListener);
      maps.Event.removeListener(centerChangedListener);
      maps.Event.removeListener(zoomChangedListener);
      mapElement.removeEventListener('wheel', suppressFromDomGesture, {
        capture: true,
      });
      mapElement.removeEventListener('pointermove', suppressFromDomGesture, {
        capture: true,
      });
      document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
      document.removeEventListener('pointermove', handleDocumentPointerMove, true);
      document.removeEventListener('pointerup', handleDocumentPointerUp, true);
      document.removeEventListener('wheel', handleDocumentWheel, true);
      try {
        nextMap.destroy?.();
      } catch {
        // Naver Maps versions differ; clearing the container handles fallback cleanup.
      }
      if (mapRef.current === nextMap) {
        mapRef.current = null;
      }
      mapElement.innerHTML = '';
    };
  }, [initialCamera, initialRegion, maps, onCameraChanged, onCameraIdle, onInitialized]);

  return (
    <MapContext.Provider
      value={{
        map,
        maps,
        shouldSuppressClick,
        suppressNextClick,
      }}>
      <View
        {...props}
        onClick={handleMapClick}
        onLayout={handleLayout}
        onPointerDown={event => {
          pointerMovedRef.current = false;
          pointerStartRef.current = {
            x: event?.clientX ?? 0,
            y: event?.clientY ?? 0,
          };
        }}
        onPointerMove={event => {
          const start = pointerStartRef.current;

          if (!start) {
            return;
          }

          const dx = Math.abs((event?.clientX ?? 0) - start.x);
          const dy = Math.abs((event?.clientY ?? 0) - start.y);

          if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
            pointerMovedRef.current = true;
            suppressNextClick();
          }
        }}
        onPointerUp={() => {
          if (pointerMovedRef.current) {
            suppressNextClick();
            onCameraChanged?.({reason: 'Gesture'});
          }
          pointerStartRef.current = null;
        }}
        onWheel={() => {
          suppressClickUntilRef.current = Date.now() + WHEEL_SUPPRESSION_MS;
          onCameraChanged?.({reason: 'Gesture'});
        }}
        style={[style, styles.mapContainer]}>
        <div
          ref={mapElementRef}
          style={styles.nativeMap}
        />
        {errorMessage ? (
          <View style={styles.errorOverlay}>
            <Text>{errorMessage}</Text>
          </View>
        ) : null}
        {children}
      </View>
    </MapContext.Provider>
  );
});

export const NaverMapMarkerOverlay = ({latitude, longitude, onTap, zIndex}) => {
  const {map, maps, shouldSuppressClick} = useContext(MapContext) || {};
  useEffect(() => {
    if (!map || !maps || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return undefined;
    }

    const marker = new maps.Marker({
      map,
      position: new maps.LatLng(latitude, longitude),
      zIndex,
    });
    const clickListener = maps.Event.addListener(marker, 'click', () => {
      if (!shouldSuppressClick?.() && !shouldSuppressMapClick()) {
        onTap?.();
      }
    });

    return () => {
      maps.Event.removeListener(clickListener);
      marker.setMap(null);
    };
  }, [latitude, longitude, map, maps, onTap, shouldSuppressClick, zIndex]);

  return null;
};

export const NaverMapPathOverlay = () => null;
export const NaverMapCircleOverlay = () => null;
export const NaverMapPolygonOverlay = () => null;

const styles = StyleSheet.create({
  errorOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mapContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  nativeMap: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
export const NaverMapPolylineOverlay = () => null;
export const Camera = {};
export const LocationTrackingMode = {};
