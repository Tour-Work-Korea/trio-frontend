// Injectable core: keeps the provider credential in memory, consumes it once,
// and leaves every ordinary Ddakji/KODA signup request unchanged.
export function createSignupFlow({api, isActive, now = Date.now}) {
  let pending = null;
  return {
    async loginKakao(credential) {
      const result = await api.loginKakao(credential);
      const token = result?.data?.socialSignupToken;
      pending =
        isActive() && token && credential
          ? {token, credential, createdAt: now()}
          : null;
      return result;
    },
    async completeSocialSignUp(body) {
      const result = await api.completeSocialSignUp(body);
      if (!isActive() || body.provider !== 'KAKAO') return result;
      const saved = pending;
      pending = null;
      if (
        !saved ||
        saved.token !== body.socialSignupToken ||
        now() < saved.createdAt ||
        now() - saved.createdAt >= 30 * 60 * 1000
      )
        throw new Error(
          '가입은 완료됐어요. 여행으로 돌아가 카카오로 다시 로그인해주세요.',
        );
      const login = await api.loginKakao(saved.credential);
      const data = login?.data;
      if (!data || data.isNewUser || (data.status && data.status !== 'LINKED'))
        throw new Error(
          '가입 후 로그인을 완료하지 못했어요. 여행으로 돌아가 다시 로그인해주세요.',
        );
      return {...result, data: {...result.data, session: data.session || data}};
    },
  };
}
