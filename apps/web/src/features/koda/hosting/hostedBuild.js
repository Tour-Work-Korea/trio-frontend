// The release workflow already selects the API through its branch-specific SSM
// configuration. Validate that environment before enabling deployed booking.
export function hostedBookingEnabled(target, apiBaseUrl) {
  if (!target) return undefined;
  if (!['dev', 'prod'].includes(target)) throw new Error('Invalid KODA deployment target.');
  let url;
  try {
    url = new URL(apiBaseUrl);
  } catch {
    throw new Error('Missing or invalid deployment API_BASE_URL.');
  }
  if (
    url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
    url.pathname.replace(/\/$/, '') !== '/api/v1'
  ) throw new Error('Deployment API_BASE_URL must be an HTTPS /api/v1 URL.');
  const isDevApi = url.origin === 'https://dev.ddakji.kr';
  if ((target === 'dev') !== isDevApi) throw new Error('Deployment branch and API environment do not match.');
  return true;
}
