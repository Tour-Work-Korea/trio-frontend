import api from './axiosInstance';

const hostMyApi = {
  //사장님 프로필 정보 조회
  getMyProfile: () => api.get('/host/my'),

  //사장님 프로필 정보 수정
  updateMyProfile: async (field, value) => {
    const config = hostFieldMap[field];
    if (!config) throw new Error('지원하지 않는 필드');

    const body = {[config.key]: value};
    return api.put(`/host/my/${config.path}`, body);
  },

  //사장님 사업자 번호 등록
  updateBusinessNum: businessNum =>
    api.post('/host/my/businessNum', businessNum),
};

export default hostMyApi;

const hostFieldMap = {
  name: {path: 'nickname', key: 'name'},
  email: {path: 'email', key: 'email'},
  phone: {path: 'phone', key: 'phoneNumber'},
  photoUrl: {path: 'photo', key: 'photoUrl'},
};
