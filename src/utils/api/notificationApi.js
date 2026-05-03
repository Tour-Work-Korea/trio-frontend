import api from './axiosInstance';

const notificationApi = {
  // 기기 토큰 등록/갱신
  registerToken: (deviceId, fcmToken) => {
    return api.post('/notifications/token', {
      deviceId,
      fcmToken,
      appType: 'USER',
    });
  },

  // 기기 토큰 연결 끊기 (로그아웃 시)
  logoutToken: (deviceId) => {
    return api.post('/notifications/token/logout', { deviceId, appType: 'USER' });
  },

  // 내 알림 조회
  getMyNotifications: (page = 0, size = 50) => {
    return api.get('/notifications/me', {
      params: { page, size, sort: 'createdAt,desc' },
    });
  },

  // 안 읽은 알림 개수 조회
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // 알림 단건 조회
  getNotification: (notificationId) => {
    return api.get(`/notifications/${notificationId}`);
  },

  getDetail: notificationId => {
    return api.get(`/notifications/${notificationId}`);
  },

  // 전체 알림 읽음 처리
  markAllAsRead: () => {
    return api.patch('/notifications/read-all');
  },

  readAll: () => {
    return api.patch('/notifications/read-all');
  },
};

export default notificationApi;
