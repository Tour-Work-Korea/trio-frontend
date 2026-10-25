import React, {useEffect, useRef, useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import authApi from '@utils/api/authApi';
import {useClubAuth} from '../auth/ClubAuth';
import EventHeader from '../components/EventHeader';
import SignupTerms, {signupAgreements} from '../components/SignupTerms';
import SignupVerification from '../components/SignupVerification';
import SignupProfile from '../components/SignupProfile';
import {
  canSubmitSignup,
  signupPayload,
  signupDestination,
  completeEmailSignup,
} from '../auth/signupModel';
import '../styles/koda.css';
import '../styles/koda-home.css';
import '../styles/koda-signup.css';

const emptyForm = {
  email: '',
  phoneNum: '',
  nickname: '',
  name: '',
  birthday: '',
  gender: '',
  password: '',
  passwordConfirm: '',
};

export default function ClubSignup() {
  const language = useLocaleStore(state => state.language);
  const ko = language === 'ko';
  const {ready, authenticated, openLogin} = useClubAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [agreements, setAgreements] = useState({});
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [checkedNickname, setCheckedNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const pending = useRef(false);
  const active = useRef(true);
  const heading = useRef(null);
  const destination = signupDestination(window.location.search, language);
  const labels = ko
    ? ['약관 동의', '이메일 인증', '휴대폰 인증', '프로필 입력']
    : ['Terms', 'Email', 'Mobile', 'Profile'];
  const canSubmit = canSubmitSignup({
    form,
    agreements,
    definitions: signupAgreements,
    verifiedEmail,
    verifiedPhone,
    checkedNickname,
  });
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    document.title = ko ? '회원가입 | KODA CLUB' : 'Join | KODA CLUB';
  }, [ko]);
  useEffect(() => {
    heading.current?.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: 'instant'});
  }, [step, completed]);
  const update = (name, value) =>
    setForm(current => ({...current, [name]: value}));
  const submit = async event => {
    event.preventDefault();
    if (pending.current || !canSubmit || completed || authenticated) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const payload = signupPayload(form, agreements, signupAgreements);
      await completeEmailSignup({
        register: authApi.userSignUp,
        login: async (...args) => {
          const {tryLogin} = await import('@utils/auth/login');
          await tryLogin(...args);
          try {
            const {storeLastLoginProvider, LOGIN_PROVIDERS} = await import(
              '@utils/auth/lastLoginProvider'
            );
            await storeLastLoginProvider(LOGIN_PROVIDERS.EMAIL);
          } catch {
            /* Optional preference. */
          }
        },
        payload,
      });
      if (active.current) {
        setCompleted(true);
        setForm(emptyForm);
        setVerifiedEmail('');
        setVerifiedPhone('');
        setCheckedNickname('');
      }
    } catch (failure) {
      if (active.current)
        setError(
          failure?.response?.data?.message ||
            (ko
              ? '가입을 완료하지 못했어요. 입력 정보를 확인한 뒤 다시 시도해 주세요.'
              : 'Could not complete signup. Check your details and try again.'),
        );
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  };
  return (
    <div className="le-page le-page--hub le-page--signup">
      <EventHeader detail />
      <main className="le-signup-main">
        {!ready ? (
          <p role="status">{ko ? '계정 확인 중…' : 'Checking your account…'}</p>
        ) : completed || (authenticated && !busy) ? (
          <section className="le-signup-done">
            <span className="le-signup-eyebrow">KODA CLUB</span>
            <h1 ref={heading} tabIndex={-1}>
              {completed
                ? ko
                  ? '반가워요, KODA에서.'
                  : 'Welcome to KODA.'
                : ko
                ? '이미 함께하고 있어요.'
                : 'You’re already with us.'}
            </h1>
            <p className="le-signup-note">
              {completed
                ? ko
                  ? '회원가입이 완료됐어요. 새로운 인사를 시작해 볼까요?'
                  : 'Your account is ready. Let’s meet someone new.'
                : ko
                ? '로그인된 계정으로 모임을 둘러볼 수 있어요.'
                : 'Explore gatherings with your existing account.'}
            </p>
            {authenticated ? (
              <a className="le-signup-primary" href={destination}>
                {ko ? '계속하기' : 'Continue'} ↗
              </a>
            ) : (
              <>
                <p className="le-signup-note">
                  {ko
                    ? '자동 로그인을 완료하지 못했어요. 가입한 계정으로 로그인해 주세요.'
                    : 'Automatic login did not complete. Please log in with your new account.'}
                </p>
                <button
                  className="le-signup-primary"
                  type="button"
                  onClick={openLogin}>
                  {ko ? '로그인하기' : 'Log in'} ↗
                </button>
              </>
            )}
          </section>
        ) : (
          <>
            <div className="le-signup-heading">
              <span className="le-signup-eyebrow">JOIN THE CLUB</span>
              <h1 ref={heading} tabIndex={-1}>
                {ko ? '새로운 인사의 시작.' : 'A new hello starts here.'}
              </h1>
              <p>
                {ko
                  ? '하나의 계정으로, 더 가까운 사이.'
                  : 'One account. A little closer.'}
              </p>
            </div>
            <ol
              className="le-signup-steps"
              aria-label={ko ? '가입 단계' : 'Signup steps'}>
              {labels.map((label, index) => (
                <li
                  key={index}
                  aria-current={index === step ? 'step' : undefined}
                  data-complete={index < step}>
                  <span aria-hidden="true">
                    {index < step ? '✓' : `0${index + 1}`}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <div className="le-signup-step-title">
              {step > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setStep(value => value - 1);
                    setError('');
                  }}
                  aria-label={ko ? '이전 단계' : 'Previous step'}>
                  ←
                </button>
              )}
              <h2>{labels[step]}</h2>
            </div>
            {step === 0 && (
              <SignupTerms
                agreements={agreements}
                onChange={setAgreements}
                onNext={() => setStep(1)}
                ko={ko}
              />
            )}
            {step === 1 && (
              <SignupVerification
                key="email"
                kind="email"
                value={form.email}
                onChange={value => {
                  update('email', value);
                  setVerifiedEmail('');
                }}
                verified={Boolean(
                  verifiedEmail && verifiedEmail === form.email,
                )}
                onVerified={value => {
                  setVerifiedEmail(value);
                  setStep(2);
                }}
                onNext={() => setStep(2)}
                ko={ko}
              />
            )}
            {step === 2 && (
              <SignupVerification
                key="phone"
                kind="phone"
                value={form.phoneNum}
                onChange={value => {
                  update('phoneNum', value);
                  setVerifiedPhone('');
                }}
                verified={Boolean(
                  verifiedPhone && verifiedPhone === form.phoneNum,
                )}
                onVerified={value => {
                  setVerifiedPhone(value);
                  setStep(3);
                }}
                onNext={() => setStep(3)}
                ko={ko}
              />
            )}
            {step === 3 && (
              <SignupProfile
                form={form}
                onChange={update}
                checkedNickname={checkedNickname}
                onChecked={setCheckedNickname}
                busy={busy}
                canSubmit={canSubmit}
                onSubmit={submit}
                ko={ko}
              />
            )}
            {error && (
              <p role="alert" className="le-signup-error">
                {error}
              </p>
            )}
            <p className="le-signup-login">
              {ko ? '이미 계정이 있나요?' : 'Already have an account?'}{' '}
              <button type="button" disabled={busy} onClick={openLogin}>
                {ko ? '로그인' : 'Log in'}
              </button>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
