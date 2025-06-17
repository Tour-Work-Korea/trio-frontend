import api from './axiosInstance';

const userGuesthouseApi = {

  // 유저 게스트하우스 검색 조회
  getGuesthouseList: (params) =>
    api.get('/user/guesthouses', { params }),

  // 유저 게스트하우스 상세 조회
  getGuesthouseDetail: ({ guesthouseId, checkIn, checkOut, guestCount }) =>
    api.get(`/user/guesthouses/${guesthouseId}`, {
      params: {
        checkIn,
        checkOut,
        guestCount,
      },
    }),

  // 게스트하우스 좋아요
  favoriteGuesthouse: (guesthouseId) =>
    api.post(`/user/guesthouses/favorites/${guesthouseId}`),

  // 게스트하우스 좋아요 취소
  unfavoriteGuesthouse: (guesthouseId) =>
    api.delete(`/user/guesthouses/favorites/${guesthouseId}`),

  // 방 예약 생성
  reserveRoom: (roomId, body) =>
    api.post(`/order/reservation/room/${roomId}`, body),

  // 결제 검증 및 확정
  verifyPayment: (reservationId, body) =>
    api.post(`/order/payment/${reservationId}`, body),

  // 특정 게스트하우스의 리뷰 조회
  getGuesthouseReviews: ({ guesthouseId, page, size, sort }) =>
    api.get(`/${guesthouseId}/reviews`, {
      params: {
        page,
        size,
        sort,
      },
    }),

};

export default userGuesthouseApi;
