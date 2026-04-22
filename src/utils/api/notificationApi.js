import api from './axiosInstance';

const notificationApi = {
  // 기기 토큰 등록/갱신
  registerToken: (deviceId, fcmToken) => {
    return api.post('/api/v1/notifications/token', {
      deviceId,
      fcmToken,
    });
  },

  // 기기 토큰 연결 끊기 (로그아웃 시)
  logoutToken: () => {
    return api.post('/api/v1/notifications/token/logout');
  },

  // 내 알림 조회
  getMyNotifications: (page = 0, size = 10) => {
    return api.get('/api/v1/notifications/me', {
      params: { page, size, sort: 'createdAt,desc' },
    });
  },

  // 안 읽은 알림 개수 조회
  getUnreadCount: () => {
    return api.get('/api/v1/notifications/unread-count');
  },

  // 알림 단건 조회
  getNotification: (notificationId) => {
    return api.get(`/api/v1/notifications/${notificationId}`);
  },

  // 전체 알림 읽음 처리
  markAllAsRead: () => {
    return api.patch('/api/v1/notifications/read-all');
  },
};

export default notificationApi;
