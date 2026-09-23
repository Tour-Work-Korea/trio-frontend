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
  const storeUrls = useMemo(
    () => getAppStoreUrlsWithUtm(window.location.search),
    [],
  );
  const redirectUrl = storeUrls[getWebDeviceType()];

  useEffect(() => {
    document.title = '게딱지 앱 다운로드';

    if (redirectUrl) {
      window.location.replace(redirectUrl);
    }
  }, [redirectUrl]);

  return (
    <AppInstallPromptModal
      visible
      title="게딱지 앱 다운로드"
      message={
        redirectUrl
          ? '스토어로 이동 중이에요. 열리지 않으면 아래 버튼을 눌러 주세요.'
          : '스토어 QR 코드를 휴대폰으로 스캔하거나 눌러 주세요.'
      }
      buttonText="다운로드"
      showStoreQrInitially
      storeUrls={storeUrls}
    />
  );
}

const isDownloadPage = /^\/download\/?$/.test(window.location.pathname);
const root = createRoot(document.getElementById('root'));
root.render(isDownloadPage ? <DownloadEntry /> : <App />);
