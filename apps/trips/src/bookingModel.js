import {safeReturn} from './authModel.js';
export function bookingParams(detail, expectedId, now = Date.now()) {
  if (
    detail?.partyId !== expectedId ||
    detail.guesthouseId !== 97 ||
    detail.scheduleType !== 'DATE_EVENT' ||
    detail.isVisible === false
  )
    throw new Error('이 프로그램의 신청 정보를 확인할 수 없어요.');
  const start = detail.partyStartDateTime;
  const startsAt =
    typeof start === 'string'
      ? Date.parse(
          /(?:Z|[+-]\d\d:\d\d)$/.test(start) ? start : `${start}+09:00`,
        )
      : NaN;
  if (
    !Number.isFinite(startsAt) ||
    startsAt <= now ||
    detail.isApplyOpen !== true ||
    detail.partyStatus !== 'RECRUIT' ||
    (detail.maxAttendance > 0 && detail.numOfAttendance >= detail.maxAttendance)
  )
    throw new Error(
      '현재 신청할 수 없는 프로그램이에요. 모집 상태를 확인해주세요.',
    );
  const images = Array.isArray(detail.partyImages) ? detail.partyImages : [];
  return {
    partyId: expectedId,
    partyTitle: detail.partyTitle,
    partyStartDateTime: start,
    partyStartTime: detail.partyStartTime,
    partyEndTime: detail.partyEndTime,
    applicationType: detail.applicationType,
    scheduleType: detail.scheduleType,
    amount: detail.amount,
    thumbnailUrl: (images.find(item => item.isThumbnail) || images[0])
      ?.imageUrl,
    partyAnnouncements: (detail.partyAnnouncements || []).map(item =>
      typeof item === 'string'
        ? {announcement: item}
        : {announcement: item.announcement},
    ),
  };
}

export function reservationHref(params, destination) {
  const query = new URLSearchParams({
    params: JSON.stringify({
      ...params,
      tripsBack: safeReturn(destination) || '/trips/programs/',
    }),
  });
  return `/contents-reservation?${query}`;
}
