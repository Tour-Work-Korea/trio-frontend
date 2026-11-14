import {storeWebSessionInfo} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import {activeTripsSignup} from './signupSession.js';
export async function finishTripsSignup(result, provider) {
  if (!activeTripsSignup() || provider !== 'KAKAO') return false;
  if (!result?.data?.session)
    throw new Error(
      '웹 로그인 정보를 확인하지 못했어요. 여행으로 돌아가 다시 로그인해주세요.',
    );
  await storeWebSessionInfo(result.data.session, 'USER');
  await storeLastLoginProvider(provider);
  return true;
}
