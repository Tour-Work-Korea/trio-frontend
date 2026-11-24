import {chatApi} from './api';

export const COMPANION_NOTIFICATION_TYPES = new Set([
  'COMPANION_APPLICATION_NEW',
  'COMPANION_APPLICATION_ACCEPTED',
  'COMPANION_APPLICATION_REJECTED',
  'COMPANION_CLOSED',
  'COMPANION_CANCELLED',
  'COMPANION_GROUP_READY',
  'COMPANION_CHAT_MESSAGE',
  'COMPANION_CHAT_NOTICE',
  'COMPANION_CHAT_SYSTEM',
]);

const NOTIFICATION_KEY_ALIASES = {
  type: ['type', 'targetType', 'notificationType', 'eventType'],
  roomId: ['roomId', 'chatRoomId', 'room_id', 'chat_room_id'],
  companionId: ['companionId', 'contextId', 'companion_id', 'context_id'],
};

const objectValue = value => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : value;
  } catch {
    return value;
  }
};

export const companionNotificationValue = (notification, key) => {
  const aliases = NOTIFICATION_KEY_ALIASES[key] || [key];
  for (const source of [
    notification,
    notification?.data,
    notification?.payload,
    notification?.metadata,
    notification?.target,
  ].map(objectValue)) {
    for (const alias of aliases) {
      if (source?.[alias] != null && source[alias] !== '') {
        return source[alias];
      }
    }
  }
  return null;
};

const idValue = value =>
  /^[1-9]\d*$/.test(String(value || '')) ? String(value) : null;

export const isCompanionNotification = notification => {
  const type = String(
    companionNotificationValue(notification, 'type') || '',
  ).toUpperCase();

  return (
    COMPANION_NOTIFICATION_TYPES.has(type) ||
    Boolean(idValue(companionNotificationValue(notification, 'roomId')))
  );
};

const companionIdFromRoom = room =>
  idValue(room?.companionId) ||
  idValue(room?.contextId) ||
  idValue(room?.companion?.id);

const findNotificationRoom = async roomId => {
  try {
    const {data} = await chatApi.detail(roomId);
    const companionId = companionIdFromRoom(data);
    if (companionId) {
      return companionId;
    }
  } catch {}

  // NotificationResponse intentionally exposes roomId without companionId.
  // If the room detail is temporarily unavailable, the inbox response can
  // still provide the companion context required by CompanionChat.
  try {
    const {data} = await chatApi.list();
    const rooms = Array.isArray(data) ? data : data?.content;
    const room = rooms?.find(item => String(item.roomId) === String(roomId));
    return companionIdFromRoom(room);
  } catch {
    return null;
  }
};

// Accept only the companion/chat routes; leave all existing deeplink families
// to the existing router. Never treat a notification ID as a room ID.
export function companionLinkTarget(url) {
  if (!url) {
    return null;
  }
  const raw = String(url)
    .trim()
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  const family = parts[0];
  if (!['companion', 'companions', 'chat'].includes(family)) {
    return null;
  }
  if (family === 'chat' || parts[1] === 'chat' || parts[1] === 'rooms') {
    return {
      type: 'COMPANION_CHAT_MESSAGE',
      roomId: idValue(
        params.get('roomId') ||
          (['rooms', 'chat'].includes(parts[1]) ? parts[2] : parts[1]),
      ),
      companionId: idValue(params.get('companionId')),
    };
  }
  return {
    type: 'COMPANION_LINK',
    companionId: idValue(parts[1] || params.get('companionId')),
  };
}

export async function resolveCompanionNotification(notification) {
  const type = String(
    companionNotificationValue(notification, 'type') || '',
  ).toUpperCase();
  const roomId = idValue(companionNotificationValue(notification, 'roomId'));
  let companionId = idValue(
    companionNotificationValue(notification, 'companionId'),
  );
  if (type === 'COMPANION_CANCELLED') {
    return {name: 'MyCompanions'};
  }
  const currentGroup = [
    'COMPANION_APPLICATION_ACCEPTED',
    'COMPANION_CLOSED',
    'COMPANION_GROUP_READY',
  ].includes(type);
  if (companionId && currentGroup) {
    return {name: 'CompanionChatAccess', params: {companionId}};
  }
  if (roomId) {
    companionId = (await findNotificationRoom(roomId)) || companionId;
  }
  if (companionId && currentGroup) {
    return {name: 'CompanionChatAccess', params: {companionId}};
  }
  if (roomId && companionId) {
    return {
      name:
        type === 'COMPANION_CHAT_NOTICE'
          ? 'CompanionChatNotice'
          : 'CompanionChat',
      params: {roomId, companionId},
    };
  }
  if (companionId) {
    if (type === 'COMPANION_APPLICATION_NEW') {
      return {name: 'CompanionManage', params: {companionId}};
    }
    if (type.startsWith('COMPANION_CHAT_')) {
      return {name: 'CompanionChatAccess', params: {companionId}};
    }
    return {name: 'CompanionDetail', params: {companionId}};
  }
  return {
    name: type.startsWith('COMPANION_CHAT_')
      ? 'CompanionInbox'
      : 'MyCompanions',
  };
}
