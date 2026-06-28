import React from 'react';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import CouponAppInstall20 from '@assets/images/coupon_app_install_20.svg';

const PartyApplicationAppPromptModal = ({visible, onClose}) => (
  <AppInstallPromptModal
    visible={visible}
    onClose={onClose}
    title="파티 신청은 앱에서만 가능해요"
    message="회원가입 시 20% 할인 쿠폰 제공"
    ImageComponent={CouponAppInstall20}
    buttonText="앱 설치하고 혜택받기"
  />
);

export default PartyApplicationAppPromptModal;
