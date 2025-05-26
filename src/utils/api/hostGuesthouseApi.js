import api from './axiosInstance';

const hostGuesthouseApi = {
  // 사장님 전체 게스트하우스 조회
  getMyGuesthouses: () => api.get('/host/guesthouses'),

  // 특정 게스트하우스 상세 조회
  getGuesthouseDetail: guesthouseId =>
    api.get(`/host/guesthouses/${guesthouseId}`),

  // 게스트하우스 등록
  registerGuesthouse: guesthouseData =>
    api.post('/host/guesthouses', guesthouseData),

  // 게스트하우스 수정
  updateGuesthouse: (guesthouseId, updatedData) =>
    api.put(`/host/guesthouses/${guesthouseId}`, updatedData),

  // 게스트하우스 삭제
  deleteGuesthouse: guesthouseId =>
    api.delete(`/host/guesthouses/${guesthouseId}`),
};

export default hostGuesthouseApi;
