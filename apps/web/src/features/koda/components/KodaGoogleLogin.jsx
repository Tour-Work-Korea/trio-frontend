/* global globalThis */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import useLocaleStore from '@stores/localeStore';
import authApi from '@utils/api/authApi';
import {normalizeSocialProfile} from '@utils/auth/socialProfile';
import {storeWebSessionInfo} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import KodaLogo from './KodaLogo';
import KodaGoogleSignup from './KodaGoogleSignup';
import {readAuthReturn} from '../auth/authReturn';
import {googleAuthOutcome} from '../auth/googleAuthModel';
import '../styles/koda-auth.css';

let scriptPromise;
function loadGoogleIdentity(language) {
  if (window.google?.accounts?.id)
    return Promise.resolve(window.google.accounts.id);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      scriptPromise = null;
      reject(new Error('Google sign-in unavailable'));
    };
    const timeout = setTimeout(fail, 15000);
    script.src = `https://accounts.google.com/gsi/client?hl=${language}`;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else fail();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Mounted inside the existing web navigator only for KODA's Google entry.
// The original mobile SocialLogin screen and its source remain untouched.
export default function KodaGoogleLogin() {
  const navigation = useNavigation();
  const language = useLocaleStore(state => state.language);
  const ko = language === 'ko';
  const holder = useRef(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const signupCredential = useRef(null);
  const registrationCompleted = useRef(false);
  const [signup, setSignup] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      signupCredential.current = null;
    };
  }, []);
  useEffect(() => {
    const previous = document.title;
    document.title = ko
      ? 'Google로 시작하기 | KODA CLUB'
      : 'Continue with Google | KODA CLUB';
    return () => {
      document.title = previous;
    };
  }, [ko]);
  let destination = '/koda/';
  try {
    destination = readAuthReturn(window.sessionStorage)?.target || destination;
  } catch {
    /* Optional storage. */
  }

  const finishLogin = useCallback(async data => {
    if (googleAuthOutcome(data) !== 'login') {
      throw new Error('Expected a linked Google account');
    }
    await storeWebSessionInfo(data.session || data, 'USER');
    try {
      await storeLastLoginProvider('GOOGLE');
    } catch {
      /* An optional preference must not fail authentication. */
    }
    if (alive.current) {
      navigation.reset({index: 0, routes: [{name: 'MainTabs'}]});
    }
  }, [navigation]);

  const onRegistered = useCallback(async () => {
    if (registrationCompleted.current) return;
    registrationCompleted.current = true;
    // Signup succeeded. Never offer the form again if cookie login fails.
    setRegistered(true);
    setSignup(null);
    setBusy(true);
    pending.current = true;
    try {
      const result = await authApi.loginGoogle(signupCredential.current);
      await finishLogin(result.data);
    } catch {
      if (alive.current) {
        setError(ko
          ? '가입은 완료됐어요. Google 버튼으로 다시 로그인해 주세요.'
          : 'Your account is ready. Use the Google button to log in again.');
      }
    } finally {
      signupCredential.current = null;
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  }, [finishLogin, ko]);

  useEffect(() => {
    if (signup) return;
    let active = true;
    if (!registrationCompleted.current) setError('');
    setLoaded(false);
    const clientId = globalThis.__TRIO_ENV__?.GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError(
        ko
          ? 'Google 로그인을 준비 중이에요. 카카오 또는 이메일을 이용해 주세요.'
          : 'Google sign-in is currently unavailable. Please try again later.',
      );
      return;
    }
    loadGoogleIdentity(ko ? 'ko' : 'en')
      .then(identity => {
        if (!active) return;
        identity.initialize({
          client_id: clientId,
          auto_select: false,
          ux_mode: 'popup',
          callback: async response => {
            if (!active || pending.current || !response.credential) return;
            pending.current = true;
            setBusy(true);
            setError('');
            try {
              const result = await authApi.loginGoogle(response.credential);
              if (!active) return;
              const data = result.data;
              if (googleAuthOutcome(data) === 'signup') {
                if (registrationCompleted.current) {
                  throw new Error('Sign in with the Google account used to register');
                }
                // Keep both credentials in memory, away from URLs and storage.
                signupCredential.current = response.credential;
                setSignup({
                  provider: 'GOOGLE',
                  socialSignupToken: data.socialSignupToken,
                  socialProfile: normalizeSocialProfile(data),
                });
                return;
              }
              await finishLogin(data);
            } catch {
              if (active)
                setError(
                  ko
                    ? 'Google 로그인을 완료하지 못했어요. 다시 시도해 주세요.'
                    : 'Could not complete Google sign-in. Please try again.',
                );
            } finally {
              pending.current = false;
              if (active) setBusy(false);
            }
          },
        });
        if (!holder.current) return;
        holder.current.replaceChildren();
        identity.renderButton(holder.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.min(290, holder.current.clientWidth),
          locale: ko ? 'ko' : 'en',
        });
        setLoaded(true);
      })
      .catch(() => {
        if (active)
          setError(
            ko
              ? 'Google 로그인 화면을 불러오지 못했어요. 다시 시도해 주세요.'
              : 'Could not load Google sign-in. Please try again.',
          );
      });
    return () => {
      active = false;
    };
  }, [attempt, ko, signup, finishLogin]);

  if (signup) {
    return (
      <KodaGoogleSignup
        signup={signup}
        onRegistered={onRegistered}
        destination={destination}
        language={language}
      />
    );
  }

  return (
    <main className="le-google-page">
      <section className="le-google-card" aria-busy={busy}>
        <KodaLogo />
        <h1>{registered
          ? ko ? '회원가입이 완료됐어요' : 'Your account is ready'
          : ko ? 'Google로 시작하기' : 'Continue with Google'}</h1>
        <p>
          {registered
            ? ko
              ? '가입한 Google 계정으로 로그인해 주세요.'
              : 'Log in with the Google account you used to register.'
            : ko
              ? 'Google 계정으로 로그인하거나 가입하세요. 신규 가입 시 내국인·외국인을 선택합니다.'
              : <>
                  Log in or sign up with your Google account.
                  <br />
                  New here? Choose Korean or international signup next.
                </>}
        </p>
        <div
          ref={holder}
          className="le-google-button"
          inert={busy || undefined}
        />
        {((!loaded && !error) || busy) && (
          <p role="status">{ko ? '연결 중…' : 'Connecting…'}</p>
        )}
        {error && (
          <>
            <p role="alert" className="le-google-error">
              {error}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => setAttempt(value => value + 1)}>
              {ko ? '다시 시도' : 'Try again'}
            </button>
          </>
        )}
        <a href={destination}>{ko ? 'KODA로 돌아가기' : 'Back to KODA'}</a>
      </section>
    </main>
  );
}
