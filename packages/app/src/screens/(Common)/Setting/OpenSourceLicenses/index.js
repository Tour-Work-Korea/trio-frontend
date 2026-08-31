import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const PACKAGES = [
  ['@actbase/react-daum-postcode', '1.0.4', 'MIT'],
  ['@mj-studio/react-native-naver-map', '2.9.0', 'MIT'],
  ['@portone/react-native-sdk', '0.4.2', 'Apache-2.0 OR MIT'],
  ['@ptomasroos/react-native-multi-slider', '2.2.2', 'MIT'],
  ['@react-native-async-storage/async-storage', '2.1.2', 'MIT'],
  ['@react-native-clipboard/clipboard', '1.16.2', 'MIT'],
  ['@react-native-community/datetimepicker', '8.3.0', 'MIT'],
  ['@react-native-community/geolocation', '3.4.0', 'MIT'],
  ['@react-native-firebase/app', '22.4.0', 'Apache-2.0'],
  ['@react-native-firebase/crashlytics', '22.4.0', 'Apache-2.0'],
  ['@react-native-firebase/messaging', '22.4.0', 'Apache-2.0'],
  ['@react-native-firebase/remote-config', '22.4.0', 'Apache-2.0'],
  ['@react-native-google-signin/google-signin', '16.1.2', 'MIT'],
  ['@react-native-picker/picker', '2.4.10', 'MIT'],
  ['@react-native-seoul/kakao-login', '5.4.1', 'MIT'],
  ['@react-navigation/bottom-tabs', '7.3.10', 'MIT'],
  ['@react-navigation/native', '7.1.6', 'MIT'],
  ['@react-navigation/native-stack', '7.3.10', 'MIT'],
  ['axios', '1.9.0', 'MIT'],
  ['compare-versions', '6.1.1', 'MIT'],
  ['dayjs', '1.11.13', 'MIT'],
  ['expo-intent-launcher', '12.1.5', 'MIT'],
  ['lottie-react-native', '7.2.4', 'Apache-2.0'],
  ['qs', '6.14.0', 'BSD-3-Clause'],
  ['react', '19.0.0', 'MIT'],
  ['react-dom', '19.0.0', 'MIT'],
  ['react-native', '0.79.1', 'MIT'],
  ['react-native-calendars', '1.1313.0', 'MIT'],
  ['react-native-config', '1.5.5', 'MIT'],
  ['react-native-device-info', '15.0.2', 'MIT'],
  ['react-native-draggable-flatlist', '4.0.3', 'MIT'],
  ['react-native-dropdown-picker', '5.4.6', 'MIT'],
  ['react-native-encrypted-storage', '4.0.3', 'MIT'],
  ['react-native-gesture-handler', '2.25.0', 'MIT'],
  ['react-native-google-mobile-ads', '15.8.3', 'Apache-2.0'],
  ['react-native-image-picker', '8.2.1', 'MIT'],
  ['react-native-image-resizer', '1.4.5', 'MIT'],
  ['react-native-linear-gradient', '2.8.3', 'MIT'],
  ['react-native-reanimated', '3.17.5', 'MIT'],
  ['react-native-reanimated-carousel', '4.0.2', 'MIT'],
  ['react-native-safe-area-context', '5.4.0', 'MIT'],
  ['react-native-screens', '4.10.0', 'MIT'],
  ['react-native-skeleton-placeholder', '5.2.4', 'ISC'],
  ['react-native-svg', '15.11.2', 'MIT'],
  ['react-native-toast-message', '2.3.3', 'MIT'],
  ['react-native-vector-icons', '10.2.0', 'MIT'],
  ['react-native-web', '0.20.0', 'MIT'],
  ['react-native-webview', '13.15.0', 'MIT'],
  ['uuid', '11.1.0', 'MIT'],
  ['zustand', '5.0.4', 'MIT'],
];

const MIT_LICENSE = `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

const PRETENDARD_NOTICE = `Pretendard
Copyright (c) 2021, Kil Hyung-jin, with Reserved Font Name “Pretendard”.
Copyright 2014-2021 Adobe, with Reserved Font Name “Source”.
Copyright (c) 2016 The Inter Project Authors, with Reserved Font Name “Inter”.
Copyright 2021 The M+ FONTS Project Authors, with Reserved Font Name “M PLUS 1”.

SIL OPEN FONT LICENSE Version 1.1

Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to these conditions: the Font Software may not be sold by itself; redistributed copies must contain the copyright notice and this license; reserved font names may not be used by modified versions without permission; copyright holder names may not be used to promote modified versions; and the Font Software must remain under this license.

THE FONT SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.`;

const OpenSourceLicenses = () => (
  <View style={styles.screen}>
    <Header title="오픈소스 라이선스" />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        워커웨이는 아래의 오픈소스 소프트웨어를 사용합니다. 각 저작권은 해당
        저작권자에게 있으며, 표기된 라이선스 조건에 따라 제공됩니다.
      </Text>

      <Text style={styles.sectionTitle}>사용 중인 오픈소스</Text>
      <View style={styles.card}>
        {PACKAGES.map(([name, version, license], index) => (
          <View
            key={name}
            style={[styles.packageRow, index > 0 && styles.packageDivider]}>
            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>{name}</Text>
              <Text style={styles.packageVersion}>v{version}</Text>
            </View>
            <Text style={styles.licenseBadge}>{license}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Pretendard</Text>
      <View style={styles.card}>
        <Text style={styles.licenseText}>{PRETENDARD_NOTICE}</Text>
      </View>

      <Text style={styles.sectionTitle}>MIT License</Text>
      <View style={styles.card}>
        <Text style={styles.licenseText}>{MIT_LICENSE}</Text>
      </View>

      <Text style={styles.sectionTitle}>기타 라이선스</Text>
      <View style={styles.card}>
        <Text style={styles.licenseText}>
          Apache License 2.0, BSD 3-Clause License 및 ISC License가 적용되는
          구성요소는 각 패키지에 포함된 원문과 저작권 고지에 따라 사용됩니다.
        </Text>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.grayscale_100},
  content: {padding: 20, paddingBottom: 48},
  description: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
    lineHeight: 22,
    marginBottom: 28,
  },
  sectionTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_800,
    marginBottom: 10,
    marginTop: 12,
  },
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  packageRow: {
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  packageDivider: {borderTopWidth: 1, borderTopColor: COLORS.grayscale_200},
  packageInfo: {flex: 1},
  packageName: {...FONTS.fs_14_medium, color: COLORS.grayscale_800},
  packageVersion: {...FONTS.fs_12_medium, color: COLORS.grayscale_500, marginTop: 2},
  licenseBadge: {...FONTS.fs_12_medium, color: COLORS.grayscale_500, textAlign: 'right'},
  licenseText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
    lineHeight: 19,
    paddingVertical: 12,
  },
});

export default OpenSourceLicenses;
