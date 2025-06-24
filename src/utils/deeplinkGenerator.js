import Clipboard from '@react-native-clipboard/clipboard';

// 앱 딥링크 스킴
const APP_SCHEME = 'workaway://';

/**
 * workaway://guesthouse/1234 이런식으로 만들어짐
 * chrome 에서 생성된 링크 입력하면 앱으로 가짐
 */ 

/**
 * 공통 딥링크 생성 함수
 * @param {string} path - 딥링크 경로 (ex: guesthouse/1234)
 * @returns {string} 생성된 딥링크 URL
 */
export const generateDeeplink = (path) => {
  return `${APP_SCHEME}${path}`;
};

/**
 * 예시 함수 -> 추후 삭제 예정
 * @param {string} id
 */
export const exDeeplink = (id) => {
  return generateDeeplink(`exDeeplink/${id}`);
};

/**
 * 게스트하우스 상세
 * @param {string} guesthouseId
 */
export const guesthouseDetailDeeplink = (guesthouseId) => {
  return generateDeeplink(`guesthouse/${guesthouseId}`);
};

/**
 * 공고 -> 예시니 필요시 수정!
 * @param {string} employId
 */
export const employDetailDeeplink = (employId) => {
  return generateDeeplink(`employ/${employId}`);
};

/**
 * 딥링크 복사
 */
export const copyDeeplinkToClipboard = (url) => {
  Clipboard.setString(url);
};
