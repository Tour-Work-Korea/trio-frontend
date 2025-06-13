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

  // 특정 게스트하우스 리뷰 목록 조회 
  getGuesthouseReviews: ({ guesthouseId, page, size, sort }) =>
    api.get(`/${guesthouseId}/reviews`, {
      params: {
        page,
        size,
        sort,
      },
    }),

  // 리뷰에 대한 답글 작성
  postReviewReply: (reviewId, reply) =>
    api.post(`/host/reviews/${reviewId}/replies`, { reply }),

  // 리뷰 삭제
  deleteReview: (reviewId, reason) =>
    api.delete(`/host/reviews/${reviewId}`, {
      data: { reason }
    }),

  // 사장님 입점신청서 조회
  getHostApplications: () =>
    api.get('/host/my/application'),

};

export default hostGuesthouseApi;
