import api from './axiosInstance';

const normalizeMyProfilePayload = draft => ({
  nickname: draft?.nickname ?? '',
  photoUrl: draft?.photoUrl ?? '',
  mbti: draft?.mbti ?? '',
  instagramId: draft?.instagramId ?? '',
});

const userMyApi = {
  // 유저 프로필 정보 조회
  getMyProfile: () => api.get('/user/my'),

  // 유저 좋아요 누른 게하 리스트
  getMyFavoriteGuesthouses: () => api.get('/user/my/guesthouse'),

  // 유저 게하 좋아요 취소
  unfavoriteGuesthouse: guesthouseId =>
    api.delete(`/user/guesthouses/favorites/${guesthouseId}`),

  // 유저 게하 예약 리스트
  getMyReservations: () => api.get('/payments/toss/reservation/room'),

  // 게하 예약 상세 조회
  getReservationDetail: reservationId =>
    api.get(`/order/reservation/room/${reservationId}`),

  // 게하 예약 임시 취소
  cancelTempGuesthouseReservation: reservationId =>
    api.delete(`/order/reservation/temp/guesthouse/cancel/${reservationId}`),

  // 유저 작성한 리뷰 리스트
  getMyReviews: () => api.get('/user/reviews/my'),

  // 리뷰 작성
  createReview: (guesthouseId, data) =>
    api.post(`/user/reviews/${guesthouseId}`, data),

  // 리뷰 삭제
  deleteReview: reviewId => api.delete(`/user/reviews/${reviewId}`),

  //유저 프로필 정보 수정
  updateMyProfile: draft =>
    api.put('/user/my', normalizeMyProfilePayload(draft)),
  updateNickname: data => api.put('/user/my/nickname', data),
  updateMbti: data => api.put('/user/my/mbti', data),
  updateInstagram: data => api.put('/user/my/instagram', data),
  updatePhone: data => api.put('/user/my/phone', data),

  // 포인트 잔액 조회
  getPointBalance: () => api.get('/points/me/balance'),

  // 포인트 내역 조회
  getPointHistory: ({page, size, sort = []}) =>
    api.get('/points/me/history', {
      params: {
        page,
        size,
        sort,
      },
    }),

  // 내 쿠폰 조회
  getMyCoupons: () => api.get('/coupons/my'),

  // 다운로드 가능한 쿠폰 조회
  getAvailableCoupons: () => api.get('/coupons/available'),

  // 쿠폰 템플릿 발급
  issueCouponByTemplate: templateId =>
    api.post(`/coupons/${templateId}/issue`),

  // 쿠폰 코드 발급
  issueCouponByCode: couponCode =>
    api.post('/coupons/code/issue', {couponCode}),

  // 파티 예약 내역 조회
  getMyPartyReservations: () => api.get('/order/reservation/party'),

  // 파티 예약 상세 조회
  getMyPartyReservationDetail: (partyReservationId) =>
    api.get(`/order/reservation/party/${partyReservationId}`),
};

export default userMyApi;
