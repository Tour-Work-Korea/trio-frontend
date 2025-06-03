import api from './axiosInstance';

const userEmployApi = {
  //채용 공고 목록 조회
  getRecruits: page => api.get('/user/recruits', page),

  //특정 채용공고 상세 조회
  getRecruitById: recruitId => api.get(`/user/recruits/${recruitId}`),

  //공고 즐겨찾기 추가
  addLikeRecruitById: recruitId =>
    api.post(`/user/recruits/favorites/${recruitId}`),

  //공고 즐겨찾기 삭제제
  deleteLikeRecruitById: recruitId =>
    api.delete(`/user/recruits/favorites/${recruitId}`),

  //이력서 생성
  addResume: resumeData => api.post('/user/recruits/resume', resumeData),

  //이력서 수정
  updateResume: (resumeId, resumeData) =>
    api.put(`/user/recruits/resume/${resumeId}`, resumeData),

  //이력서 삭제
  deleteResume: resumeId => api.delete(`/user/recruits/resume/${resumeId}`),

  //나의 이력서 목록 조회
  getResumes: () => api.get('/user/recruits/resume'),

  //나의 이력서 상세 조회
  getResumeById: resumeId => api.get(`/user/recruits/resume/${resumeId}`),

  //지원하기
  apply: (recruitId, applyData) =>
    api.post(`/user/recruits/${recruitId}/apply`, applyData),
};

export default userEmployApi;
