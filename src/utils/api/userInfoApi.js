import api from './axiosInstance';

const userInfoApi = {
  //유저 기본정보 조회
  getMyInfo: () => api.get('/user/my'),
};

export default userInfoApi;
