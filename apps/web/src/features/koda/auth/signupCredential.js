// Keep the Google credential only in this page's memory during signup.
// Never put it in route params, browser storage, logs or the signup payload.
export function createSignupCredentialBridge(now = Date.now) {
  let pending = null;
  const clear = () => { pending = null; };
  return {
    clear,
    remember(signupToken, credential) {
      pending = signupToken && credential
        ? {signupToken, credential, createdAt: now()}
        : null;
    },
    take(signupToken) {
      const saved = pending;
      clear();
      if (!saved || saved.signupToken !== signupToken ||
          now() < saved.createdAt || now() - saved.createdAt >= 30 * 60 * 1000)
        return null;
      return saved.credential;
    },
  };
}
export const signupCredential = createSignupCredentialBridge();
