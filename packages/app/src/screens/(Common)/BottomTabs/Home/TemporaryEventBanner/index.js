import ko from '@trio/app/src/locales/ko.json';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Image, View, Linking, Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import styles from './TemporaryEventBanner.styles';
import {COLORS} from '@constants/colors';
import {getCouponEventHtml} from './couponEventHtml';
import couponEventImage from '@assets/images/coupon_event_signup_202606.png';
import AlertModal from '@components/modals/AlertModal';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import {showErrorModal} from '@utils/loginModalHub';
import {replaceWebPath} from '@web/navigation';
import {WEB_ROUTES} from '@web/routes';
import adminApi from '@utils/api/adminApi';
import {getWebDeviceType} from '@utils/webOpenApp';

// Legacy name matching must use the server's canonical name, independent of UI language.
const TARGET_COUPON_NAME = ko['common.20DiscountCouponForNewMembersOnly'];
const COUPON_EVENT_IMAGE_URL =
  'https://api.builder.io/api/v1/image/assets/TEMP/6a48cec6e4bd9dfd0ff9e2d3b959f9e9be4ce6c1?width=648';
const couponEventImageUri =
  typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(couponEventImage)?.uri
    : couponEventImage;
const CONTENT_LINK_ACTION = 'CONTENT_LINK';
const CONTENT_LINK_FALLBACK_DELAY_MS = 1400;

const isSafeWebUrl = value =>
  typeof value === 'string' && /^https:\/\/[^\s]+$/i.test(value.trim());

const isValidPartyId = value =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const isSafePartyDeepLink = (value, partyId) =>
  typeof value === 'string' &&
  value.trim() === `ddakji://party/${Number(partyId)}`;
const createHtmlDocument = (
  fragment,
  language,
  fallbackHtml,
) => `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
    />
    <style>
      * {
        box-sizing: border-box;
        -webkit-tap-highlight-color: transparent;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        overflow-x: hidden;
        background: #fafbff;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
      }

      body {
        display: flex;
        justify-content: center;
      }

      [layer-name="Html → Body"] {
        position: relative !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 390px !important;
        height: auto !important;
        min-height: 100vh !important;
        margin: 0 auto !important;
        overflow: visible !important;
      }

      [layer-name="Header"] {
        position: sticky !important;
        top: 0 !important;
        z-index: 20 !important;
        width: 100% !important;
        padding: 16px 16px !important;
      }

      [layer-name="Header"] > [layer-name="Heading 1"] {
        position: absolute !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }

      [layer-name="Bottom Action Button"] {
        pointer-events: none !important;
        position: fixed !important;
        left: 50% !important;
        right: auto !important;
        bottom: 0 !important;
        z-index: 30 !important;
        width: 100% !important;
        max-width: 390px !important;
        transform: translateX(-50%) !important;
        padding-bottom: max(32px, env(safe-area-inset-bottom)) !important;
      }

      [layer-name="Bottom Action Button"] [layer-name="Button"] {
        pointer-events: auto !important;
      }

      [layer-name="Main"] {
        width: 100% !important;
        padding-bottom: 120px !important;
      }

      [layer-name="Banner Section"] {
        gap: 0 !important;
        padding: 48px 24px 32px !important;
        overflow: hidden !important;
      }

      [layer-name="Banner Section"] > svg,
      [layer-name="Confetti-like dots"] {
        display: none !important;
      }

      [layer-name="Large Coupon Graphic with Animation & Glassmorphism"] {
        width: 100% !important;
        padding: 4px 0 28px !important;
        display: block !important;
      }

      [layer-name="Large Coupon Graphic with Animation & Glassmorphism"] > [layer-name="Overlay+Blur"] {
        display: none !important;
      }

      [layer-name="Large Coupon Graphic with Animation & Glassmorphism"] [layer-name="Overlay+Border+OverlayBlur"] {
        width: 100% !important;
        padding: 8px !important;
        display: block !important;
        position: relative !important;
      }

      [layer-name="Large Coupon Graphic with Animation & Glassmorphism"] [layer-name="Overlay+Shadow"] {
        display: none !important;
      }

      [layer-name="Large Coupon Graphic with Animation & Glassmorphism"] img {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        position: static !important;
        object-fit: contain !important;
      }

      img {
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    ${fragment || fallbackHtml}
    <script>
      (function () {
        function post(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
          }
        }

        function bind() {
          var backButton = document.querySelector('[layer-name="Header"] [layer-name="Button"]');
          var couponButton = document.querySelector('[layer-name="Bottom Action Button"] [layer-name="Button"]');

          if (backButton) {
            backButton.setAttribute('role', 'button');
            backButton.addEventListener('click', function () {
              post('back');
            });
          }

          if (couponButton) {
            couponButton.setAttribute('role', 'button');
            couponButton.addEventListener('click', function () {
              post('coupon');
            });
          }
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', bind);
        } else {
          bind();
        }
      })();
    </script>
  </body>
</html>`;

const TemporaryEventBanner = () => {
  const {t, i18n} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {bannerHtml, banner} = route.params ?? {};
  const webFallbackCleanupRef = useRef(null);
  const openingContentRef = useRef(false);
  const couponTemplateId = banner?.couponTemplateId;
  const isContentLink = banner?.actionButtonType === CONTENT_LINK_ACTION;
  const userRole = useUserStore(state => state.userRole);
  const accessToken = useUserStore(state => state.accessToken);
  const [issuing, setIssuing] = useState(false);
  const [openingContent, setOpeningContent] = useState(false);
  const [alertState, setAlertState] = useState({
    visible: false,
    message: '',
    navigateOnConfirm: false,
  });

  const webViewSource = useMemo(() => {
    if (bannerHtml) {
      const processedHtml =
        typeof bannerHtml === 'string'
          ? bannerHtml.replace(/쿠폰 상세/g, t('common.eventDetails'))
          : bannerHtml;
      return {
        html: createHtmlDocument(
          processedHtml,
          i18n.resolvedLanguage,
          `<h2>${t('common.eventDetails')}</h2><p>${t(
            'events.detailsUnavailable',
          )}</p>`,
        ),
      };
    }
    return {
      html: createHtmlDocument(
        getCouponEventHtml().replace(
          COUPON_EVENT_IMAGE_URL,
          couponEventImageUri || COUPON_EVENT_IMAGE_URL,
        ),
        i18n.resolvedLanguage,
      ),
    };
  }, [bannerHtml, t, i18n.resolvedLanguage]);

  const injectedJs = useMemo(() => {
    const hasLink = isContentLink || !!(
      banner?.link &&
      typeof banner.link === 'string' &&
      /^https?:\/\//i.test(banner.link.trim())
    );

    if (hasLink) {
      return `
        (function() {
          function updateButton() {
            var textSpan = document.querySelector('[layer-name="Bottom Action Button"] [layer-name="Coupon CTA"] span, [layer-name="Bottom Action Button"] [layer-name="쿠폰 받기"] span');
            var svgIcons = document.querySelectorAll('[layer-name="Bottom Action Button"] [layer-name="Button"] svg');
            if (textSpan) {
              textSpan.textContent = ${JSON.stringify(t('events.participate'))};
            }
            if (svgIcons) {
              svgIcons.forEach(function(icon) {
                icon.style.display = 'none';
              });
            }
            
            // 헤더 우측의 외부 링크 관련 아이콘 제거
            var header = document.querySelector('[layer-name="Header"]');
            if (header) {
              var children = header.children;
              for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var layerName = child.getAttribute('layer-name');
                if (i > 0 && layerName !== 'Heading 1') {
                  child.style.display = 'none';
                }
              }
            }
          }
          updateButton();
          window.addEventListener('DOMContentLoaded', updateButton);
          window.addEventListener('load', updateButton);
        })();
        true;
      `;
    }
    return '';
  }, [banner?.link, isContentLink, t]);

  useEffect(() => () => {
    webFallbackCleanupRef.current?.();
  }, []);

  const closeAlert = useCallback(() => {
    const shouldNavigate = alertState.navigateOnConfirm;

    setAlertState(prev => ({
      ...prev,
      visible: false,
      navigateOnConfirm: false,
    }));

    if (shouldNavigate) {
      navigation.navigate('MyCouponList');
    }
  }, [alertState.navigateOnConfirm, navigation]);

  const showCouponAlert = useCallback((message, navigateOnConfirm = false) => {
    setAlertState({
      visible: true,
      message,
      navigateOnConfirm,
    });
  }, []);

  const showLoginRequiredModal = useCallback(() => {
    if (Platform.OS === 'web') {
      navigation.navigate('Login');
      return;
    }

    showErrorModal({
      message: t('common.youCanDownloadAfterLoggingIn'),
      buttonText2: t('common.cancel'),
      buttonText: t('common.logIn'),
      onPress: () => navigation.navigate('Login'),
      onPress2: () => {},
    });
  }, [navigation, t]);

  const handleIssueCoupon = useCallback(async () => {
    if (issuing) {
      return;
    }

    if (!accessToken || userRole !== 'USER') {
      showLoginRequiredModal();
      return;
    }

    setIssuing(true);

    try {
      if (couponTemplateId) {
        await userMyApi.issueCouponByTemplate(couponTemplateId);
        showCouponAlert(t('common.couponHasBeenIssued'), true);
        return;
      }

      const {data} = await userMyApi.getAvailableCoupons();
      const coupons = Array.isArray(data?.coupons)
        ? data.coupons
        : Array.isArray(data)
        ? data
        : [];
      const targetCoupon = coupons.find(
        coupon => coupon?.name === TARGET_COUPON_NAME,
      );

      if (!targetCoupon) {
        showCouponAlert(t('common.thisCouponIsNotEligibleForDownload'));
        return;
      }

      if (targetCoupon.isIssued) {
        showCouponAlert(t('common.thisCouponHasAlreadyBeenIssued'));
        return;
      }

      await userMyApi.issueCouponByTemplate(targetCoupon.couponId);
      showCouponAlert(t('common.couponHasBeenIssued'), true);
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status === 401
          ? t('common.youCanDownloadAfterLoggingIn')
          : t('common.couponIssuanceFailed'));

      if (status === 401) {
        showLoginRequiredModal();
      } else {
        showCouponAlert(message);
      }
    } finally {
      setIssuing(false);
    }
  }, [
    accessToken,
    issuing,
    showCouponAlert,
    showLoginRequiredModal,
    userRole,
    couponTemplateId,
    t,
  ]);

  const openContentOnMobileWeb = useCallback((appDeepLink, webUrl) => {
    webFallbackCleanupRef.current?.();

    let appOpened = false;
    let fallbackTimer;
    const cleanup = () => {
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', stopFallback);
      window.removeEventListener('blur', pauseFallback);
      window.removeEventListener('focus', scheduleFallback);
      if (webFallbackCleanupRef.current === cleanup) {
        webFallbackCleanupRef.current = null;
      }
    };
    const stopFallback = () => {
      appOpened = true;
      cleanup();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopFallback();
      }
    };
    const pauseFallback = () => window.clearTimeout(fallbackTimer);
    const scheduleFallback = () => {
      pauseFallback();
      if (appOpened) {
        return;
      }
      const scheduledAt = Date.now();
      fallbackTimer = window.setTimeout(() => {
        if (
          Date.now() - scheduledAt > CONTENT_LINK_FALLBACK_DELAY_MS + 300
        ) {
          scheduleFallback();
          return;
        }
        cleanup();
        if (!appOpened && document.visibilityState !== 'hidden') {
          window.location.assign(webUrl);
        }
      }, CONTENT_LINK_FALLBACK_DELAY_MS);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', stopFallback);
    window.addEventListener('blur', pauseFallback);
    window.addEventListener('focus', scheduleFallback);
    webFallbackCleanupRef.current = cleanup;
    scheduleFallback();
    window.location.href = appDeepLink;
  }, []);

  const handleOpenContent = useCallback(async () => {
    if (openingContentRef.current) {
      return;
    }

    const bannerId = Number(banner?.id);
    if (!Number.isSafeInteger(bannerId) || bannerId <= 0) {
      showCouponAlert(t('events.contentUnavailable'));
      return;
    }

    openingContentRef.current = true;
    setOpeningContent(true);
    try {
      const {data: target} = await adminApi.getMainBannerContentTarget(bannerId);

      if (target?.status === 'NO_UPCOMING_PARTY') {
        showCouponAlert(
          typeof target.message === 'string' && target.message.trim()
            ? target.message
            : t('events.noUpcomingContent'),
        );
        return;
      }

      if (target?.status === 'UNAVAILABLE') {
        showCouponAlert(
          typeof target.message === 'string' && target.message.trim()
            ? target.message
            : t('events.contentUnavailable'),
        );
        return;
      }

      const partyId = Number(target?.partyId);
      if (
        target?.status !== 'AVAILABLE' ||
        !isValidPartyId(partyId) ||
        !isSafeWebUrl(target?.webUrl)
      ) {
        showCouponAlert(t('events.contentLinkFailed'));
        return;
      }

      const webUrl = target.webUrl.trim();
      if (Platform.OS !== 'web') {
        navigation.navigate('MeetDetail', {partyId});
        return;
      }

      if (getWebDeviceType() === 'desktop') {
        window.location.assign(webUrl);
        return;
      }

      if (!isSafePartyDeepLink(target?.appDeepLink, partyId)) {
        window.location.assign(webUrl);
        return;
      }

      openContentOnMobileWeb(target.appDeepLink.trim(), webUrl);
    } catch (error) {
      const message =
        error?.response?.status === 404
          ? t('events.contentUnavailable')
          : t('events.contentLinkFailed');
      showCouponAlert(message);
    } finally {
      openingContentRef.current = false;
      setOpeningContent(false);
    }
  }, [
    banner?.id,
    navigation,
    openContentOnMobileWeb,
    showCouponAlert,
    t,
  ]);

  const handleMessage = event => {
    const message = event.nativeEvent.data;

    if (message === 'back') {
      if (Platform.OS === 'web') {
        replaceWebPath(WEB_ROUTES.HOME);
        navigation.navigate('HomeMain');
        return;
      }

      navigation.goBack();
      return;
    }

    if (message === 'coupon') {
      if (isContentLink) {
        handleOpenContent();
        return;
      }

      const link = banner?.link;
      if (link && typeof link === 'string') {
        const safeUrl = link.trim();
        if (/^https?:\/\//i.test(safeUrl)) {
          Linking.openURL(safeUrl).catch(() => {
            console.warn('링크 열기 실패');
          });
          return;
        }
      }
      handleIssueCoupon();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={webViewSource}
        style={styles.webView}
        onMessage={handleMessage}
        injectedJavaScript={injectedJs}
        javaScriptEnabled
        domStorageEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        mixedContentMode="always"
      />

      {openingContent ? (
        <View style={styles.actionLoading} pointerEvents="auto">
          <ActivityIndicator size="small" color={COLORS.primary_orange} />
        </View>
      ) : null}

      <AlertModal
        visible={alertState.visible}
        message={alertState.message}
        buttonText={t('common.confirm')}
        onPress={closeAlert}
        onRequestClose={closeAlert}
      />
    </View>
  );
};

export default TemporaryEventBanner;
