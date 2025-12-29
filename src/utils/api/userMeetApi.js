import api from './axiosInstance';

const userMeetApi = {
  // 이벤트 공고 7일치 조회
  getRecentParties: (params = {}) => api.get('/user/parties', {params, withAuth: false}),

  // 이벤트 공고 전체 조회 및 검색
  searchParties: (params = {}) => api.get('/user/parties/search', {params, withAuth: false}),

  // 이벤트 즐겨찾기 등록
  addFavorite: partyId => api.post(`/user/parties/favorite/${partyId}`),

  // 이벤트 즐겨찾기 해제
  removeFavorite: partyId => api.delete(`/user/parties/favorite/${partyId}`),

  // 즐겨찾기 한 이벤트 조회
  getFavoriteParties: () => api.get('/user/my/party'),

  // 이벤트 상세 조회
  getPartyDetail: partyId => api.get(`/user/parties/${partyId}`, {withAuth: false}),

  // 이벤트 참가 정보 조회 (요금 계산 포함)
  joinParty: partyId => api.get(`/user/parties/join/${partyId}`),

  // 이벤트 예약 생성
  createPartyReservation: (partyId, request) =>
    api.post(`/order/reservation/party/${partyId}`, {request}),

  // 이벤트 결제 검증 및 확정
  verifyPayment: (reservationId, body) =>
    api.post(`/order/payment/${reservationId}`, body),
};

export default userMeetApi;
