import api from './axiosInstance';

const userMeetApi = {
  // 모임 공고 7일치 조회
  getRecentParties: (params = {}) =>
    api.get('/user/parties', { params }),

  // 모임 공고 전체 조회 및 검색
  searchParties: (params = {}) =>
    api.get('/user/parties/search', { params }),

  // 모임 즐겨찾기 등록
  addFavorite: (partyId) => 
    api.post(`/user/parties/favorite/${partyId}`),

  // 모임 즐겨찾기 해제
  removeFavorite: (partyId) => 
    api.delete(`/user/parties/favorite/${partyId}`),

  // 즐겨찾기 한 모임 조회
  getFavoriteParties: () =>
    api.get('/user/my/party'),

  // 모임 상세 조회
  getPartyDetail: (partyId) => 
    api.get(`/user/parties/${partyId}`),

  // 모임 참가 정보 조회 (요금 계산 포함)
  joinParty: (partyId) => 
    api.get(`/user/parties/join/${partyId}`),

  // 모임 예약 생성
  createPartyReservation: (partyId, request) =>
    api.post(`/order/reservation/party/${partyId}`, { request }),

  // 모임 결제 검증 및 확정
  verifyPayment: (reservationId, paymentId) =>
    api.post(`/order/payment/${reservationId}`, {
      paymentId,
      reservationType: "PARTY",
    }),
};

export default userMeetApi;
