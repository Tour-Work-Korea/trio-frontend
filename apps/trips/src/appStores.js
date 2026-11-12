export const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/kr/app/%EA%B2%8C%EB%94%B1%EC%A7%80-%EA%B2%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EC%9A%B0%EC%8A%A4-%EB%94%B1-%EC%A7%80%EA%B8%88/id6746732522',
  android:
    'https://play.google.com/store/apps/details?id=com.triofrontendapp&pcampaignid=web_share',
};

export function storeForDevice(userAgent = '', maxTouchPoints = 0) {
  if (/Android/i.test(userAgent)) return APP_STORE_URLS.android;
  if (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  )
    return APP_STORE_URLS.ios;
  return null;
}
