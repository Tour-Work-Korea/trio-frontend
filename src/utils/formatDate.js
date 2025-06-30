export const formatDate = isoString => {
  if (!isoString) return '날짜 없음';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}/${month}/${day}`;
};

export function formatDateToLocalISOString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  const seconds = `${d.getSeconds()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// 새로운 함수

// 날짜

// 받기
/**
 * LocalDate (year-month-day) →  "year.month.day"
 */
export const formatLocalDateToDot = (localDate) => {
  if (!localDate) return '날짜 없음';
  const [year, month, day] = localDate.split('-');
  return `${year}.${month}.${day}`;
};

/**
 * LocalDate (year-month-day) → 요일까지 "year.month.day (요일)"
 */
export const formatLocalDateToDotWithDay = (localDate) => {
  if (!localDate) return '날짜 없음';
  const date = new Date(localDate);
  const [year, month, day] = localDate.split('-');
  const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDay = weekNames[date.getDay()];
  return `${year}.${month}.${day} (${weekDay})`;
};

/**
 * LocalDateTime (year-month-dayThour:minute:sec) →
 *  - 날짜는 "year.month.day"
 *  - 시간은 "hour:minute"
 */
export const formatLocalDateTimeToDotAndTime = (localDateTime) => {
  if (!localDateTime) return { date: '날짜 없음', time: '시간 없음' };
  const [datePart, timePart] = localDateTime.split('T');
  const [hour, minute] = timePart.split(':');
  const [year, month, day] = datePart.split('-');
  return {
    date: `${year}.${month}.${day}`,
    time: `${hour}:${minute}`
  };
};

/**
 * 요일 있게
 * LocalDateTime (year-month-dayThour:minute:sec) →
 *  - 날짜는 "year.month.day (요일)"
 *  - 시간은 "hour:minute"
 */
export const formatLocalDateTimeToDotAndTimeWithDay = (localDateTime) => {
  if (!localDateTime) return { date: '날짜 없음', time: '시간 없음' };
  
  const [datePart, timePart] = localDateTime.split('T');
  const [hour, minute] = timePart.split(':');
  const [year, month, day] = datePart.split('-');
  
  const dateObj = new Date(datePart);
  const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDay = weekNames[dateObj.getDay()];
  
  return {
    date: `${year}.${month}.${day} (${weekDay})`,
    time: `${hour}:${minute}`
  };
};

// 보내기
/**
 * 프론트 "year.month.day" → LocalDate "year-month-day"
 */
export const parseDotDateToLocalDate = (dotDate) => {
  if (!dotDate) return null;
  return dotDate.replace(/\./g, '-');
};

/**
 * 프론트 "year.month.day", "hour:minute" → LocalDateTime "year-month-dayThour:minute:sec"
 */
export const parseDotDateAndTimeToLocalDateTime = (dotDate, time) => {
  if (!dotDate || !time) return null;
  const localDate = parseDotDateToLocalDate(dotDate);
  return `${localDate}T${time}:00`;
};


// 시간

// 받기
/**
 * LocalTime (hour:minute) → "hour:minute"
 * 24시간 추후에 바뀔 수도 있어서 일단 만들어 놓음
 */
export const formatLocalTime = (localTime) => {
  return localTime || '시간 없음';
};

// 보내기
/**
 * 프론트 "hour:minute" → LocalTime "hour:minute"
 * 24시간 추후에 바뀔 수도 있어서 일단 만들어 놓음
 */
export const parseTimeToLocalTime = (time) => {
  return time;
};