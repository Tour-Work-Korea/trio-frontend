const API = 'https://api.ddakji.kr/api/v1/user/auth';
const UNAVAILABLE = '로그아웃을 완료하지 못했어요. 다시 시도해주세요.';

// Refresh can rotate cookies. Serialize logout after it, and prevent a new
// refresh from racing with session revocation.
export function createAccountSession(fetchImpl = fetch) {
  let refresh;
  let logout;
  const request = action =>
    fetchImpl(`${API}/${action}`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Cache-Control': 'no-store'},
      signal: AbortSignal.timeout(12000),
    });
  const refreshSession = async () => {
    const response = await request('refresh');
    if (response.status === 401 || response.status === 403) return false;
    if (!response.ok) throw new Error('로그인 상태를 확인하지 못했어요.');
    return true;
  };
  return {
    check() {
      if (logout) return logout.then(() => false);
      if (!refresh) {
        refresh = refreshSession().finally(() => {
          refresh = null;
        });
      }
      return refresh;
    },
    logout() {
      if (logout) return logout;
      const precedingRefresh = refresh;
      logout = (async () => {
        await precedingRefresh?.catch(() => {});
        let response = await request('logout');
        if (response.status === 401) {
          // An expired access cookie can still have a valid refresh cookie.
          if (!(await refreshSession())) return;
          response = await request('logout');
        }
        if (!response.ok) throw new Error(UNAVAILABLE);
      })()
        .catch(() => {
          throw new Error(UNAVAILABLE);
        })
        .finally(() => {
          logout = null;
        });
      return logout;
    },
  };
}

export function clearLoggedOutState(local, session) {
  // Only account and pending auth/booking state, never unrelated preferences.
  try {
    local?.removeItem('user-store');
  } catch {}
  for (const key of [
    'nangman-auth-journey',
    'trips-auth-return',
    'trips-booking-context',
    'koda-auth-return',
    'koda-booking-return',
  ]) {
    try {
      session?.removeItem(key);
    } catch {}
  }
}
export const accountSession = createAccountSession();
