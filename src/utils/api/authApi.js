import api from './axiosInstance';

const authApi = {
  //이메일 인증
  sendEmail: email =>
    api.post('/auth/email/send', null, {
      params: {email},
    }),
  verifyEmail: (email, authCode) =>
    api.post('/auth/email/verify', null, {
      params: {email, authCode},
    }),

  //사업자 번호 인증
  verifyBusiness: businessNumber =>
    api.post('/auth/business/verify', null, {
      params: {businessNumber},
    }),

  //사장님 회원가입
  hostSignUp: hostData => api.post('/auth/host/signup', hostData),
};

export default authApi;
