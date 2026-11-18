import React from 'react';
import {useRoute} from '@react-navigation/native';
import SocialLogin from '@trio/app/src/screens/(Common)/Login/SocialLogin';
import KodaGoogleLogin from './KodaGoogleLogin';

// Adapt only KODA's explicit Google entry; retain existing Kakao/app flows.
export default function KodaSocialLogin() {
  const {params} = useRoute();
  return params?.provider === 'GOOGLE' && params?.koda === true ? (
    <KodaGoogleLogin />
  ) : (
    <SocialLogin />
  );
}
