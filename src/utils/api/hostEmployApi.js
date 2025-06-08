import api from './axiosInstance';

const hostEmployApi = {
  //사장님 채용공고 등록
  createRecruit: createRecruitData =>
    api.post('/host/recruits', createRecruitData),

  //사장님 나의 채용공고 목록 조회
  getMyRecruits: () => api.get('/host/recruits'),

  //채용공고 상세 조회
  getRecruitDetail: recruitId => api.get(`/host/recruits/${recruitId}`),

  //채용공고 수정
  updateRecruit: (recruitId, updateRecruitData) =>
    api.put(`/host/recruits/${recruitId}`, updateRecruitData),

  //채용공고 삭제 요청
  requestDeleteRecruit: (recruitId, reason) =>
    api.post(`/host/recruits/${recruitId}`, reason),

  //지원서 전체 조회
  getAllApplicants: () => api.get('/host/recruits/applications'),

  //지원서 상세 조회
  getApplicantDetail: applicantId =>
    api.get(`/host/recruits/applications/detail/${applicantId}`),

  //게스트하우스 별 지원서 조회
  getApplicantsByGuesthouse: guesthouseId =>
    api.get(`/host/recruits/applications/${guesthouseId}`),

  //host 해시태그 조회
  getHostHashtags: () => api.get('/host/recruits/hashtags'),
};

export default hostEmployApi;
