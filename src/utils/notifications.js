import {navigate} from '@utils/navigationService';
import {showErrorModal} from '@utils/loginModalHub';
import useUserStore from '@stores/userStore';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import communityApi from '@utils/api/communityApi';
import notificationApi from '@utils/api/notificationApi';
import Toast from 'react-native-toast-message';

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
  'PARTY_CANCELLED_BY_HOST',
  'REVIEW_COMMENT_NEW',
  'REVIEW_SUB_COMMENT_NEW',
  'COMMUNITY_COMMENT_NEW',
  'COMMUNITY_REPLY_NEW',
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

const getFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
};

const getNestedFirstValue = (source, keys) => {
  const candidates = [
    source,
    source?.data,
    source?.payload,
    source?.target,
    source?.metadata,
    source?.meta,
  ];

  for (const candidate of candidates) {
    const value = getFirstValue(candidate, keys);
    if (value !== null) {
      return value;
    }
  }

  return null;
};

const parseDeeplink = url => {
  const normalized = String(url || '').trim();
  const withoutScheme = normalized.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
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
    const reservationId =
      parts[3] || getQueryParam(searchParams, ['reservationId', 'id']);
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
    const reservationId =
      parts[3] || getQueryParam(searchParams, ['reservationId', 'id']);
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

  if (
    (parts[0] === 'community' || parts[0] === 'post') &&
    (parts[1] ||
      getQueryParam(searchParams, ['postId', 'communityPostId', 'id']))
  ) {
    const postId =
      parts[0] === 'community' && parts[1] === 'posts'
        ? parts[2] ||
          getQueryParam(searchParams, ['postId', 'communityPostId', 'id'])
        : parts[1] ||
          getQueryParam(searchParams, ['postId', 'communityPostId', 'id']);
    const targetCommentId = getQueryParam(searchParams, [
      'targetCommentId',
      'commentId',
      'replyId',
      'communityCommentId',
    ]);

    if (postId) {
      navigate('CommunityDetail', {
        postId,
        ...(targetCommentId ? {targetCommentId} : {}),
      });
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
  let communityPostId = getNestedFirstValue(notification, [
    'postId',
    'communityPostId',
    'targetPostId',
    'articleId',
  ]);
  let communityCommentId = getNestedFirstValue(notification, [
    'targetCommentId',
    'commentId',
    'communityCommentId',
    'replyId',
    'parentCommentId',
  ]);
  const isGuesthouseCancellation =
    type === 'GUESTHOUSE_RESERVATION_USER_CANCELLED' ||
    type === 'GUESTHOUSE_RESERVATION_USER_REFUND';
  const isPartyCancellation =
    type === 'PARTY_RESERVATION_USER_CANCELLED' ||
    type === 'PARTY_CANCELLED_BY_HOST';

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
    type === 'PARTY_CHECKIN_INFO' ||
    type === 'PARTY_CANCELLED_BY_HOST'
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

      try {
        const {data} = await reservationPaymentApi.getPartyReservationDetail(
          reservationId,
        );
        if (data?.reservationStatus === 'CANCELLED') {
          Toast.show({
            type: 'error',
            text1: '이미 취소된 신청 건입니다.',
          });
          return;
        }
      } catch (e) {
        console.log('파티 예약 상태 확인 실패', e);
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

  if (type === 'COMMUNITY_COMMENT_NEW' || type === 'COMMUNITY_REPLY_NEW') {
    if (!communityPostId && !communityCommentId) {
      const notificationId = getFirstValue(notification, [
        'notificationId',
        'id',
      ]);

      if (notificationId) {
        try {
          const {data: notificationDetail} = await notificationApi.getDetail(
            notificationId,
          );
          const mergedNotification = {
            ...notification,
            ...(notificationDetail ?? {}),
          };
          communityPostId = getNestedFirstValue(mergedNotification, [
            'postId',
            'communityPostId',
            'targetPostId',
            'articleId',
          ]);
          communityCommentId = getNestedFirstValue(mergedNotification, [
            'targetCommentId',
            'commentId',
            'communityCommentId',
            'replyId',
            'parentCommentId',
          ]);
        } catch (error) {
          console.warn('fetchCommunityNotificationDetail 실패:', error);
        }
      }
    }

    if (communityPostId) {
      navigate('CommunityDetail', {
        postId: communityPostId,
        ...(communityCommentId ? {targetCommentId: communityCommentId} : {}),
      });
      return;
    }

    if (communityCommentId) {
      try {
        const {data: commentAnchor} = await communityApi.getCommentAnchor(
          communityCommentId,
        );
        const anchorPostId = getFirstValue(commentAnchor, [
          'postId',
          'communityPostId',
          'targetPostId',
          'articleId',
        ]);

        if (anchorPostId) {
          navigate('CommunityDetail', {
            postId: anchorPostId,
            targetCommentId: communityCommentId,
            commentAnchor,
          });
          return;
        }
      } catch (error) {
        console.warn('fetchCommunityNotificationAnchor 실패:', error);
      }
    }

    navigate(
      type === 'COMMUNITY_REPLY_NEW'
        ? 'MyCommunityCommentList'
        : 'MyCommunityPostList',
    );
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
