import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

const WEBVIEW_MESSAGE_KEY = '__trioWebViewMessage';

const buildHtml = (html, injectedJavaScript) => {
  const bridgeScript = `
    <script>
      window.ReactNativeWebView = {
        postMessage: function(data) {
          window.parent.postMessage({
            type: '${WEBVIEW_MESSAGE_KEY}',
            data: String(data)
          }, '*');
        }
      };
    </script>
  `;
  const injectedScript = injectedJavaScript
    ? `<script>${injectedJavaScript}</script>`
    : '';
  const scripts = `${bridgeScript}${injectedScript}`;

  if (!html) {
    return scripts;
  }

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${scripts}</head>`);
  }

  return `${scripts}${html}`;
};

export function WebView({
  source,
  style,
  onMessage,
  injectedJavaScript,
  ...props
}) {
  const frameRef = useRef(null);
  const html = source?.html;
  const uri = source?.uri;
  const srcDoc = useMemo(
    () => (html ? buildHtml(html, injectedJavaScript) : undefined),
    [html, injectedJavaScript],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof onMessage !== 'function') {
      return undefined;
    }

    const handleMessage = event => {
      if (event?.source !== frameRef.current?.contentWindow) {
        return;
      }

      if (event?.data?.type !== WEBVIEW_MESSAGE_KEY) {
        return;
      }

      onMessage({
        nativeEvent: {
          data: event.data.data,
        },
      });
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onMessage]);

  return (
    <View {...props} style={[styles.container, style]}>
      <iframe
        ref={frameRef}
        src={uri}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        title="webview"
        style={styles.frame}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  frame: {
    borderWidth: 0,
    borderStyle: 'none',
    flex: 1,
    height: '100%',
    width: '100%',
  },
});

export default WebView;
