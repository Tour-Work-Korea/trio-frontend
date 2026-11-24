jest.mock('@utils/notifications', () => ({
  openNotificationTarget: jest.fn(),
  subscribeForegroundNotification: jest.fn(() => jest.fn()),
}));

jest.mock('@utils/navigationService', () => ({
  navigationRef: {getCurrentRoute: jest.fn(() => null)},
}));

import {mapRemoteMessage} from '../../../packages/app/src/components/InAppNotificationBanner';
import {
  companionNotificationValue,
  isCompanionNotification,
} from '../../../packages/app/src/features/companion/notificationRouting';

describe('in-app notification presentation', () => {
  test.each([
    [
      'companion chat alias payload',
      {notificationType: 'COMPANION_CHAT_MESSAGE', chatRoomId: '17'},
      {type: 'companion', rawType: 'COMPANION_CHAT_MESSAGE', status: 'confirmed'},
    ],
    [
      'companion room-only payload',
      {roomId: '17'},
      {type: 'companion', rawType: '', status: 'confirmed'},
    ],
    [
      'notice',
      {type: 'ALL_NOTICE'},
      {type: 'notice', rawType: 'ALL_NOTICE', status: 'confirmed'},
    ],
    [
      'community comment',
      {type: 'COMMUNITY_COMMENT_NEW'},
      {type: 'community', rawType: 'COMMUNITY_COMMENT_NEW', status: 'confirmed'},
    ],
    [
      'party cancellation',
      {type: 'PARTY_RESERVATION_USER_CANCELLED'},
      {
        type: 'partyReservation',
        rawType: 'PARTY_RESERVATION_USER_CANCELLED',
        status: 'cancelled',
      },
    ],
    [
      'guesthouse confirmation',
      {type: 'GUESTHOUSE_RESERVATION_USER_CONFIRMED'},
      {
        type: 'roomReservation',
        rawType: 'GUESTHOUSE_RESERVATION_USER_CONFIRMED',
        status: 'confirmed',
      },
    ],
  ])('%s uses the expected visual variant', (_name, data, expected) => {
    expect(
      mapRemoteMessage({
        notification: {title: '제목', body: '첫 줄\n둘째 줄\n셋째 줄'},
        data,
      }),
    ).toMatchObject({...expected, title: '제목', lines: ['첫 줄', '둘째 줄']});
  });

  test('chat aliases are shared by foreground suppression and tap routing', () => {
    const payload = {
      eventType: 'COMPANION_CHAT_MESSAGE',
      chat_room_id: '42',
      context_id: '7',
    };

    expect(isCompanionNotification(payload)).toBe(true);
    expect(companionNotificationValue(payload, 'type')).toBe(
      'COMPANION_CHAT_MESSAGE',
    );
    expect(companionNotificationValue(payload, 'roomId')).toBe('42');
    expect(companionNotificationValue(payload, 'companionId')).toBe('7');
  });
});
