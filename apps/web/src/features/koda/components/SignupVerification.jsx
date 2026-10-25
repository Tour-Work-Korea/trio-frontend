import React, {useEffect, useRef, useState} from 'react';
import authApi from '@utils/api/authApi';
import {isVerificationRecipient} from '../auth/signupModel';

export default function SignupVerification({
  kind,
  value,
  onChange,
  verified,
  onVerified,
  onNext,
  ko,
}) {
  const email = kind === 'email';
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const active = useRef(true);
  const pending = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const cooldown = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const label = email
    ? ko
      ? '이메일'
      : 'Email'
    : ko
    ? '휴대폰 번호'
    : 'Mobile number';
  const run = async task => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
    } catch (failure) {
      if (active.current)
        setError(
          failure?.response?.data?.message ||
            (ko
              ? '인증 요청을 완료하지 못했어요. 다시 확인해 주세요.'
              : 'Verification could not be completed. Please try again.'),
        );
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  };
  const send = () =>
    run(async () => {
      if (!isVerificationRecipient(kind, value) || cooldown > 0 || verified)
        return;
      if (email) await authApi.sendEmail(value, 'USER');
      else await authApi.sendSms(value, 'USER', 'SIGN_UP');
      if (!active.current) return;
      const time = Date.now();
      setNow(time);
      setExpiresAt(time + 300000);
      setResendAt(time + 30000);
      setSentTo(value);
      setCode('');
      setNotice(
        ko
          ? '인증번호를 보냈어요. 5분 안에 입력해 주세요.'
          : 'Code sent. Enter it within 5 minutes.',
      );
    });
  const verify = event => {
    event.preventDefault();
    void run(async () => {
      if (sentTo !== value || Date.now() >= expiresAt || !/^\d{6}$/.test(code))
        return;
      const response = email
        ? await authApi.verifyEmail(value, code)
        : await authApi.verifySms(value, code, 'USER', 'SIGN_UP');
      if (response?.data?.verified === false)
        throw new Error('Verification failed');
      if (active.current) onVerified(value);
    });
  };
  return (
    <form onSubmit={verify} aria-busy={busy}>
      <p className="le-signup-note">
        {email
          ? ko
            ? '로그인에 사용할 이메일을 인증해 주세요.'
            : 'Verify the email you’ll use to log in.'
          : ko
          ? '기존 가입 절차에 따라 국내 휴대폰 번호로 인증해요.'
          : 'This signup flow requires a Korean mobile number.'}
      </p>
      <label className="le-signup-label" htmlFor={`signup-${kind}`}>
        {label}
      </label>
      <div className="le-signup-input-row">
        <input
          id={`signup-${kind}`}
          type={email ? 'email' : 'tel'}
          autoComplete={email ? 'email' : 'tel-national'}
          inputMode={email ? 'email' : 'numeric'}
          autoCapitalize="none"
          value={value}
          maxLength={email ? 254 : 11}
          disabled={busy}
          onChange={event => {
            onChange(
              email
                ? event.target.value.trim()
                : event.target.value.replace(/\D/g, ''),
            );
            setSentTo('');
            setExpiresAt(0);
            setResendAt(0);
            setCode('');
            setError('');
            setNotice('');
          }}
          placeholder={email ? 'hello@example.com' : '01012345678'}
        />
        <button
          type="button"
          onClick={send}
          disabled={
            busy ||
            verified ||
            cooldown > 0 ||
            !isVerificationRecipient(kind, value)
          }>
          {verified
            ? ko
              ? '인증 완료'
              : 'Verified'
            : cooldown > 0
            ? `${cooldown}s`
            : sentTo === value
            ? ko
              ? '재전송'
              : 'Resend'
            : ko
            ? '인증 요청'
            : 'Send code'}
        </button>
      </div>
      {sentTo === value && !verified && (
        <>
          <label className="le-signup-label" htmlFor={`signup-${kind}-code`}>
            {ko ? '인증번호' : 'Verification code'}
          </label>
          <div className="le-signup-input-row">
            <input
              id={`signup-${kind}-code`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder={ko ? '6자리 숫자' : '6-digit code'}
              disabled={busy || remaining === 0}
            />
            <span aria-label={ko ? '남은 인증 시간' : 'Time remaining'}>
              {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, '0')}
            </span>
          </div>
          {remaining === 0 && (
            <p role="status" className="le-signup-note">
              {ko
                ? '인증번호가 만료됐어요. 다시 요청해 주세요.'
                : 'Code expired. Please request a new one.'}
            </p>
          )}
        </>
      )}
      {notice && (
        <p role="status" className="le-signup-note">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="le-signup-error">
          {error}
        </p>
      )}
      {verified ? (
        <button className="le-signup-primary" type="button" onClick={onNext}>
          {ko ? '다음' : 'Continue'} ↗
        </button>
      ) : (
        <button
          className="le-signup-primary"
          type="submit"
          disabled={
            busy ||
            sentTo !== value ||
            !sentTo ||
            remaining === 0 ||
            code.length !== 6
          }>
          {busy
            ? ko
              ? '확인 중…'
              : 'Verifying…'
            : ko
            ? '인증하고 다음'
            : 'Verify and continue'}{' '}
          ↗
        </button>
      )}
    </form>
  );
}
