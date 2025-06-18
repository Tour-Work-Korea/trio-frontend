import api from './axiosInstance';

const userMyApi = {
  // 유저 프로필 정보 조회
  getMyProfile: () => api.get('/user/my'),

  // 유저 좋아요 누른 게하 리스트
  getMyFavoriteGuesthouses: () => api.get('/user/my/guesthouse'),

  // 유저 예약 리스트
  getMyReservations: () => api.get('/order/reservation/room'),

  // 예약 상세 조회
  getReservationDetail: reservationId =>
    api.get(`/order/reservation/room/${reservationId}`),

  // 유저 작성한 리뷰 리스트
  getMyReviews: () => api.get('/user/reviews/my'),

  //유저 프로필 정보 수정
  updateMyProfile: (label, updateData) =>
    api.put(`/user/my/${label}`, updateData),
};

export default userMyApi;
