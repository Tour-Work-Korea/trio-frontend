import {useEffect, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Match the existing community place search fallback (Seoul City Hall).
const DEFAULT_LOCATION = {latitude: 37.5666103, longitude: 126.9783882};

export default function usePlaceInitialLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  useEffect(() => {
    let active = true;
    const locate = async () => {
      try {
        let enableHighAccuracy = true;
        if (Platform.OS === 'android') {
          const permissions = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
          enableHighAccuracy =
            permissions[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
          const coarseGranted =
            permissions[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
          if (!enableHighAccuracy && !coarseGranted) {
            return;
          }
        }
        if (!active) {
          return;
        }
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            if (
              active &&
              Number.isFinite(latitude) &&
              Number.isFinite(longitude) &&
              Math.abs(latitude) <= 90 &&
              Math.abs(longitude) <= 180
            ) {
              setLocation({latitude, longitude});
            }
          },
          () => {}, // Keep the usable fallback on denial, timeout, or failure.
          {enableHighAccuracy, timeout: 10000, maximumAge: 30000},
        );
      } catch {
        // Permission and location service errors also retain the fallback.
      }
    };
    locate();
    return () => {
      active = false;
    };
  }, []);

  return location;
}
