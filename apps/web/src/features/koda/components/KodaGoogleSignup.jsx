import React, {useMemo, useState} from 'react';
import SocialOriginSelect from '@screens/(Common)/Register/SocialOriginSelect';
import ForeignRegisterProfile from '@screens/(Common)/Register/ForeignRegisterProfile';
import RegisterAgree from '@screens/(Common)/Register/RegisterAgree';
import PhoneCertificate from '@screens/(Common)/Register/PhoneCertificate';
import UserRegisterProfile from '@screens/(User)/UserRegister/UserRegisterProfile';
import KodaAgreementDialog from './KodaAgreementDialog';

const domesticScreens = {RegisterAgree, PhoneCertificate, UserRegisterProfile};

// Reuse the app's signup screens while keeping their credentials and personal
// details in React state instead of the web navigator's URL parameters.
export default function KodaGoogleSignup({signup, onRegistered, destination, language}) {
  const ko = language === 'ko';
  const [originType, setOriginType] = useState(null);
  const [domesticRoute, setDomesticRoute] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const signupNavigation = useMemo(() => ({
    navigate(name, params) {
      if (name === 'AgreeDetail') {
        setAgreement(params.id);
      } else if (Object.hasOwn(domesticScreens, name)) {
        setDomesticRoute({name, params});
      } else {
        throw new Error('Unsupported KODA signup step');
      }
    },
  }), []);

  const selectOrigin = value => {
    if (value !== 'DOMESTIC' && value !== 'FOREIGN') {
      return;
    }
    setOriginType(value);
    if (value === 'DOMESTIC') {
      setDomesticRoute({
        name: 'RegisterAgree',
        params: {
          ...signup,
          user: 'USER',
          agreements: [],
          isSocial: true,
          isForeign: false,
        },
      });
    }
  };
  const DomesticScreen = domesticRoute && domesticScreens[domesticRoute.name];

  return (
    <main className="le-google-signup">
      <div className="le-google-signup-intro">
        {originType && (
          <p>{originType === 'FOREIGN'
            ? ko
              ? '외국인 회원가입 · 한국 휴대폰 번호 없이 가입합니다.'
              : 'International signup · No Korean phone number required.'
            : ko
              ? '내국인 회원가입 · 한국 휴대폰 번호 인증이 필요합니다.'
              : 'Korean signup requires phone number verification.'}</p>
        )}
        <a href={destination}>{ko ? 'KODA로 돌아가기' : 'Back to KODA'}</a>
      </div>
      {!originType ? (
        <SocialOriginSelect route={{params: signup}} onSelectOrigin={selectOrigin} />
      ) : originType === 'FOREIGN' ? (
        <ForeignRegisterProfile
          route={{params: signup}}
          onRegistered={onRegistered}
          onViewAgreement={setAgreement}
        />
      ) : (
        <DomesticScreen
          key={domesticRoute.name}
          route={domesticRoute}
          navigation={signupNavigation}
          onRegistered={onRegistered}
        />
      )}
      {agreement && (
        <KodaAgreementDialog
          id={agreement}
          language={language}
          onClose={() => setAgreement(null)}
        />
      )}
    </main>
  );
}
