import {useTranslation} from 'react-i18next';
import React from 'react';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import CouponAppInstall20 from '@assets/images/coupon_app_install_20.svg';

const GuesthouseReservationAppPromptModal = ({visible, onClose}) => {
  const {t} = useTranslation();
  return (
    <AppInstallPromptModal
      visible={visible}
      onClose={onClose}
      title={t('guesthouse.reservationsCanOnlyBeMadeThroughTheApp')}
      message={t('guesthouse.getTheAppNowAndApplyThe20DiscountCoupon')}
      ImageComponent={CouponAppInstall20}
      buttonText={t('guesthouse.get20DiscountAndMakeAReservation')}
    />
  );
};

export default GuesthouseReservationAppPromptModal;
