import {isUserNotification} from '@utils/notifications';
import {companionNotificationValue} from '../../../../features/companion/notificationRouting';

// Message pushes still open chat, but individual messages do not belong in
// the notification center or its unread badge. Keep notices/system events.
export const isNotificationCenterItem = notification => {
  const type = String(
    companionNotificationValue(notification, 'type') ||
      companionNotificationValue(notification, 'targetType') ||
      '',
  ).toUpperCase();
  return isUserNotification(notification) && type !== 'COMPANION_CHAT_MESSAGE';
};
