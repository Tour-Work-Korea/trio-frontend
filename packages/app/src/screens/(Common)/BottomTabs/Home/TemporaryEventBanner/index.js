import React, { useCallback, useMemo } from 'react';
import { Image, View, Linking, Platform } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

import styles from './TemporaryEventBanner.styles';
import { COUPON_EVENT_HTML_FRAGMENT } from './couponEventHtml';
import couponEventImage from '@assets/images/coupon_event_signup_202606.png';
import AlertModal from '@components/modals/AlertModal';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import { showErrorModal } from '@utils/loginModalHub';
import {replaceWebPath} from '@web/navigation';
import {WEB_ROUTES} from '@web/routes';

const TARGET_COUPON_NAME = '신규회원 전용 20% 할인 쿠폰';
const COUPON_EVENT_IMAGE_URL =
  'https://api.builder.io/api/v1/image/assets/TEMP/6a48cec6e4bd9dfd0ff9e2d3b959f9e9be4ce6c1?width=648';
const couponEventImageUri =
  typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(couponEventImage)?.uri
    : couponEventImage;

const FALLBACK_HTML_FRAGMENT = `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;background:#FAFBFF;color:#111827;">
    <div>
      <div style="font-size:18px;font-weight:800;margin-bottom:8px;">이벤트 상세</div>
      <div style="font-size:14px;line-height:22px;color:#73787E;">이벤트 화면을 불러오지 못했어요.</div>
    </div>
  </div>
`;

const createHtmlDocument = fragment => `<!doctype html>
<html lang="ko">
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
    ${fragment || FALLBACK_HTML_FRAGMENT}
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
  const navigation = useNavigation();
  const route = useRoute();
  const { bannerHtml, banner } = route.params ?? {};
  const couponTemplateId = banner?.couponTemplateId;
  const userRole = useUserStore(state => state.userRole);
  const accessToken = useUserStore(state => state.accessToken);
  const [issuing, setIssuing] = React.useState(false);
  const [alertState, setAlertState] = React.useState({
    visible: false,
    message: '',
    navigateOnConfirm: false,
  });

  useFocusEffect(
    useCallback(() => {
      const tabNavigation = navigation.getParent();

      tabNavigation?.setOptions({ tabBarStyle: { display: 'none' } });

      return () => {
        tabNavigation?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation]),
  );

  const webViewSource = useMemo(() => {
    if (bannerHtml) {
      const processedHtml = typeof bannerHtml === 'string'
        ? bannerHtml.replace(/쿠폰 상세/g, '이벤트 상세')
        : bannerHtml;
      return { html: createHtmlDocument(processedHtml) };
    }
    return {
      html: createHtmlDocument(
        COUPON_EVENT_HTML_FRAGMENT.replace(
          COUPON_EVENT_IMAGE_URL,
          couponEventImageUri || COUPON_EVENT_IMAGE_URL,
        ),
      ),
    };
  }, [bannerHtml]);

  const injectedJs = useMemo(() => {
    const hasLink = !!(
      banner?.link &&
      typeof banner.link === 'string' &&
      /^https?:\/\//i.test(banner.link.trim())
    );
    if (hasLink) {
      return `
        (function() {
          function updateButton() {
            var textSpan = document.querySelector('[layer-name="Bottom Action Button"] [layer-name="쿠폰 받기"] span');
            var svgIcons = document.querySelectorAll('[layer-name="Bottom Action Button"] [layer-name="Button"] svg');
            if (textSpan && textSpan.textContent.trim() === '쿠폰 받기') {
              textSpan.textContent = '참여하기';
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
  }, [banner?.link]);

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
    showErrorModal({
      message: '로그인 후 다운로드 가능합니다',
      buttonText2: '취소',
      buttonText: '로그인하기',
      onPress: () => navigation.navigate('Login'),
      onPress2: () => { },
    });
  }, [navigation]);

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
        showCouponAlert('쿠폰 발급이 완료되었습니다', true);
        return;
      }

      const { data } = await userMyApi.getAvailableCoupons();
      const coupons = Array.isArray(data?.coupons)
        ? data.coupons
        : Array.isArray(data)
          ? data
          : [];
      const targetCoupon = coupons.find(
        coupon => coupon?.name === TARGET_COUPON_NAME,
      );

      if (!targetCoupon) {
        showCouponAlert('해당 쿠폰 다운로드 대상이 아닙니다');
        return;
      }

      if (targetCoupon.isIssued) {
        showCouponAlert('이미 발급된 쿠폰입니다');
        return;
      }

      await userMyApi.issueCouponByTemplate(targetCoupon.couponId);
      showCouponAlert('쿠폰 발급이 완료되었습니다', true);
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status === 401
          ? '로그인 후 다운로드 가능합니다'
          : '쿠폰 발급에 실패했습니다');

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
      <AlertModal
        visible={alertState.visible}
        message={alertState.message}
        buttonText="확인"
        onPress={closeAlert}
        onRequestClose={closeAlert}
      />
    </View>
  );
};

export default TemporaryEventBanner;
