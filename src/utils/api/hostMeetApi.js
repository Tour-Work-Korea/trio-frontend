import api from './axiosInstance';

const hostMeetApi = {
  // 사장님 파티 공고 전체 조회
  getMyParties: () =>
    api.get('/host/parties'),

  // 파티 공고 상세 조회
  getPartyDetail: (partyId) =>
    api.get(`/host/parties/${partyId}`),

  // 파티 공고 등록
  createParty: (data) =>
    api.post('/host/parties', data),

  // 파티 공고 수정
  updateParty: (partyId, data) =>
    api.put(`/host/parties/${partyId}`, data),

  // 파티 해시태그 (시설/서비스) 리스트 조회
  getPartyFacilities: () =>
    api.get('/host/parties/facilities'),


};

export default hostMeetApi;