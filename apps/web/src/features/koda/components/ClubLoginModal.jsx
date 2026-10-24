import React, {useEffect, useRef, useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import KodaLogo from './KodaLogo';
import {authHref, kakaoAuthHref} from '../auth/authReturn';
import {clubSignupHref, signupDestination} from '../auth/signupModel';
import {useTranslation} from 'react-i18next';
import {getLastLoginProvider} from '@utils/auth/lastLoginProvider';
import KakaoLogo from '@assets/images/kakao_logo.svg';
import '../styles/koda-auth.css';

export default function ClubLoginModal({onClose, onSuccess, ready}) {
  const language = useLocaleStore(state => state.language);
  const ko = language === 'ko';
  const {t} = useTranslation();
  const [step, setStep] = useState('intro');
  const [lastProvider, setLastProvider] = useState(null);
  const emailInput = useRef(null);
  const emailButton = useRef(null);
  const dialog = useRef(null);
  const submitting = useRef(false);
  const alive = useRef(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const returnTo = window.location.pathname.startsWith(
    '/koda/join',
  )
    ? signupDestination(window.location.search, language)
    : `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const recovery = new URL(authHref(returnTo), window.location.origin);
  recovery.pathname = '/find';
  const recoveryHref = find => {
    recovery.searchParams.set(
      'params',
      JSON.stringify({find, userRole: 'USER'}),
    );
    return `${recovery.pathname}${recovery.search}`;
  };

  useEffect(() => {
    let active = true;
    getLastLoginProvider()
      .then(provider => {
        if (active) setLastProvider(provider);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    alive.current = true;
    const opener = document.activeElement;
    const modal = dialog.current;
    modal?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      alive.current = false;
      modal?.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    if (step === 'email') emailInput.current?.focus();
  }, [step]);

  const submit = async event => {
    event.preventDefault();
    if (submitting.current || !ready) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const {tryLogin} = await import('@utils/auth/login');
      await tryLogin(email.trim(), password, 'USER');
      try {
        const {storeLastLoginProvider, LOGIN_PROVIDERS} = await import(
          '@utils/auth/lastLoginProvider'
        );
        await storeLastLoginProvider(LOGIN_PROVIDERS.EMAIL);
      } catch {
        /* A provider hint must not turn a successful login into an error. */
      }
      if (alive.current) onSuccess();
    } catch (failure) {
      if (alive.current)
        setError(
          typeof failure?.response?.data?.message === 'string'
            ? failure.response.data.message
            : ko
            ? '로그인하지 못했어요. 이메일과 비밀번호를 확인하고 다시 시도해 주세요.'
            : 'Unable to log in. Check your email and password and try again.',
        );
    } finally {
      submitting.current = false;
      if (alive.current) setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="le-auth-dialog"
      aria-label={ko ? 'KODA 로그인 및 회원가입' : 'Log in or join KODA'}
      aria-describedby="koda-login-description"
      onCancel={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className="le-auth-dialog-content">
        <button
          className="le-auth-close"
          type="button"
          aria-label={ko ? '로그인 닫기' : 'Close login'}
          onClick={onClose}>
          ×
        </button>
        {step === 'email' && (
          <button
            type="button"
            className="le-auth-back"
            aria-label={ko ? '로그인 방법 선택으로' : 'Choose login method'}
            onClick={() => {
              setStep('intro');
              setError('');
              requestAnimationFrame(() => emailButton.current?.focus());
            }}>
            ←
          </button>
        )}
        <div className={`le-auth-brand le-auth-brand--${step}`}>
          <KodaLogo />
        </div>
        {step === 'email' && <h2>{t('auth.pleaseLogInWithYourEmail')}</h2>}
        <p id="koda-login-description">
          {ko
            ? '사용하던 계정으로 간편하게 시작하세요.'
            : 'Continue with your preferred account.'}
        </p>
        {step === 'intro' ? (
          <div className="le-auth-providers">
            <div className="le-auth-provider-wrap">
              {lastProvider === 'KAKAO' && (
                <span className="le-auth-recent">{t('auth.lastLogin')}</span>
              )}
              <a
                className="le-auth-provider le-auth-provider--kakao"
                href={kakaoAuthHref(returnTo)}>
                <KakaoLogo width={20} height={20} />
                <span>{t('auth.startWithKakao')}</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} aria-busy={busy}>
            <label htmlFor="koda-login-email">{ko ? '이메일' : 'Email'}</label>
            <input
              ref={emailInput}
              id="koda-login-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={t('auth.pleaseEnterYourEmail')}
              disabled={busy}
            />
            <label htmlFor="koda-login-password">
              {ko ? '비밀번호' : 'Password'}
            </label>
            <div className="le-auth-password">
              <input
                id="koda-login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('common.pleaseEnterYourPassword')}
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={ko ? '비밀번호 표시' : 'Show password'}>
                {ko
                  ? showPassword
                    ? '숨김'
                    : '보기'
                  : showPassword
                  ? 'Hide'
                  : 'Show'}
              </button>
            </div>
            {error && (
              <p className="le-auth-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="le-auth-submit"
              type="submit"
              disabled={busy || !ready}>
              {busy
                ? ko
                  ? '로그인 중…'
                  : 'Logging in…'
                : !ready
                ? ko
                  ? '계정 확인 중…'
                  : 'Checking session…'
                : ko
                ? '로그인'
                : 'Log in'}{' '}
              <span aria-hidden="true">↗</span>
            </button>
            <a
              className="le-auth-register"
              href={clubSignupHref(returnTo, language)}>
              {t('auth.signUpWithEmail')}
            </a>
            <div className="le-auth-find">
              <a href={recoveryHref('email')}>{t('auth.findId')}</a>
              <a href={recoveryHref('password')}>
                {t('auth.findYourPassword')}
              </a>
            </div>
          </form>
        )}
        {step === 'intro' && (
          <div className="le-auth-email-links">
            <button
              ref={emailButton}
              type="button"
              onClick={() => setStep('email')}>
              {ko ? '이메일 로그인' : 'Email login'}
              {lastProvider === 'EMAIL' && <small>{t('auth.lastLogin')}</small>}
            </button>
            <a href={clubSignupHref(returnTo, language)}>
              {ko ? '이메일로 가입하기' : 'Sign up with email'}
            </a>
          </div>
        )}
      </div>
    </dialog>
  );
}
