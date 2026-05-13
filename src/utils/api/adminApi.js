import api from './axiosInstance';
import {API_BASE_URL} from '@env';

// baseURL에서 /api/v1 제거
const API_ORIGIN = (API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');

const adminApi = {
  // 메인 화면 배너 이미지 3개 조회
  getAdminBanners: () =>
    api.get('/admin/adminImage-list', {
      baseURL: API_ORIGIN,
      withAuth: false,
    }),

  // 콘텐츠 화면 배너 이미지 3개 조회
  getMeetAdminBanners: () =>
    api.get('/admin/partyBanner-list', {
      baseURL: API_ORIGIN,
      withAuth: false,
    }),
};

export default adminApi;
