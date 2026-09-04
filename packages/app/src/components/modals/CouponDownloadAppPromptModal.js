import React from 'react';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import CouponAppInstall20 from '@assets/images/coupon_app_install_20.svg';

const CouponDownloadAppPromptModal = ({visible, onClose}) => (
  <AppInstallPromptModal
    visible={visible}
    onClose={onClose}
    title="쿠폰은 앱에서만 받을 수 있어요"
    message="게딱지 앱을 설치하고 쿠폰 혜택을 받아보세요."
    ImageComponent={CouponAppInstall20}
    buttonText="앱 설치하고 쿠폰 받기"
  />
);

export default CouponDownloadAppPromptModal;
