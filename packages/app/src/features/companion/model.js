import {formatDate, formatNumber} from '@utils/localeFormat';

// Provisional codes: no server-maintained activity/region catalog exists yet.
export const ACTIVITIES = ['WALK', 'FOOD', 'PHOTO', 'SWIM', 'OTHER'];
export const REGIONS = ['JEJU_NORTH', 'JEJU_SOUTH', 'JEJU_EAST', 'JEJU_WEST'];
export const dateKey = date => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = type => parts.find(part => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};
export const kstDate = value =>
  new Date(
    value.includes('T')
      ? /Z$|[+-]\d\d:\d\d$/.test(value)
        ? value
        : `${value}+09:00`
      : `${value}T12:00:00+09:00`,
  );
export const displayDate = value =>
  value
    ? formatDate(kstDate(value), {
        timeZone: 'Asia/Seoul',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      })
    : '';
export const displayTime = value =>
  value
    ? formatDate(kstDate(value), {
        timeZone: 'Asia/Seoul',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';
export const schedule = (item, t) =>
  item.startDate === item.endDate
    ? displayDate(item.startDate)
    : t('companion.dateRange', {
        start: displayDate(item.startDate),
        end: displayDate(item.endDate),
      });
export const hasAction = (item, action) =>
  item?.allowedActions?.includes(action);
export const roomForAccess = (access, detail) => {
  if (access?.status !== 'READY') {
    return null;
  }
  return detail?.status === 'CLOSED'
    ? access.groupRoomId
    : detail?.status === 'OPEN'
    ? access.directRoomId
    : null;
};
export function validateDraft(draft, now = new Date(), checkDates = true) {
  if (
    !draft.title.trim() ||
    draft.title.trim().length > 120 ||
    draft.description.trim().length < 10 ||
    draft.description.trim().length > 1000 ||
    !draft.activityType ||
    !draft.regionCode ||
    draft.capacity < 1 ||
    draft.capacity > 100 ||
    draft.meetingPlace.length > 255
  ) {
    return 'companion.validation';
  }
  if (!checkDates) {
    return null;
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.endDate)
  ) {
    return 'companion.dateValidation';
  }
  const start = kstDate(draft.startDate);
  const end = kstDate(draft.endDate);
  if (
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    dateKey(start) !== draft.startDate ||
    dateKey(end) !== draft.endDate ||
    end < start ||
    (end - start) / 86400000 > 29
  ) {
    return 'companion.dateValidation';
  }
  const closeAt =
    new Date(`${draft.startDate}T18:00:00+09:00`).getTime() - 86400000;
  return closeAt <= +now ? 'companion.deadlineValidation' : null;
}
export function mergeMessages(current, incoming) {
  const result = [...current];
  incoming.forEach(message => {
    const normalized = {
      ...message,
      ...(message.senderUserId != null || message.senderId != null
        ? {senderUserId: String(message.senderUserId ?? message.senderId)}
        : {}),
      ...(message.roomId != null ? {roomId: String(message.roomId)} : {}),
    };
    const index = result.findIndex(
      existing =>
        (normalized.messageId != null &&
          String(existing.messageId) === String(normalized.messageId)) ||
        (normalized.clientMessageId &&
          existing.clientMessageId === normalized.clientMessageId &&
          (normalized.senderUserId == null ||
            (existing.senderUserId ?? existing.senderId) == null ||
            String(existing.senderUserId ?? existing.senderId) ===
              normalized.senderUserId)),
    );
    if (index < 0) {
      result.push(normalized);
    } else {
      result[index] = {...result[index], ...normalized, pending: false};
    }
  });
  return result.sort(
    (a, b) =>
      +new Date(a.sentAt || a.acceptedAt || 0) -
        +new Date(b.sentAt || b.acceptedAt || 0) ||
      Number(a.messageId || 0) - Number(b.messageId || 0),
  );
}
export function parsePayload(message) {
  try {
    return typeof message.payloadJson === 'string'
      ? JSON.parse(message.payloadJson)
      : message.payload || {};
  } catch {
    return {};
  }
}
export const countText = (t, key, count, values = {}) =>
  t(key, {count, value: formatNumber(count), ...values});
