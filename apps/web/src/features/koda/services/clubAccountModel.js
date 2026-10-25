// Match only explicit server IDs. Titles and dates are not reliable identifiers.
export function selectClubReservations(response, events) {
  const list = Array.isArray(response) ? response : response?.content;
  if (!Array.isArray(list)) throw new Error('Invalid reservation collection.');
  const byPartyId = new Map(
    events
      .filter(event => event.bookingPartyId)
      .map(event => [String(event.bookingPartyId), event]),
  );
  return list
    .filter(item => byPartyId.has(String(item.partyId)))
    .map(item => ({
      ...item,
      event: byPartyId.get(String(item.partyId)),
      category:
        ['REJECTED', 'EXPIRED', 'WITHDRAWN'].includes(item.approvalStatus) ||
        ['CANCELLED', 'PAYMENT_EXPIRED'].includes(item.reservationStatus)
          ? 'cancelled'
          : item.reservationStatus === 'COMPLETED'
          ? 'past'
          : 'upcoming',
    }));
}

export function reservationStatusLabel(item, language) {
  // A final cancellation takes precedence over an earlier approval decision.
  if (item.reservationStatus === 'CANCELLED')
    return language === 'ko' ? '취소됨' : 'Cancelled';
  if (item.reservationStatus === 'PAYMENT_EXPIRED')
    return language === 'ko' ? '결제 대기 만료' : 'Payment expired';
  if (item.approvalStatus === 'REJECTED')
    return language === 'ko' ? '신청 미승인' : 'Not approved';
  if (item.approvalStatus === 'EXPIRED')
    return language === 'ko' ? '승인 대기 만료' : 'Approval expired';
  if (item.approvalStatus === 'WITHDRAWN')
    return language === 'ko' ? '신청 철회' : 'Application withdrawn';
  if (item.reservationStatus === 'PENDING') {
    if (item.approvalStatus === 'WAITING_HOST')
      return language === 'ko' ? '승인 대기' : 'Awaiting approval';
    if (item.approvalStatus === 'NONE')
      return language === 'ko' ? '결제 대기' : 'Awaiting payment';
    return language === 'ko' ? '예약 대기' : 'Reservation pending';
  }
  const labels = {
    CONFIRMED: ['예약 확정', 'Confirmed'],
    COMPLETED: ['참여 완료', 'Completed'],
    CANCELLED: ['취소됨', 'Cancelled'],
    PAYMENT_EXPIRED: ['결제 대기 만료', 'Payment expired'],
  };
  return (labels[item.reservationStatus] || [
    '상태 확인 중',
    'Checking status',
  ])[language === 'ko' ? 0 : 1];
}

// Use the same reservation fields as the original web history. Editorial
// content describes a meetup, but is not the source of a user's booking facts.
export function reservationSummary(item) {
  const text = value => (typeof value === 'string' ? value.trim() : '');
  const startDateTime = text(item.startDateTime);
  const image = text(item.partyImage);
  return {
    title: text(item.partyName),
    location: text(item.guesthouseAddress),
    startDateTime:
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startDateTime) &&
      Number.isFinite(Date.parse(startDateTime))
        ? startDateTime
        : null,
    image: /^(https?:\/\/|\/(?!\/))/.test(image) ? image : null,
  };
}

export function reservationLoadStatus(error) {
  return [401, 403].includes(error?.response?.status) ? 'authError' : 'error';
}

export function formatReservationSchedule(startDateTime, language) {
  if (!startDateTime) return null;
  // Backend LocalDateTime values describe Korea time, regardless of the
  // visitor's timezone. Explicit offsets must also display as Korea time.
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/.test(startDateTime)
    ? startDateTime
    : `${startDateTime}+09:00`;
  if (!Number.isFinite(Date.parse(timestamp))) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(timestamp)).map(part => [part.type, part.value]),
  );
  return {
    date: `${parts.year}.${parts.month}.${parts.day} (${parts.weekday})`,
    time: `${parts.hour}:${parts.minute}`,
    dateTime: timestamp,
  };
}
