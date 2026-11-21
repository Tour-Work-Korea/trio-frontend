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

  // 협업 배너 클릭 시점의 현재 공개 회차 조회
  getMainBannerContentTarget: bannerId =>
    api.get(`/public/banners/main/${bannerId}/target`, {
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
