import api from './axiosInstance';
import Config from 'react-native-config';

// baseURL에서 /api/v1 제거
const API_ORIGIN = (Config.API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');

const adminApi = {
  // 배너 이미지 3개 조회
  getAdminBanners: () =>
    api.get('/admin/adminImage-list', {
      baseURL: API_ORIGIN,
      withAuth: false,
    }),

};

export default adminApi;
