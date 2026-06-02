const HIDDEN_ADDRESS_DETAILS = ['임시 상세주소'];

const removeHiddenAddressDetails = value =>
  HIDDEN_ADDRESS_DETAILS.reduce(
    (result, hiddenDetail) => result.replace(hiddenDetail, ''),
    String(value ?? ''),
  )
    .replace(/\s+/g, ' ')
    .trim();

// 제주특별자치도 앞에 오면 제거
export const trimJejuPrefix = (address = '') => {
  if (!address) {
    return '';
  }

  return removeHiddenAddressDetails(address)
    .replace(/^제주특별자치도\s*/, '')
    .replace(/^제주특별차시도\s*/, '');
};

export const formatAddressDetail = addressDetail => {
  const detail = removeHiddenAddressDetails(addressDetail);

  if (!detail) {
    return '';
  }

  return detail;
};

export const formatGuesthouseAddress = (address, addressDetail) =>
  [trimJejuPrefix(address), formatAddressDetail(addressDetail)]
    .filter(Boolean)
    .join(' ');
