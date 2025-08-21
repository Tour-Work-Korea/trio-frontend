// @data/agree.ts
import {AGREEMENT_CONTENT} from './agreeContents';

// 회원가입 시 유저 약관 동의
export const userRegisterAgrees = [
  {
    id: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.USER.TERMS_OF_SERVICE.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'AGE_OVER_14_CONFIRMATION',
    title: '만 14세 이상 확인',
    description: AGREEMENT_CONTENT.USER.AGE_OVER_14_CONFIRMATION.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'PRIVACY_POLICY',
    title: '개인정보 수집 및 이용 동의',
    description: AGREEMENT_CONTENT.USER.PRIVACY_POLICY.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'LOCATION_BASED_SERVICE',
    title: '위치기반 서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.USER.LOCATION_BASED_SERVICE.detailHtml,
    isRequired: true, // ← 너 초안엔 선택이지만, 요구사항에 맞춰 여기서 true/false 조정
    isAgree: false,
  },
  {
    id: 'MARKETING_NOTIFICATION',
    title: '마케팅 알림 수신 동의',
    description: AGREEMENT_CONTENT.USER.MARKETING_NOTIFICATION.detailHtml,
    isRequired: false,
    isAgree: false,
  },
];

// 지원하기 시 유저 약관 동의
export const userApplyAgrees = [
  {
    id: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.USER.TERMS_OF_SERVICE.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'AGE_OVER_14_CONFIRMATION',
    title: '만 14세 이상 확인',
    description: AGREEMENT_CONTENT.USER.AGE_OVER_14_CONFIRMATION.detailHtml,
    isRequired: true,
    isAgree: false,
  },
];

// 사장 회원가입/입점신청 동의
export const hostRegisterAgrees = [
  {
    id: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.HOST.TERMS_OF_SERVICE.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'AGE_OVER_14_CONFIRMATION',
    title: '만 14세 이상 확인',
    description: AGREEMENT_CONTENT.HOST.AGE_OVER_14_CONFIRMATION.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'PRIVACY_POLICY',
    title: '개인정보 수집 및 이용 동의',
    description: AGREEMENT_CONTENT.HOST.PRIVACY_POLICY.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'LOCATION_BASED_SERVICE',
    title: '위치기반 서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.HOST.LOCATION_BASED_SERVICE.detailHtml,
    isRequired: false,
    isAgree: false,
  },
  {
    id: 'MARKETING_NOTIFICATION',
    title: '마케팅 알림 수신 동의',
    description: AGREEMENT_CONTENT.HOST.MARKETING_NOTIFICATION.detailHtml,
    isRequired: false,
    isAgree: false,
  },
];

// 입점신청 시 사장 약관 동의(간소)
export const hostStorRegisterAgrees = [
  {
    id: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관 동의',
    description: AGREEMENT_CONTENT.HOST.TERMS_OF_SERVICE.detailHtml,
    isRequired: true,
    isAgree: false,
  },
  {
    id: 'PRIVACY_POLICY',
    title: '개인정보 수집 및 이용 동의',
    description: AGREEMENT_CONTENT.HOST.PRIVACY_POLICY.detailHtml,
    isRequired: true,
    isAgree: false,
  },
];
