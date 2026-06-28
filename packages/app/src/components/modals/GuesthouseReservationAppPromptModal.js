import React from 'react';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import CouponAppInstall20 from '@assets/images/coupon_app_install_20.svg';

const GuesthouseReservationAppPromptModal = ({visible, onClose}) => (
  <AppInstallPromptModal
    visible={visible}
    onClose={onClose}
    title="예약은 앱에서만 가능해요"
    message="지금 앱 받으면 20% 할인 쿠폰 즉시 적용!"
    ImageComponent={CouponAppInstall20}
    buttonText="20% 할인받고 예약하러 가기"
  />
);

export default GuesthouseReservationAppPromptModal;
