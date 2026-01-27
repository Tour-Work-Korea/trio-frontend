import dayjs from 'dayjs';
import {
  parseDotDateAndTimeToLocalDateTime,
  parseDotDateToLocalDate,
} from '@utils/formatDate';

export const REFUND_POLICY_RESULT = {
  OK: 'OK',

  // 환불 불가
  CHECKIN_DAY: 'CHECKIN_DAY', // 체크인 당일
  AFTER_CHECKIN_TIME: 'AFTER_CHECKIN_TIME', // 체크인 시간 이후
  FREE_CANCEL_EXPIRED: 'FREE_CANCEL_EXPIRED', // 무료 취소 기한 초과

  // 예외
  INVALID_DATA: 'INVALID_DATA',
};

// 환불 불가 모달
export const REFUND_POLICY_MESSAGE = {
  [REFUND_POLICY_RESULT.CHECKIN_DAY]: {
    message: '체크인 당일에는 환불 없이 예약 취소만 가능합니다.\n예약을 취소하시겠습니까?',
    highlightText: '환불 없이',
    buttonText: '환불 없이 취소하기',
    buttonText2: '유지하기',
  },
  [REFUND_POLICY_RESULT.AFTER_CHECKIN_TIME]: {
    message: '체크인 시간 이후에는 환불 없이 예약 취소만 가능합니다.\n예약을 취소하시겠습니까? ',
    highlightText: '환불 없이',
    buttonText: '환불 없이 취소하기',
    buttonText2: '유지하기',
  },
  [REFUND_POLICY_RESULT.FREE_CANCEL_EXPIRED]: {
    message: '무료 취소 기한이 지나 환불 없이 예약 취소만 가능합니다.\n예약을 취소하시겠습니까? ',
    highlightText: '환불 없이',
    buttonText: '환불 없이 취소하기',
    buttonText2: '유지하기',
  },
  [REFUND_POLICY_RESULT.INVALID_DATA]: {
    title: '오류',
    message: '예약 정보를 확인할 수 없어 환불 가능 여부를 판단할 수 없습니다.',
  },
};

/**
 * 체크인
 * @param {string} checkInDate - 예: '2025-04-15' 또는 '2025. 04. 15'
 * @param {string} checkInTime - 예: '16:00' 또는 '16:00:00'
 */
const buildCheckInDateTime = (checkInDate, checkInTime) => {
  if (!checkInDate || !checkInTime) return null;

  const normalizedTime = String(checkInTime).slice(0, 5);
  const rawDate = String(checkInDate).replace(/\s+/g, '').replace(/[()가-힣]/g, '');

  let localDateTime = '';
  if (rawDate.includes('.')) {
    localDateTime = parseDotDateAndTimeToLocalDateTime(rawDate, normalizedTime);
  } else if (rawDate.includes('-')) {
    const localDate = rawDate.split('T')[0];
    localDateTime = `${localDate}T${normalizedTime}:00`;
  } else {
    const localDate = parseDotDateToLocalDate(rawDate);
    localDateTime = localDate ? `${localDate}T${normalizedTime}:00` : '';
  }

  const dt = localDateTime ? dayjs(localDateTime) : dayjs.invalid();

  return dt.isValid() ? dt : null;
};

/**
 * 무료취소기한 datetime 만들기
 * @param {string|Date} freeCancelUntil - 예: '2025-04-14T23:59:59' / '2025-04-14 23:59'
 */
const buildFreeCancelUntil = freeCancelUntil => {
  if (!freeCancelUntil) return null;
  const dt = dayjs(freeCancelUntil);
  return dt.isValid() ? dt : null;
};

/**
 * 환불 정책 판단 함수
 *
 * 우선순위
 * 1) 체크인 시간 이후
 * 2) 체크인 당일
 * 3) 무료 취소 기한 초과
 * 4) OK
 *
 * @param {Object} params
 * @param {string} params.checkInDate - 체크인 날짜
 * @param {string} params.checkInTime - 체크인 시간
 * @param {string|Date} params.freeCancelUntil - 무료취소기한 datetime (없으면 null 가능)
 * @param {string|Date} [params.now] - 현재시간
 *
 * @returns {string} REFUND_POLICY_RESULT
 */
export const getRefundPolicyResult = ({
  checkInDate,
  checkInTime,
  freeCancelUntil,
  now,
}) => {
  const nowDt = now ? dayjs(now) : dayjs();

  const checkInDt = buildCheckInDateTime(checkInDate, checkInTime);
  if (!checkInDt || !nowDt.isValid()) return REFUND_POLICY_RESULT.INVALID_DATA;

  // 1) 체크인 당일 + 체크인 시간 이후
  if (nowDt.isSame(checkInDt, 'day')) {
    if (nowDt.isSame(checkInDt) || nowDt.isAfter(checkInDt)) {
      return REFUND_POLICY_RESULT.AFTER_CHECKIN_TIME;
    }
    return REFUND_POLICY_RESULT.CHECKIN_DAY;
  }

  // 2) 체크인 날짜 이후도 모두 체크인 당일로 처리
  if (nowDt.isAfter(checkInDt, 'day')) {
    return REFUND_POLICY_RESULT.CHECKIN_DAY;
  }

  // 3) 무료 취소 기한 초과 (freeCancelUntil 값이 있는 경우만)
  const freeUntilDt = buildFreeCancelUntil(freeCancelUntil);
  if (freeUntilDt && freeUntilDt.isValid()) {
    // now가 freeCancelUntil 이후면 초과
    if (nowDt.isAfter(freeUntilDt)) {
      return REFUND_POLICY_RESULT.FREE_CANCEL_EXPIRED;
    }
  }

  return REFUND_POLICY_RESULT.OK;
};

/**
 * 화면에서 바로 모달 문구까지 얻고 싶을 때 쓰는 헬퍼
 */
export const getRefundPolicyModalContent = params => {
  const result = getRefundPolicyResult(params);
  return {
    result,
    ...(REFUND_POLICY_MESSAGE[result] || {}),
  };
};
