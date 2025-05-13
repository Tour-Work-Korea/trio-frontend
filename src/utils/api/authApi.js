import axiosInstance from './axiosInstance';

const authApi = {
  //이메일 인증
  sendEmail: email => axiosInstance.post('/auth/email/send', email),
  verifyEmail: (email, authCode) =>
    axiosInstance.post('/auth/email/send', {email, authCode}),

  //사업자 번호 인증
  verifyBusiness: businessNumber =>
    axiosInstance.post('/auth/business/verify', businessNumber),

  //사장님 회원가입
  hostSignUp: hostData => axiosInstance.post('/auth/host/signup', hostData),
};

export default authApi;
