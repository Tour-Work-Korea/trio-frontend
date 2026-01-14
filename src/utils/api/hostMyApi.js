import api from './axiosInstance';

const hostMyApi = {
  //사장님 프로필 정보 조회
  getMyProfile: () => api.get('/host/my'),

  //사장님 프로필 정보 일괄 수정
  updateMyProfile: async formData => api.put('/host/my', formData),

  // 사장님 닉네임(이름) 수정
  updateNickname: data => api.put('/host/my/nickname', data),

  // 사장님 이메일 수정
  updateEmail: data => api.put('/host/my/email', data),

  // 사장님 전화번호 수정
  updatePhone: data => api.put('/host/my/phone', data),

  // 사장님 프로필 사진 수정
  updatePhoto: data => api.put('/host/my/photo', data),

  //사장님 사업자 번호 등록
  updateBusinessNum: businessNum =>
    api.post('/host/my/businessNum', businessNum),
};

export default hostMyApi;
