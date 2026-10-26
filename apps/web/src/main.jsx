import {useTranslation} from 'react-i18next';
import React, {useEffect, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import App from '@trio/app/App.web';
import AppInstallPromptModal from '@trio/app/src/components/modals/AppInstallPromptModal';
import {
  getAppStoreUrlsWithUtm,
  getWebDeviceType,
} from '@trio/app/src/utils/webOpenApp';
import './fonts.css';

function DownloadEntry() {
  const {t} = useTranslation();
  const storeUrls = useMemo(
    () => getAppStoreUrlsWithUtm(window.location.search),
    [],
  );
  const redirectUrl = storeUrls[getWebDeviceType()];

  useEffect(() => {
    document.title = t('common.downloadTheDdakjiApp');

    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  }, [redirectUrl, t]);

  return (
    <AppInstallPromptModal
      visible
      title={t('common.downloadTheDdakjiApp')}
      message={
        redirectUrl
          ? t('common.iMOnMyWayToTheStoreIfIt')
          : t('common.scanOrTapTheStoreQrCodeWithYourPhone')
      }
      buttonText={t('common.download')}
      showStoreQrInitially
      storeUrls={storeUrls}
    />
  );
}

const isDownloadPage = /^\/download\/?$/.test(window.location.pathname);
const root = createRoot(document.getElementById('root'));
root.render(isDownloadPage ? <DownloadEntry /> : <App />);
