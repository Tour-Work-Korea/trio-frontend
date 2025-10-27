import api from './axiosInstance';

const userEmployApi = {
  //채용 공고 목록 조회
  getRecruits: (params = {}, isAuth = false) =>
    api.get('/user/recruits', {
      params,
      withAuth: isAuth,
    }),
  //특정 채용공고 상세 조회
  getRecruitById: (recruitId, isAuth = false) =>
    api.get(`/user/recruits/${recruitId}`, {withAuth: isAuth}),

  //공고 즐겨찾기 추가
  addLikeRecruitById: recruitId =>
    api.post(`/user/recruits/favorites/${recruitId}`),

  //공고 즐겨찾기 삭제
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

  //이력서 작성 시, 내 기본 정보 조회
  getMyBasicInfo: () => api.get('/user/recruits/resume/myInfo'),

  //이력서 작성 시, 유저 해시태그 조회
  getUserHashtags: () => api.get('/user/recruits/hashtags'),

  //즐겨찾기한 공고 조회
  getLikeRecruits: () => api.get('/user/my/recruit'),

  //나의 지원현황 조회
  getMyApplications: () => api.get('/user/my/applications'),

  //지원 취소
  deleteApply: id => api.delete(`/user/my/applications/${id}`),

  //지원현황에서 지원서 상세 조회
  getMyApplicationById: applicationId =>
    api.get(`/user/my/applications/${applicationId}`),

  //공고 리뷰 조회
  getEmployReviews: () => api.get('/user/recruits/reviews'),
};

export default userEmployApi;
