import {Platform} from 'react-native';

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

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
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

  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>게딱지 앱으로 이동</title>
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
      <h1>게딱지 앱으로 이동 중</h1>
      <p>앱이 열리지 않으면 스토어로 이동합니다.</p>
      <a href="${escapeHtml(storeUrl)}">앱 다운로드하기</a>
    </main>
    <script>
      (function () {
        var deepLinkUrl = ${deepLinkJson};
        var storeUrl = ${storeUrlJson};
        var openedAt = Date.now();

        setTimeout(function () {
          if (document.visibilityState === 'hidden') {
            return;
          }

          if (Date.now() - openedAt >= ${FALLBACK_DELAY_MS - 100}) {
            window.location.replace(storeUrl);
          }
        }, ${FALLBACK_DELAY_MS});

        window.location.href = deepLinkUrl;
      })();
    </script>
  </body>
</html>`;
};

export const openAppOrStoreFromWeb = deepLinkUrl => {
  if (Platform.OS !== 'web' || !deepLinkUrl) {
    return false;
  }

  const storeUrl = getStoreUrlForWebDevice() || IOS_STORE_URL;
  const targetWindow = window.open('', '_blank');

  if (!targetWindow) {
    window.location.href = deepLinkUrl;
    window.setTimeout(() => {
      if (document.visibilityState !== 'hidden') {
        window.location.href = storeUrl;
      }
    }, FALLBACK_DELAY_MS);
    return true;
  }

  targetWindow.document.open();
  targetWindow.document.write(getBridgeHtml({deepLinkUrl, storeUrl}));
  targetWindow.document.close();
  targetWindow.opener = null;

  return true;
};
