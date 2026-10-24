export function googleAuthOutcome(data) {
  if (!data || typeof data !== 'object')
    throw new Error('Empty authentication response');
  if (
    data.status === 'NEW_USER_SIGNUP_REQUIRED' ||
    data.status === 'SOCIAL_ACCOUNT_NOT_LINKED' ||
    (data.status == null && data.isNewUser === true)
  ) {
    if (!data.socialSignupToken) throw new Error('Missing signup session');
    return 'signup';
  }
  if (
    data.status === 'LINKED' ||
    (data.status == null && data.isNewUser === false)
  )
    return 'login';
  throw new Error('Unknown authentication status');
}
