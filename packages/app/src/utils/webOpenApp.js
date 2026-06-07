import {Platform} from 'react-native';

const IOS_STORE_URL =
  'https://apps.apple.com/kr/app/%EA%B2%8C%EB%94%B1%EC%A7%80-%EA%B2%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EC%9A%B0%EC%8A%A4-%EB%94%B1-%EC%A7%80%EA%B8%88/id6746732522';
const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.triofrontendapp&pcampaignid=web_share';
const FALLBACK_DELAY_MS = 1400;

const getStoreUrl = () => {
  const userAgent = window.navigator?.userAgent ?? '';

  if (/Android/i.test(userAgent)) {
    return ANDROID_STORE_URL;
  }

  return IOS_STORE_URL;
};

export const openAppOrStoreFromWeb = deepLinkUrl => {
  if (Platform.OS !== 'web' || !deepLinkUrl) {
    return false;
  }

  const openedAt = Date.now();
  const fallbackTimer = window.setTimeout(() => {
    if (document.visibilityState === 'hidden') {
      return;
    }

    if (Date.now() - openedAt < FALLBACK_DELAY_MS - 100) {
      return;
    }

    window.location.href = getStoreUrl();
  }, FALLBACK_DELAY_MS);

  const clearFallback = () => {
    window.clearTimeout(fallbackTimer);
  };

  window.addEventListener('pagehide', clearFallback, {once: true});
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') {
        clearFallback();
      }
    },
    {once: true},
  );

  window.location.href = deepLinkUrl;
  return true;
};
