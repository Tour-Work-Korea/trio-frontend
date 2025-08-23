import useUserStore from '@stores/userStore';
import api from './axiosInstance';

const {setUserRole} = useUserStore.getState();

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
  login: (email, password, userRole) =>
    api.post('/auth/login', {email, password, userRole}, {withAuth: false}),

  //토큰 재발급
  refreshToken: async refreshToken => {
    const url = '/auth/refresh';
    console.log(`🔄 Refresh Request: POST ${url}`);

    try {
      const res = await api.post(
        url,
        {refreshToken},
        {
          withAuth: false,
        },
      );
      return res;
    } catch (err) {
      console.warn(
        '🧨 [authApi.refreshToken] 실패=>userRole 리셋',
        err.response?.status,
        err.response?.data || err.message,
      );
      setUserRole('');

      throw err;
    }
  },

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

  //계정 찾기용 전화번호 인증번호 발송
  verifySelfByPhone: (phoneNum, userRole) =>
    api.post('/auth/find/send-code', null, {
      params: {phoneNum, role: userRole},
      withAuth: false,
    }),

  //아이디 찾기
  findId: (phoneNum, role) =>
    api.get('/auth/find/email', {
      params: {
        phoneNum,
        role,
      },
      withAuth: false,
    }),

  //비밀번호 찾기
  findPassword: body =>
    api.post('/auth/find/password', body, {withAuth: false}),
};

export default authApi;
