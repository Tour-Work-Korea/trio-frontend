import {AGREEMENT_CONTENT} from './agreeContents';

const createAgreement = (id, isRequired) => ({
  id,
  titleKey: `agreements.${id}.title`,
  get title() {
    return AGREEMENT_CONTENT.USER[id].title;
  },
  get description() {
    return AGREEMENT_CONTENT.USER[id].detailHtml;
  },
  isRequired,
  isAgree: false,
});

export const userRegisterAgrees = [
  createAgreement('TERMS_OF_SERVICE', true),
  createAgreement('AGE_OVER_14_CONFIRMATION', true),
  createAgreement('PRIVACY_POLICY', true),
  createAgreement('LOCATION_BASED_SERVICE', false),
  createAgreement('MARKETING_NOTIFICATION', false),
];

export const userApplyAgrees = [
  createAgreement('TERMS_OF_SERVICE', true),
  createAgreement('AGE_OVER_14_CONFIRMATION', true),
];
