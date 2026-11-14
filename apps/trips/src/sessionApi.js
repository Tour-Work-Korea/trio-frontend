const API = 'https://api.ddakji.kr/api/v1';
export async function checkSession({fetchImpl = fetch, signal} = {}) {
  const response = await fetchImpl(`${API}/user/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    signal,
    headers: {'Content-Type': 'application/json'},
  });
  if (response.status === 401 || response.status === 403) return false;
  if (!response.ok)
    throw new Error(
      '로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해주세요.',
    );
  const session = await response.json();
  if (!session || (session.role && !['USER', 'ADMIN'].includes(session.role)))
    throw new Error('게딱지 여행자 계정으로 로그인해주세요.');
  return true;
}
