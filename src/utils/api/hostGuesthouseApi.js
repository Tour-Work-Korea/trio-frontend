import api from './axiosInstance';

const hostGuesthouseApi = {
  //사장님 나의 게스트하우스 목록 조회
  getMyGuesthouse: () => api.get('/host/guesthouses'),
};

export default hostGuesthouseApi;
