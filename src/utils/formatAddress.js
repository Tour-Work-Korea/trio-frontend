// 제주특별자치도 앞에 오면 제거
export const trimJejuPrefix = (address = '') => {
  if (!address) return '';

  return address
    .replace(/^제주특별자치도\s*/, '')
    .replace(/^제주특별차시도\s*/, '');
};