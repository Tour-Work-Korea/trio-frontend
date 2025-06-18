import api from './axiosInstance';

const hostMyApi = {
  //사장님 프로필 정보 조회
  getMyProfile: () => api.get('/host/my'),

  //사장님 프로필 정보 수정
  updateMyProfile: (label, updateData) =>
    api.put(`/host/my/${label}`, updateData),
};

export default hostMyApi;
