import React, {useCallback, useMemo} from 'react';
import {Alert, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import styles from './TemporaryEventBanner.styles';
import {COUPON_EVENT_HTML_FRAGMENT} from './couponEventHtml';

const FALLBACK_HTML_FRAGMENT = `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans KR',sans-serif;background:#FAFBFF;color:#111827;">
    <div>
      <div style="font-size:18px;font-weight:800;margin-bottom:8px;">쿠폰 상세</div>
      <div style="font-size:14px;line-height:22px;color:#73787E;">쿠폰 화면을 불러오지 못했어요.</div>
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

  useFocusEffect(
    useCallback(() => {
      const tabNavigation = navigation.getParent();

      tabNavigation?.setOptions({tabBarStyle: {display: 'none'}});

      return () => {
        tabNavigation?.setOptions({tabBarStyle: undefined});
      };
    }, [navigation]),
  );

  const html = useMemo(
    () => createHtmlDocument(COUPON_EVENT_HTML_FRAGMENT),
    [],
  );

  const handleMessage = event => {
    const message = event.nativeEvent.data;

    if (message === 'back') {
      navigation.goBack();
      return;
    }

    if (message === 'coupon') {
      Alert.alert('쿠폰', '쿠폰 발급 API 연결 전 임시 버튼입니다.');
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{html}}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        mixedContentMode="always"
      />
    </View>
  );
};

export default TemporaryEventBanner;
