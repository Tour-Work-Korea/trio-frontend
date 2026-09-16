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
  'PARTY_RESERVATION_REJECTED',
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

const getNotificationId = notification =>
  getNestedFirstValue(notification, ['notificationId', 'id']);

const fetchNotificationDetail = async notification => {
  const notificationId = getNotificationId(notification);

  if (!notificationId) {
    return notification;
  }

  try {
    const {data: notificationDetail} = await notificationApi.getDetail(
      notificationId,
    );

    return {
      ...notification,
      ...(notificationDetail ?? {}),
    };
  } catch (error) {
    console.warn('fetchNotificationDetail 실패:', error);
    return notification;
  }
};

const buildCommunityCommentAnchor = (commentId, parentCommentId) => {
  if (!commentId && !parentCommentId) {
    return null;
  }

  return {
    commentId: commentId ?? parentCommentId,
    ...(parentCommentId ? {parentCommentId} : {}),
  };
};

const isGuesthouseCancellationType = type =>
  type === 'GUESTHOUSE_RESERVATION_USER_CANCELLED' ||
  type === 'GUESTHOUSE_RESERVATION_USER_REFUND';

const isPartyCancellationType = type =>
  type === 'PARTY_RESERVATION_USER_CANCELLED' ||
  type === 'PARTY_RESERVATION_REJECTED' ||
  type === 'PARTY_CANCELLED_BY_HOST';

const isReservationNotificationType = type =>
  type.startsWith('GUESTHOUSE_RESERVATION_USER_') ||
  type.startsWith('PARTY_RESERVATION_USER_') ||
  type === 'GUESTHOUSE_CHECKIN_INFO' ||
  type === 'GUESTHOUSE_TODAY_CHECKIN_USER' ||
  type === 'PARTY_INVITATION' ||
  type === 'PARTY_CHECKIN_INFO' ||
  type === 'PARTY_RESERVATION_REJECTED' ||
  type === 'PARTY_CANCELLED_BY_HOST';

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

const navigateTo = (navigation, name, params) => {
  if (navigation?.navigate) {
    navigation.navigate(name, params);
    return;
  }

  navigate(name, params);
};

const showLoginRequiredModal = (
  message = '서비스 이용을 위해 로그인 해주세요.',
  navigation,
) => {
  showErrorModal({
    title: '로그인이 필요합니다',
    message,
    buttonText: '확인',
    buttonText2: '취소',
    onPress: () => navigateTo(navigation, 'Login'),
  });
};

const openDeeplinkTarget = (url, navigation) => {
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
        showLoginRequiredModal(undefined, navigation);
        return true;
      }

      navigateTo(navigation, 'GuesthousePaymentReceipt', {
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
        showLoginRequiredModal(undefined, navigation);
        return true;
      }

      navigateTo(navigation, 'MeetPaymentReceipt', {
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
      navigateTo(navigation, 'MeetDetail', {partyId, isFromDeeplink: true});
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
    const parentCommentId = getQueryParam(searchParams, [
      'parentId',
      'parentCommentId',
      'rootCommentId',
    ]);

    if (postId) {
      navigateTo(navigation, 'CommunityDetail', {
        postId,
        ...(targetCommentId ? {targetCommentId} : {}),
        fallbackRouteName: targetCommentId
          ? 'MyCommunityCommentList'
          : 'MyCommunityPostList',
        ...(parentCommentId
          ? {
              commentAnchor: buildCommunityCommentAnchor(
                targetCommentId,
                parentCommentId,
              ),
            }
          : {}),
      });
      return true;
    }
  }

  return false;
};

export const openNotificationTarget = async (notification, navigation) => {
  const initialType = String(
    getNestedFirstValue(notification, ['type', 'targetType']) || '',
  ).toUpperCase();
  const deeplink =
    notification?.deeplink ||
    notification?.deepLink ||
    notification?.link ||
    notification?.url;

  // 예약 알림의 푸시 데이터에는 파티/숙소 상세 딥링크만 포함될 수 있다.
  // 이 경우 딥링크보다 예약 ID를 우선 해석해 신청·취소·반려 내역으로 보낸다.
  if (
    deeplink &&
    !isReservationNotificationType(initialType) &&
    openDeeplinkTarget(deeplink, navigation)
  ) {
    return;
  }

  let targetNotification = notification;
  let type = initialType;
  let reservationId = getNestedFirstValue(targetNotification, [
    'reservationId',
  ]);
  let guesthouseId = getNestedFirstValue(targetNotification, ['guesthouseId']);
  let partyId = getNestedFirstValue(targetNotification, ['partyId']);
  let communityPostId = getNestedFirstValue(targetNotification, [
    'postId',
    'communityPostId',
    'targetPostId',
    'articleId',
  ]);
  let communityCommentId = getNestedFirstValue(targetNotification, [
    'targetCommentId',
    'commentId',
    'communityCommentId',
    'replyId',
  ]);
  let communityParentCommentId = getNestedFirstValue(targetNotification, [
    'parentId',
    'parentCommentId',
    'rootCommentId',
  ]);

  if (
    type.startsWith('GUESTHOUSE_RESERVATION_USER_') ||
    type === 'GUESTHOUSE_CHECKIN_INFO' ||
    type === 'GUESTHOUSE_TODAY_CHECKIN_USER'
  ) {
    if (!isLoggedInUser()) {
      showLoginRequiredModal(undefined, navigation);
      return;
    }

    if (!reservationId) {
      targetNotification = await fetchNotificationDetail(targetNotification);
      type = String(
        getNestedFirstValue(targetNotification, ['type', 'targetType']) || type,
      ).toUpperCase();
      reservationId = getNestedFirstValue(targetNotification, ['reservationId']);
    }

    if (reservationId) {
      if (isGuesthouseCancellationType(type)) {
        navigateTo(navigation, 'GuesthouseCancelledReceipt', {reservationId});
        return;
      }

      navigateTo(navigation, 'GuesthousePaymentReceipt', {reservationId});
      return;
    }

    navigateTo(navigation, 'UserReservationCheck');
    return;
  }

  if (
    type.startsWith('PARTY_RESERVATION_USER_') ||
    type === 'PARTY_RESERVATION_REJECTED' ||
    type === 'PARTY_INVITATION' ||
    type === 'PARTY_CHECKIN_INFO' ||
    type === 'PARTY_CANCELLED_BY_HOST'
  ) {
    if (!isLoggedInUser()) {
      showLoginRequiredModal(undefined, navigation);
      return;
    }

    if (!reservationId) {
      targetNotification = await fetchNotificationDetail(targetNotification);
      type = String(
        getNestedFirstValue(targetNotification, ['type', 'targetType']) || type,
      ).toUpperCase();
      reservationId = getNestedFirstValue(targetNotification, ['reservationId']);
      partyId = getNestedFirstValue(targetNotification, ['partyId']);
    }

    if (reservationId) {
      if (isPartyCancellationType(type)) {
        navigateTo(navigation, 'MeetCancelledReceipt', {reservationId});
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

      navigateTo(navigation, 'MeetPaymentReceipt', {reservationId});
      return;
    }

    if (partyId) {
      navigateTo(navigation, 'MeetDetail', {partyId});
      return;
    }

    navigateTo(navigation, 'UserMeetReservationCheck');
    return;
  }

  if (deeplink && openDeeplinkTarget(deeplink, navigation)) {
    return;
  }

  if (type === 'REVIEW_COMMENT_NEW' || type === 'REVIEW_SUB_COMMENT_NEW') {
    navigateTo(navigation, 'UserGuesthouseReview');
    return;
  }

  if (type === 'COMMUNITY_COMMENT_NEW' || type === 'COMMUNITY_REPLY_NEW') {
    const fallbackRouteName =
      type === 'COMMUNITY_REPLY_NEW'
        ? 'MyCommunityCommentList'
        : 'MyCommunityPostList';

    if (!communityPostId && !communityCommentId) {
      targetNotification = await fetchNotificationDetail(targetNotification);
      communityPostId = getNestedFirstValue(targetNotification, [
        'postId',
        'communityPostId',
        'targetPostId',
        'articleId',
      ]);
      communityCommentId = getNestedFirstValue(targetNotification, [
        'targetCommentId',
        'commentId',
        'communityCommentId',
        'replyId',
      ]);
      communityParentCommentId = getNestedFirstValue(targetNotification, [
        'parentId',
        'parentCommentId',
        'rootCommentId',
      ]);
    }

    if (!communityCommentId && communityParentCommentId) {
      communityCommentId = communityParentCommentId;
    }

    if (communityPostId) {
      navigateTo(navigation, 'CommunityDetail', {
        postId: communityPostId,
        ...(communityCommentId ? {targetCommentId: communityCommentId} : {}),
        fallbackRouteName,
        ...(communityParentCommentId
          ? {
              commentAnchor: buildCommunityCommentAnchor(
                communityCommentId,
                communityParentCommentId,
              ),
            }
          : {}),
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
          navigateTo(navigation, 'CommunityDetail', {
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

    navigateTo(navigation, fallbackRouteName);
    return;
  }

  if (partyId) {
    navigateTo(navigation, 'MeetDetail', {partyId});
    return;
  }

  if (guesthouseId) {
    navigateTo(navigation, 'GuesthouseDetail', {id: guesthouseId});
  }
};
