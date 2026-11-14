import React, {useEffect, useState} from 'react';
import {
  AUTH_KEY,
  journeyFromSearch,
  loginHref,
  rememberJourney,
  socialHref,
} from './authModel.js';
import {bookingParams, reservationHref} from './bookingModel.js';
import {checkSession} from './sessionApi.js';
import './trips-login.css';

const origin = 'https://ddakji.kr';
export default function TripsLogin() {
  const [journey] = useState(() => journeyFromSearch(window.location.search));
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const local = window.location.origin !== origin;
  const resumed =
    new URLSearchParams(window.location.search).get('resume') === '1';
  useEffect(() => {
    document.title = '로그인 · 낭만모드';
  }, []);
  useEffect(() => {
    const onRestore = event => {
      if (event.persisted) setAttempt(n => n + 1);
    };
    window.addEventListener('pageshow', onRestore);
    return () => window.removeEventListener('pageshow', onRestore);
  }, []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    setStatus('checking');
    setError('');
    setBusy(false);
    try {
      window.sessionStorage.removeItem(AUTH_KEY);
    } catch {}
    (async () => {
      if (local) {
        setStatus('guest');
        return;
      }
      try {
        const authenticated = await checkSession({signal: controller.signal});
        if (!active) return;
        if (!authenticated) {
          if (resumed) window.location.replace(journey.back);
          else setStatus('guest');
          return;
        }
        if (!journey.id) {
          window.location.replace(journey.back);
          return;
        }
        setStatus('booking');
        const response = await fetch(
          `https://api.ddakji.kr/api/v1/user/parties/${journey.id}`,
          {credentials: 'omit', signal: controller.signal},
        );
        if (!response.ok)
          throw new Error('신청 정보를 불러오지 못했어요. 다시 시도해주세요.');
        const params = bookingParams(await response.json(), journey.id);
        if (!active) return;
        // replace removes the auto-forwarding login page from Back history.
        window.location.replace(reservationHref(params, journey.back));
      } catch (failure) {
        if (active) {
          setError(
            failure.name === 'AbortError'
              ? '연결 시간이 초과됐어요. 다시 시도해주세요.'
              : failure.message,
          );
          setStatus('error');
        }
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [attempt, journey, local, resumed]);

  const start = () => {
    if (busy) return;
    setBusy(true);
    setError('');
    if (local) {
      window.location.assign(`${origin}${loginHref(journey)}`);
      return;
    }
    try {
      rememberJourney(window.sessionStorage, journey);
      // Remove stale opt-in journeys only when explicitly starting this one.
      window.sessionStorage.removeItem('koda-auth-return');
      window.sessionStorage.removeItem('koda-booking-return');
      window.location.assign(socialHref(journey));
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };
  return (
    <main className="nm-login-shell">
      <header className="nm-login-header">
        <a
          href={journey.back}
          aria-label="여행으로 돌아가기"
          className="nm-login-back">
          ←
        </a>
        <a className="nm-wordmark" href="/trips/" aria-label="낭만모드 홈">
          <span>NANGMAN</span>
          <span>MODE</span>
        </a>
      </header>
      <section className="nm-login-content" aria-labelledby="login-title">
        <p className="nm-login-label">리그라운드 제주 × 게딱지</p>
        <h1 id="login-title">함께 떠나볼까요?</h1>
        <p className="nm-login-intro">로그인하고 여행을 이어가세요.</p>
        {(status === 'checking' || status === 'booking') && (
          <p className="nm-login-status" role="status">
            {status === 'checking'
              ? '로그인 상태를 확인하고 있어요.'
              : '신청 화면으로 이동하고 있어요.'}
          </p>
        )}
        {error && (
          <div className="nm-login-error" role="alert">
            <p>{error}</p>
            {status === 'error' && (
              <button type="button" onClick={() => setAttempt(n => n + 1)}>
                다시 확인
              </button>
            )}
          </div>
        )}
        {(status === 'guest' || status === 'error') && (
          <button className="nm-login-kakao" disabled={busy} onClick={start}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.7 1.8 5.1 4.5 6.5L5.4 21l4.4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.5 10-7.8S17.5 3 12 3Z" />
            </svg>
            {busy ? '이동 중…' : '카카오로 시작하기'}
          </button>
        )}
        <p className="nm-login-membership">
          게딱지 계정으로 함께 이용해요.
          <br />
          처음이라면 회원가입으로 이어져요.
        </p>
        <a className="nm-login-return" href={journey.back}>
          여행으로 돌아가기
        </a>
      </section>
    </main>
  );
}
