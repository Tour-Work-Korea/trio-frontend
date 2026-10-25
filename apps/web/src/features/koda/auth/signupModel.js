import {validateRegisterProfile} from '../../../../../../packages/app/src/utils/validation/registerValidation.js';
import {safeKodaReturn} from './authReturn.js';

export function clubSignupHref(destination, language = 'ko') {
  const query = new URLSearchParams({lang: language === 'en' ? 'en' : 'ko'});
  const target = safeKodaReturn(destination);
  if (target) query.set('returnTo', target);
  return `/koda/join/?${query}`;
}

export function signupDestination(search, language) {
  return (
    safeKodaReturn(new URLSearchParams(search).get('returnTo')) ||
    `/koda/my/?lang=${language === 'en' ? 'en' : 'ko'}`
  );
}

export function isVerificationRecipient(kind, value) {
  return kind === 'email'
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    : /^\d{11}$/.test(value);
}

export function isEligibleBirthday(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const birth = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(+birth) || birth.toISOString().slice(0, 10) !== value)
    return false;
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [year, month, day] = today.split('-').map(Number);
  const age =
    year -
    birth.getUTCFullYear() -
    (month < birth.getUTCMonth() + 1 ||
    (month === birth.getUTCMonth() + 1 && day < birth.getUTCDate())
      ? 1
      : 0);
  return age >= 14;
}

export function canSubmitSignup(
  {
    form,
    agreements,
    definitions,
    verifiedEmail,
    verifiedPhone,
    checkedNickname,
  },
  now,
) {
  const valid = validateRegisterProfile(form);
  return Boolean(
    definitions.length &&
      definitions
        .filter(item => item.isRequired)
        .every(item => agreements[item.id] === true) &&
      isVerificationRecipient('email', form.email) &&
      form.email === verifiedEmail &&
      isVerificationRecipient('phone', form.phoneNum) &&
      form.phoneNum === verifiedPhone &&
      form.name.trim() &&
      isEligibleBirthday(form.birthday, now) &&
      ['M', 'F'].includes(form.gender) &&
      checkedNickname === form.nickname &&
      Object.values(valid.nickname).every(Boolean) &&
      Object.values(valid.password).every(Boolean) &&
      valid.passwordConfirm.isMatched,
  );
}

export function signupPayload(form, agreements, definitions) {
  return {
    email: form.email,
    phoneNum: form.phoneNum,
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    nickname: form.nickname,
    name: form.name.trim(),
    birthday: form.birthday,
    gender: form.gender,
    userRole: 'USER',
    agreements: definitions.map(item => ({
      agreementType: item.id,
      agreed: agreements[item.id] === true,
    })),
  };
}

// Registration and automatic login are separate outcomes: never submit signup again
// just because the new account's first login failed.
export async function completeEmailSignup({register, login, payload}) {
  await register(payload);
  try {
    await login(payload.email, payload.password, 'USER');
    return {registered: true, loggedIn: true};
  } catch {
    return {registered: true, loggedIn: false};
  }
}
