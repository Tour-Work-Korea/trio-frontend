import api from './axiosInstance';

const userMeetApi = {
  // 콘텐츠 공고 7일치 조회
  getRecentParties: (params = {}) => api.get('/user/parties', {params, withAuth: false}),

  // 콘텐츠 공고 전체 조회 및 검색
  searchParties: (params = {}) => api.get('/user/parties/search', {params, withAuth: false}),

  // 콘텐츠 즐겨찾기 등록
  addFavorite: partyId => api.post(`/user/parties/favorite/${partyId}`),

  // 콘텐츠 즐겨찾기 해제
  removeFavorite: partyId => api.delete(`/user/parties/favorite/${partyId}`),

  // 즐겨찾기 한 콘텐츠 조회
  getFavoriteParties: () => api.get('/user/my/party'),

  // 콘텐츠 상세 조회
  getPartyDetail: partyId => api.get(`/user/parties/${partyId}`, {withAuth: false}),

  // 콘텐츠 참가 정보 조회 (요금 계산 포함)
  joinParty: partyId => api.get(`/user/parties/join/${partyId}`),

  // 콘텐츠 예약 생성
  createPartyReservation: (partyId, body) =>
    api.post(`/order/reservation/party/${partyId}`, body),

  // 콘텐츠 결제 검증 및 확정
  verifyPayment: (reservationId, body) =>
    api.post(`/order/payment/${reservationId}`, body),

  // 인기 콘텐츠 조회
  getPopularParties: () =>
    api.get('/user/parties/popular', {withAuth: false}),
};

export default userMeetApi;
