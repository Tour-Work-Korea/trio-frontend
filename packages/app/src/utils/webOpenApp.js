import {Platform} from 'react-native';
import i18n from '../i18n';

const IOS_STORE_URL =
  'https://apps.apple.com/kr/app/%EA%B2%8C%EB%94%B1%EC%A7%80-%EA%B2%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EC%9A%B0%EC%8A%A4-%EB%94%B1-%EC%A7%80%EA%B8%88/id6746732522';
const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.triofrontendapp&pcampaignid=web_share';
const FALLBACK_DELAY_MS = 1400;

export const APP_STORE_URLS = {
  ios: IOS_STORE_URL,
  android: ANDROID_STORE_URL,
};

export const getWebUserAgent = () =>
  typeof window === 'undefined' ? '' : window.navigator?.userAgent ?? '';

export const getWebDeviceType = () => {
  const userAgent = getWebUserAgent();

  if (/Android/i.test(userAgent)) {
    return 'android';
  }

  const isIPadDesktopMode =
    /Macintosh/i.test(userAgent) && window.navigator?.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/i.test(userAgent) || isIPadDesktopMode) {
    return 'ios';
  }

  return 'desktop';
};

export const getStoreUrlForWebDevice = () => {
  const deviceType = getWebDeviceType();

  if (deviceType === 'android') {
    return ANDROID_STORE_URL;
  }

  if (deviceType === 'ios') {
    return IOS_STORE_URL;
  }

  return null;
};

export const getAppStoreUrlsWithUtm = (search = '') => {
  const urls = {
    ios: new URL(IOS_STORE_URL),
    android: new URL(ANDROID_STORE_URL),
  };

  new URLSearchParams(search).forEach((value, key) => {
    if (/^utm_/i.test(key)) {
      Object.values(urls).forEach(url => url.searchParams.append(key, value));
    }
  });

  return {
    ios: urls.ios.toString(),
    android: urls.android.toString(),
  };
};

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getBridgeHtml = ({deepLinkUrl, storeUrl}) => {
  const deepLinkJson = JSON.stringify(deepLinkUrl);
  const storeUrlJson = JSON.stringify(storeUrl);
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';
  const openingApp = escapeHtml(i18n.t('web.openingApp'));
  const storeFallback = escapeHtml(i18n.t('web.openStoreFallback'));
  const downloadApp = escapeHtml(i18n.t('web.downloadApp'));

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${i18n.t('events.openAppTitle')}</title>
    <style>
      html, body {
        margin: 0;
        width: 100%;
        min-height: 100%;
        background: #fff;
        color: #222;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
      }
      body {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
      }
      main {
        width: 100%;
        max-width: 360px;
        text-align: center;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 20px;
        line-height: 28px;
      }
      p {
        margin: 0 0 20px;
        color: #73787E;
        font-size: 14px;
        line-height: 22px;
      }
      a {
        display: block;
        padding: 13px 16px;
        border-radius: 12px;
        background: #ff4b14;
        color: #fff;
        text-decoration: none;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${openingApp}</h1>
      <p>${storeFallback}</p>
      <a href="${escapeHtml(storeUrl)}">${downloadApp}</a>
    </main>
    <script>
      (function () {
        var deepLinkUrl = ${deepLinkJson};
        var storeUrl = ${storeUrlJson};
        var appOpened = false;
        var fallbackTimer;
        function stopFallback() {
          appOpened = true;
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('pagehide', stopFallback);
          window.removeEventListener('blur', pauseFallback);
          window.removeEventListener('focus', scheduleFallback);
        }
        function onVisibilityChange() {
          if (document.visibilityState === 'hidden') stopFallback();
        }
        function pauseFallback() {
          clearTimeout(fallbackTimer);
        }
        function scheduleFallback() {
          pauseFallback();
          if (appOpened) {
            return;
          }
          var scheduledAt = Date.now();
          fallbackTimer = setTimeout(function () {
            // Safari can suspend timers while its native open-app dialog is up.
            // Give visibility events time to arrive after the dialog is dismissed.
            if (Date.now() - scheduledAt > ${FALLBACK_DELAY_MS} + 300) {
              scheduleFallback();
              return;
            }
            if (!appOpened && document.visibilityState !== 'hidden') {
              window.location.replace(storeUrl);
            }
          }, ${FALLBACK_DELAY_MS});
        }
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', stopFallback);
        window.addEventListener('blur', pauseFallback);
        window.addEventListener('focus', scheduleFallback);
        scheduleFallback();
        window.location.href = deepLinkUrl;
      })();
    </script>
  </body>
</html>`;
};

export const openAppOrStoreFromWeb = (deepLinkUrl, {sameWindow = false} = {}) => {
  if (Platform.OS !== 'web' || !deepLinkUrl) {
    return false;
  }

  const storeUrl = getStoreUrlForWebDevice() || IOS_STORE_URL;
  const targetWindow = sameWindow ? null : window.open('', '_blank');

  if (!targetWindow) {
    let appOpened = false;
    let fallbackTimer;
    const cleanup = () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', stopFallback);
      window.removeEventListener('blur', pauseFallback);
      window.removeEventListener('focus', scheduleFallback);
    };
    const stopFallback = () => {
      appOpened = true;
      window.clearTimeout(fallbackTimer);
      cleanup();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopFallback();
      }
    };
    const pauseFallback = () => window.clearTimeout(fallbackTimer);
    const scheduleFallback = () => {
      pauseFallback();
      if (appOpened) {
        return;
      }
      const scheduledAt = Date.now();
      fallbackTimer = window.setTimeout(() => {
        if (Date.now() - scheduledAt > FALLBACK_DELAY_MS + 300) {
          scheduleFallback();
          return;
        }
        cleanup();
        if (!appOpened && document.visibilityState !== 'hidden') {
          window.location.href = storeUrl;
        }
      }, FALLBACK_DELAY_MS);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopFallback);
    window.addEventListener('blur', pauseFallback);
    window.addEventListener('focus', scheduleFallback);
    scheduleFallback();
    window.location.href = deepLinkUrl;
    return true;
  }

  targetWindow.document.open();
  targetWindow.document.write(getBridgeHtml({deepLinkUrl, storeUrl}));
  targetWindow.document.close();
  targetWindow.opener = null;

  return true;
};
