import {useTranslation} from 'react-i18next';
import React from 'react';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import CouponAppInstall20 from '@assets/images/coupon_app_install_20.svg';

const PartyApplicationAppPromptModal = ({visible, onClose}) => {
  const {t} = useTranslation();
  return (
    <AppInstallPromptModal
      visible={visible}
      onClose={onClose}
      title={t('components.partyApplicationsAreOnlyAvailableThroughTheApp')}
      message={t(
        'components.20DiscountCouponProvidedUponMembershipRegistration',
      )}
      ImageComponent={CouponAppInstall20}
      buttonText={t('components.installTheAppAndReceiveBenefits')}
    />
  );
};

export default PartyApplicationAppPromptModal;
