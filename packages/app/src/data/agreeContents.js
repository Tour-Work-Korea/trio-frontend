import i18n from '@trio/app/src/i18n';

// Keep agreement identifiers stable; resolve document text in the current app language.
export const AGREEMENT_CONTENT = {
  USER: {
    TERMS_OF_SERVICE: {
      get title() {
        return i18n.t('agreements.TERMS_OF_SERVICE.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.TERMS_OF_SERVICE.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.TERMS_OF_SERVICE.detail', {
          skipInterpolation: true,
        });
      },
    },
    AGE_OVER_14_CONFIRMATION: {
      get title() {
        return i18n.t('agreements.AGE_OVER_14_CONFIRMATION.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.AGE_OVER_14_CONFIRMATION.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.AGE_OVER_14_CONFIRMATION.detail', {
          skipInterpolation: true,
        });
      },
    },
    PRIVACY_POLICY: {
      get title() {
        return i18n.t('agreements.PRIVACY_POLICY.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.PRIVACY_POLICY.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.PRIVACY_POLICY.detail', {
          skipInterpolation: true,
        });
      },
    },
    GUESTHOUSE_RESERVATION_POLICY: {
      get title() {
        return i18n.t('agreements.GUESTHOUSE_RESERVATION_POLICY.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.GUESTHOUSE_RESERVATION_POLICY.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.GUESTHOUSE_RESERVATION_POLICY.detail', {
          skipInterpolation: true,
        });
      },
    },
    GUESTHOUSE_RESERVATION_PRIVACY_POLICY: {
      get title() {
        return i18n.t(
          'agreements.GUESTHOUSE_RESERVATION_PRIVACY_POLICY.title',
          {skipInterpolation: true},
        );
      },
      get detail() {
        return i18n.t(
          'agreements.GUESTHOUSE_RESERVATION_PRIVACY_POLICY.detail',
          {skipInterpolation: true},
        );
      },
    },
    GUESTHOUSE_PRIVACY_THIRD_PARTY: {
      get title() {
        return i18n.t('agreements.GUESTHOUSE_PRIVACY_THIRD_PARTY.title', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.GUESTHOUSE_PRIVACY_THIRD_PARTY.detail', {
          skipInterpolation: true,
        });
      },
    },
    LOCATION_BASED_SERVICE: {
      get title() {
        return i18n.t('agreements.LOCATION_BASED_SERVICE.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.LOCATION_BASED_SERVICE.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.LOCATION_BASED_SERVICE.detail', {
          skipInterpolation: true,
        });
      },
    },
    MARKETING_NOTIFICATION: {
      get title() {
        return i18n.t('agreements.MARKETING_NOTIFICATION.title', {
          skipInterpolation: true,
        });
      },
      get detailHtml() {
        return i18n.t('agreements.MARKETING_NOTIFICATION.detailHtml', {
          skipInterpolation: true,
        });
      },
      get detail() {
        return i18n.t('agreements.MARKETING_NOTIFICATION.detail', {
          skipInterpolation: true,
        });
      },
    },
  },
};

// Explicit language for consumers whose selected language is passed as a prop.
export const getAgreementDocument = (id, language) => {
  const document = AGREEMENT_CONTENT.USER[id];
  if (!document) return null;
  const t = i18n.getFixedT(language);
  return Object.fromEntries(
    Object.keys(document).map(field => [
      field,
      t(`agreements.${id}.${field}`, {skipInterpolation: true}),
    ]),
  );
};
