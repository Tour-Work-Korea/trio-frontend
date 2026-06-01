import {Linking, Platform} from 'react-native';

const NAVER_MAP_APP_SCHEME = 'nmap://';
const APP_NAME = Platform.select({
  ios: 'com.haneul.workaway',
  android: 'com.triofrontendapp',
  default: 'com.triofrontendapp',
});

const isFiniteCoordinate = value => Number.isFinite(Number(value));

export const openNaverDirections = async ({
  latitude,
  longitude,
  name,
  address,
}) => {
  const hasCoordinate =
    isFiniteCoordinate(latitude) && isFiniteCoordinate(longitude);
  const destinationName = name || address || '목적지';
  const encodedName = encodeURIComponent(destinationName);

  if (hasCoordinate) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const appUrl =
      `${NAVER_MAP_APP_SCHEME}route/public?dlat=${lat}&dlng=${lng}`
      + `&dname=${encodedName}&appname=${APP_NAME}`;

    try {
      const canOpen = await Linking.canOpenURL(NAVER_MAP_APP_SCHEME);

      if (canOpen) {
        await Linking.openURL(appUrl);
        return true;
      }
    } catch (error) {
      // Fall through to the web URL below.
    }

    await Linking.openURL(
      `https://map.naver.com/p/search/${encodedName}?c=${lng},${lat},15,0,0,0,dh`,
    );
    return true;
  }

  if (address || name) {
    await Linking.openURL(`https://map.naver.com/p/search/${encodedName}`);
    return true;
  }

  return false;
};
