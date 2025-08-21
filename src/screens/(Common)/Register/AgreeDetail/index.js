// screens/AgreeDetailWebView.js
import React, {useMemo} from 'react';
import {View, useColorScheme, Text, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {AGREEMENT_CONTENT} from '@data/agreeContents';
import {COLORS} from '@constants/colors';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
// 필요 시: 외부 링크 차단
const onShouldStartLoadWithRequest = request => {
  // 현재 문서만 렌더: 외부 링크 클릭 시 열리지 않게
  if (request.navigationType === 'click') return false;
  return true;
};

export default function AgreeDetail() {
  const route = useRoute();
  const {id, who = 'USER', onPress = null} = route.params || {};
  const scheme = useColorScheme();
  const navigation = useNavigation();

  console.log('id:', id, 'who', who);

  const doc = (AGREEMENT_CONTENT[who] || {})[id] || {
    title: '약관',
    detailHtml: '',
    detail: '',
  };

  // detailHtml이 없으면 detail(텍스트)을 간단한 HTML로 감싸서 표시
  const rawHtml =
    doc.detailHtml ||
    `<pre style="white-space:pre-wrap;font-family:system-ui, -apple-system, Roboto;line-height:1.6">${(
      doc.detail || ''
    )
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre>`;

  // 최소한의 뷰포트 & 배경 처리만 추가(원본 CSS를 해치지 않도록 매우 얇게)
  const html = useMemo(
    () => `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
        <style>
          body {
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
    [rawHtml, scheme],
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.grayscale_0, padding: 20}}>
      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View />
        <Text style={{...FONTS.fs_20_bold, color: COLORS.grayscale_900}}>
          이용약관 동의
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <XBtn width={24} height={24} />
        </TouchableOpacity>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{html}}
        // baseUrl: 로컬 자원/상대경로가 있을 때만 필요
        // source={{ html, baseUrl: 'https://your.cdn.example' }}
        javaScriptEnabled={false}
        domStorageEnabled={false}
        allowFileAccess={true}
        allowingReadAccessToURL={'/'}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        setSupportMultipleWindows={false}
        // iOS에서 바운스/줌 조정이 필요하면 아래 옵션 참고
        // scalesPageToFit={false}
        // automaticallyAdjustsScrollIndicatorInsets
        // contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
