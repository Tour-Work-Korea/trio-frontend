export const PAYMENT_TYPE = {
  CARD: 'CARD',
  VIRTUAL_ACCOUNT: 'VIRTUAL_ACCOUNT',
  EASY_PAY: 'EASY_PAY',
  MOBILE_PHONE: 'MOBILE_PHONE',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CULTURE_GIFT_CERT: 'CULTURE_GIFT_CERT',
  BOOK_GIFT_CERT: 'BOOK_GIFT_CERT',
  GAME_GIFT_CERT: 'GAME_GIFT_CERT',
  UNKNOWN: 'UNKNOWN',
};

const PAYMENT_TYPE_KEY = {
  [PAYMENT_TYPE.CARD]: 'payment.method.card',
  [PAYMENT_TYPE.VIRTUAL_ACCOUNT]: 'payment.method.virtualAccount',
  [PAYMENT_TYPE.EASY_PAY]: 'payment.method.easyPay',
  [PAYMENT_TYPE.MOBILE_PHONE]: 'payment.method.mobilePhone',
  [PAYMENT_TYPE.BANK_TRANSFER]: 'payment.method.bankTransfer',
  [PAYMENT_TYPE.CULTURE_GIFT_CERT]: 'payment.method.cultureGiftCertificate',
  [PAYMENT_TYPE.BOOK_GIFT_CERT]: 'payment.method.bookGiftCertificate',
  [PAYMENT_TYPE.GAME_GIFT_CERT]: 'payment.method.gameGiftCertificate',
  [PAYMENT_TYPE.UNKNOWN]: 'payment.method.unknown',
};

export const PAYMENT_TYPE_LABEL = {};
Object.entries(PAYMENT_TYPE_KEY).forEach(([type, key]) => {
  Object.defineProperty(PAYMENT_TYPE_LABEL, type, {
    enumerable: true,
    get: () => i18n.t(key),
  });
});

export const getPaymentTypeLabel = type =>
  i18n.t(PAYMENT_TYPE_KEY[type] || PAYMENT_TYPE_KEY[PAYMENT_TYPE.UNKNOWN]);
import i18n from '../i18n';
