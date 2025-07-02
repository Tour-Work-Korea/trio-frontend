import api from './axiosInstance';

const authApi = {
  //이메일 인증
  sendEmail: (email, userRole) =>
    api.post('/auth/email/send', null, {
      params: {email, userRole},
      withAuth: false, // 토큰 미포함시
    }),
  verifyEmail: (email, authCode) =>
    api.post('/auth/email/verify', null, {
      params: {email, authCode},
      withAuth: false,
    }),

  //사업자 번호 인증
  verifyBusiness: businessNumber =>
    api.post('/auth/business/verify', null, {
      params: {businessNumber},
      withAuth: false,
    }),
  //휴대폰 인증
  sendSms: (phoneNum, userRole) =>
    api.post('/auth/sms/send', null, {
      params: {phoneNum, userRole},
      withAuth: false,
    }),
  verifySms: (phoneNum, code) =>
    api.post('/auth/sms/verify', null, {
      params: {phoneNum, code},
      withAuth: false,
    }),
  //사장님 회원가입
  hostSignUp: hostData =>
    api.post('/auth/host/signup', hostData, {withAuth: false}),

  userSignUp: userData =>
    api.post('/auth/user/signup', userData, {withAuth: false}),

  //로그인
  login: (email, password) =>
    api.post('/auth/login', {email, password}, {withAuth: false}),

  //토큰 재발급
  refreshToken: () =>
    api.post('/auth/refresh', null, {
      withAuth: false,
    }),

  //카카오 로그인
  loginKakao: accessCode =>
    api.post(
      '/auth/user/social-login',
      {provider: 'KAKAO', accessCode},
      {withAuth: false},
    ),
  //닉네임 중복 확인
  checkNickname: nickname =>
    api.get('/auth/user/nickname/check', {
      params: {nickname},
      withAuth: false,
    }),
};

export default authApi;
