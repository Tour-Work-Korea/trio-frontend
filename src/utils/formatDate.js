export const formatDate = (isoString) => {
  if (!isoString) return '날짜 없음';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}/${month}/${day}`;
};

// 사용
// import { formatDate } from '@utils/formatDate';
// <Text>{formatDate(변환할 값)}</Text>