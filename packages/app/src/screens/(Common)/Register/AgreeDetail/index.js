import {useTranslation} from 'react-i18next';
import React, {useMemo} from 'react';
import {
  View,
  useColorScheme,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';

import {AGREEMENT_CONTENT} from '@data/agreeContents';

import {COLORS} from '@constants/colors';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';

const onShouldStartLoadWithRequest = request => {
  if (request.navigationType === 'click') {
    return false;
  }
  return true;
};

export default function AgreeDetail({route}) {
  const {t, i18n} = useTranslation();
  const {id, who = 'USER', headerTitle} = route.params || {};
  const scheme = useColorScheme();
  const navigation = useNavigation();

  const doc = (AGREEMENT_CONTENT[who] || {})[id] || {
    title: t('auth.termsAndConditions'),
    detailHtml: '',
    detail: '',
  };

  const rawHtml =
    doc.detailHtml ||
    `<pre style="white-space:pre-wrap;font-family:system-ui, -apple-system, Roboto;line-height:1.6">${(
      doc.detail || ''
    )
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre>`;

  const html = useMemo(
    () => `
    <!doctype html>
    <html lang="${i18n.resolvedLanguage || i18n.language}">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
        <style>
          body {
            font-family: system-ui, -apple-system, Roboto, sans-serif;
            margin: 0; padding: 16px;
            background: ${scheme === 'dark' ? '#000' : '#fff'};
            color: ${scheme === 'dark' ? '#fff' : '#111'};
            -webkit-text-size-adjust: 100%;
          }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; }
          th { background:#f9fafb; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${rawHtml}
      </body>
    </html>
  `,
    [rawHtml, scheme, i18n.resolvedLanguage, i18n.language],
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View />
        <Text style={styles.titleText}>
          {doc.title || headerTitle || t('auth.agreeToTermsOfUse')}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <XBtn width={24} height={24} />
        </TouchableOpacity>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{html}}
        javaScriptEnabled={false}
        domStorageEnabled={false}
        allowFileAccess={true}
        allowingReadAccessToURL={'/'}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.grayscale_0, padding: 20},
  contentContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    ...FONTS.fs_20_bold,
    color: COLORS.grayscale_900,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 24,
  },
});
