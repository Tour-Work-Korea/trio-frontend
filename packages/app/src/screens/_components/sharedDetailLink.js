// Match native shares to the API environment that owns the detail ID.
export function getSharedDetailUrl(path, {apiBaseUrl = '', webOrigin} = {}) {
  const nativeOrigin = /^https:\/\/dev\.ddakji\.kr(?:\/|$)/i.test(apiBaseUrl)
    ? 'https://app-dev.ddakji.kr'
    : 'https://ddakji.kr';
  return `${webOrigin || nativeOrigin}${path}?shared=1`;
}
