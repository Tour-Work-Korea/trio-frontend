import React, {forwardRef} from 'react';
import {useTranslation} from 'react-i18next';
import {NaverMapView} from '@mj-studio/react-native-naver-map';

const LocalizedNaverMapView = forwardRef((props, ref) => {
  const {i18n} = useTranslation();
  const locale = i18n.resolvedLanguage === 'en' ? 'en' : 'ko';

  return <NaverMapView key={locale} ref={ref} locale={locale} {...props} />;
});

LocalizedNaverMapView.displayName = 'LocalizedNaverMapView';

export default LocalizedNaverMapView;
