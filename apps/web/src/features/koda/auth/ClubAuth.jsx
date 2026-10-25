import React, {createContext, useContext, useEffect, useState} from 'react';
import useUserStore from '@stores/userStore';
import {AUTH_RETURN_KEY} from './authReturn';
import {BOOKING_RETURN_KEY} from './bookingReturn';
import ClubLoginModal from '../components/ClubLoginModal';

const AuthContext = createContext({ready: false, authenticated: false});

export function ClubAuthProvider({children}) {
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const token = useUserStore(state => state.accessToken);
  const role = useUserStore(state => state.userRole);

  useEffect(() => {
    let active = true;
    let restoring = false;
    async function restore() {
      if (restoring) return;
      restoring = true;
      setReady(false);
      try {
        window.sessionStorage.removeItem(AUTH_RETURN_KEY);
        window.sessionStorage.removeItem(BOOKING_RETURN_KEY);
      } catch {
        /* Optional storage. */
      }
      try {
        // Persisted state alone must not be treated as a valid login.
        await useUserStore.persist.rehydrate();
        const {tryAutoLogin} = await import('@utils/auth/login');
        await tryAutoLogin();
      } catch {
        useUserStore.getState().clearUser();
      } finally {
        restoring = false;
        if (active) setReady(true);
      }
    }
    void restore();
    const resume = event => {
      if (event.persisted) void restore();
    };
    window.addEventListener('pageshow', resume);
    return () => {
      active = false;
      window.removeEventListener('pageshow', resume);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        openLogin: () => setLoginOpen(true),
        authenticated:
          ready && Boolean(token && (role === 'USER' || role === 'ADMIN')),
      }}>
      {children}
      {loginOpen && (
        <ClubLoginModal
          ready={ready}
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            setReady(true);
            setLoginOpen(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useClubAuth = () => useContext(AuthContext);
