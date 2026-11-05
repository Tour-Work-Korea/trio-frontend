import React from 'react';
import SocialLogin from '@screens/(Common)/Login/SocialLogin';
import KodaGoogleLogin from './KodaGoogleLogin';

// Only KODA's explicit Google entry replaces the shared social login screen.
export default function KodaSocialLogin(props) {
  return props.route?.params?.koda === true &&
    props.route?.params?.provider === 'GOOGLE'
    ? <KodaGoogleLogin />
    : <SocialLogin {...props} />;
}
