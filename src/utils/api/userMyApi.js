import api from './axiosInstance';

const userMyApi = {
  // 유저 프로필 정보 조회
  getMyProfile: () => api.get('/user/my'),

  // 유저 좋아요 누른 게하 리스트
  getMyFavoriteGuesthouses: () => api.get('/user/my/guesthouse'),

  // 유저 게하 좋아요 취소
  unfavoriteGuesthouse: guesthouseId =>
    api.delete(`/user/guesthouses/favorites/${guesthouseId}`),

  // 유저 예약 리스트
  getMyReservations: () => api.get('/order/reservation/room'),

  // 예약 상세 조회
  getReservationDetail: reservationId =>
    api.get(`/order/reservation/room/${reservationId}`),

  // 예약 임시 취소
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
  // updateMyProfile: async (field, value) => {
  //   const config = userFieldMap[field];
  //   if (!config) throw new Error('지원하지 않는 필드');

  //   const body = {[config.key]: value};
  //   return api.put(`/user/my/${config.path}`, body);
  // },
  updateMyProfile: draft => api.put('/user/my', draft),
};

export default userMyApi;

const userFieldMap = {
  name: {path: 'nickname', key: 'name'},
  email: {path: 'email', key: 'email'},
  phone: {path: 'phone', key: 'phoneNumber'},
  mbti: {path: 'mbti', key: 'mbti'},
  instagramId: {path: 'instagram', key: 'instagramId'},
  photoUrl: {path: 'photo', key: 'photoUrl'},
};
