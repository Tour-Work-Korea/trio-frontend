import {Platform} from 'react-native';
import {GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID} from '@env';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

let configured = false;

const configureGoogleSignIn = () => {
  if (configured) {
    return;
  }

  const config = {
    scopes: ['profile', 'email'],
    webClientId: GOOGLE_CLIENT_ID,
    offlineAccess: false,
  };

  if (GOOGLE_IOS_CLIENT_ID) {
    config.iosClientId = GOOGLE_IOS_CLIENT_ID;
  }

  GoogleSignin.configure(config);
  configured = true;
};

const normalizeGoogleProfile = user => ({
  email: user?.email || '',
  nickname: user?.name || '',
  name: user?.name || '',
  birthday: '',
  gender: '',
});

export const signInWithGoogle = async () => {
  configureGoogleSignIn();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  }

  const response = await GoogleSignin.signIn();

  if (response?.type !== 'success') {
    return {
      cancelled: true,
    };
  }

  const {data} = response;
  let idToken = data?.idToken;

  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens?.idToken;
  }

  if (!idToken) {
    throw new Error('구글 ID Token이 없습니다.');
  }

  return {
    idToken,
    profile: normalizeGoogleProfile(data?.user),
  };
};
