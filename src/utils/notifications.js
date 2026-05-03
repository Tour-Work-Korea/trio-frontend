import {navigate} from '@utils/navigationService';

const foregroundListeners = new Set();

const USER_NOTIFICATION_TYPES = new Set([
  'ALL_NOTICE',
  'ALL_EVENT',
  'GUESTHOUSE_RESERVATION_USER_NEW',
  'GUESTHOUSE_RESERVATION_USER_CONFIRMED',
  'GUESTHOUSE_RESERVATION_USER_CANCELLED',
  'GUESTHOUSE_RESERVATION_USER_REFUND',
  'GUESTHOUSE_CHECKIN_INFO',
  'GUESTHOUSE_TODAY_CHECKIN_USER',
  'PARTY_INVITATION',
  'PARTY_CHECKIN_INFO',
  'PARTY_RESERVATION_USER_CONFIRMED',
  'PARTY_RESERVATION_USER_CANCELLED',
  'REVIEW_COMMENT_NEW',
  'REVIEW_SUB_COMMENT_NEW',
]);

export const subscribeForegroundNotification = listener => {
  foregroundListeners.add(listener);

  return () => {
    foregroundListeners.delete(listener);
  };
};

export const publishForegroundNotification = remoteMessage => {
  foregroundListeners.forEach(listener => {
    try {
      listener(remoteMessage);
    } catch (error) {
      console.warn('foreground notification listener error:', error);
    }
  });
};

export const isUserNotification = notification => {
  const type = String(notification?.type || '').toUpperCase();
  return USER_NOTIFICATION_TYPES.has(type);
};

export const openNotificationTarget = async notification => {
  const type = String(notification?.type || '').toUpperCase();
  const reservationId = notification?.reservationId;
  const guesthouseId = notification?.guesthouseId;
  const partyId = notification?.partyId;

  if (
    type.startsWith('GUESTHOUSE_RESERVATION_USER_') ||
    type === 'GUESTHOUSE_CHECKIN_INFO' ||
    type === 'GUESTHOUSE_TODAY_CHECKIN_USER'
  ) {
    if (reservationId) {
      navigate('GuesthousePaymentReceipt', {reservationId});
      return;
    }

    navigate('UserReservationCheck');
    return;
  }

  if (
    type.startsWith('PARTY_RESERVATION_USER_') ||
    type === 'PARTY_INVITATION' ||
    type === 'PARTY_CHECKIN_INFO'
  ) {
    if (reservationId) {
      navigate('MeetPaymentReceipt', {reservationId});
      return;
    }

    if (partyId) {
      navigate('MeetDetail', {partyId});
      return;
    }

    navigate('UserMeetReservationCheck');
    return;
  }

  if (type === 'REVIEW_COMMENT_NEW' || type === 'REVIEW_SUB_COMMENT_NEW') {
    navigate('UserGuesthouseReview');
    return;
  }

  if (partyId) {
    navigate('MeetDetail', {partyId});
    return;
  }

  if (guesthouseId) {
    navigate('GuesthouseDetail', {id: guesthouseId});
  }
};
