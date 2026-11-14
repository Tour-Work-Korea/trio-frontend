import React, {useEffect, useRef, useState} from 'react';
import {accountSession, clearLoggedOutState} from './accountSession.js';
import {loginHref} from './authModel.js';

export default function AccountMenu({open}) {
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const generation = useRef(0);
  const submitting = useRef(false);
  useEffect(() => {
    if (!open) return;
    const request = ++generation.current;
    setStatus('checking');
    setMessage('');
    accountSession
      .check()
      .then(authenticated => {
        if (generation.current === request)
          setStatus(authenticated ? 'member' : 'guest');
      })
      .catch(() => {
        if (generation.current === request) setStatus('unknown');
      });
    return () => {
      ++generation.current;
    };
  }, [open]);
  const logout = async () => {
    if (submitting.current) return;
    submitting.current = true;
    ++generation.current;
    setBusy(true);
    setMessage('');
    try {
      await accountSession.logout();
      let local, session;
      try {
        local = window.localStorage;
      } catch {}
      try {
        session = window.sessionStorage;
      } catch {}
      clearLoggedOutState(local, session);
      setStatus('guest');
      setMessage('로그아웃했어요.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      {status === 'member' ? (
        <a href="/my/reservations/contents">
          내 예약 <span aria-hidden="true">↗</span>
        </a>
      ) : (
        status !== 'checking' && (
          <a href={loginHref({back: window.location.pathname + window.location.search + window.location.hash})}>
            로그인·회원가입 <span aria-hidden="true">↗</span>
          </a>
        )
      )}
      {status !== 'guest' && (
        <button type="button" onClick={logout} disabled={busy}>
          {busy ? '로그아웃 중…' : '로그아웃'} <span aria-hidden="true">↗</span>
        </button>
      )}
      {status === 'checking' && !busy && (
        <p className="nm-account-menu-status" role="status">
          계정 확인 중…
        </p>
      )}
      {message && (
        <p className="nm-account-menu-status" role="status">
          {message}
        </p>
      )}
    </>
  );
}
