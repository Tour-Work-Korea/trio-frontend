import {navigate} from '@utils/navigationService';
import {showErrorModal} from '@utils/loginModalHub';
import useUserStore from '@stores/userStore';

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

const getQueryParam = (searchParams, keys) => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      return value;
    }
  }

  return null;
};

const parseDeeplink = url => {
  const normalized = String(url || '').trim();
  const withoutScheme = normalized.replace(
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//,
    '',
  );
  const [pathPart = '', queryPart = ''] = withoutScheme.split('?');
  const rawPath = pathPart.replace(/^\/+|\/+$/g, '');
  const parts = rawPath ? rawPath.split('/').filter(Boolean) : [];
  const searchParams = new URLSearchParams(queryPart);

  return {parts, searchParams};
};

const isLoggedInUser = () => {
  const {accessToken, userRole} = useUserStore.getState();
  return Boolean(accessToken && userRole === 'USER');
};

const showLoginRequiredModal = (
  message = '서비스 이용을 위해 로그인 해주세요.',
) => {
  showErrorModal({
    title: '로그인이 필요합니다',
    message,
    buttonText: '확인',
    buttonText2: '취소',
    onPress: () => navigate('Login'),
  });
};

const openDeeplinkTarget = url => {
  const {parts, searchParams} = parseDeeplink(url);

  if (
    parts[0] === 'reservation' &&
    parts[1] === 'guesthouse' &&
    parts[2] === 'detail'
  ) {
    const reservationId = getQueryParam(searchParams, ['reservationId', 'id']);
    if (reservationId) {
      if (!isLoggedInUser()) {
        showLoginRequiredModal();
        return true;
      }

      navigate('GuesthousePaymentReceipt', {
        reservationId,
        isFromDeeplink: true,
      });
      return true;
    }
  }

  if (
    parts[0] === 'reservation' &&
    parts[1] === 'party' &&
    parts[2] === 'detail'
  ) {
    const reservationId = getQueryParam(searchParams, ['reservationId', 'id']);
    if (reservationId) {
      if (!isLoggedInUser()) {
        showLoginRequiredModal();
        return true;
      }

      navigate('MeetPaymentReceipt', {
        reservationId,
        isFromDeeplink: true,
      });
      return true;
    }
  }

  if (parts[0] === 'party' && parts[1]) {
    const partyId =
      parts[1] === 'detail'
        ? getQueryParam(searchParams, ['partyId', 'id'])
        : parts[1];

    if (partyId) {
      navigate('MeetDetail', {partyId, isFromDeeplink: true});
      return true;
    }
  }

  return false;
};

export const openNotificationTarget = async notification => {
  const deeplink =
    notification?.deeplink ||
    notification?.deepLink ||
    notification?.link ||
    notification?.url;

  if (deeplink && openDeeplinkTarget(deeplink)) {
    return;
  }

  const type = String(notification?.type || '').toUpperCase();
  const reservationId = notification?.reservationId;
  const guesthouseId = notification?.guesthouseId;
  const partyId = notification?.partyId;
  const isGuesthouseCancellation =
    type === 'GUESTHOUSE_RESERVATION_USER_CANCELLED' ||
    type === 'GUESTHOUSE_RESERVATION_USER_REFUND';
  const isPartyCancellation = type === 'PARTY_RESERVATION_USER_CANCELLED';

  if (
    type.startsWith('GUESTHOUSE_RESERVATION_USER_') ||
    type === 'GUESTHOUSE_CHECKIN_INFO' ||
    type === 'GUESTHOUSE_TODAY_CHECKIN_USER'
  ) {
    if (!isLoggedInUser()) {
      showLoginRequiredModal();
      return;
    }

    if (reservationId) {
      if (isGuesthouseCancellation) {
        navigate('GuesthouseCancelledReceipt', {reservationId});
        return;
      }

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
    if (!isLoggedInUser()) {
      showLoginRequiredModal();
      return;
    }

    if (reservationId) {
      if (isPartyCancellation) {
        navigate('MeetCancelledReceipt', {reservationId});
        return;
      }

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
