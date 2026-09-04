import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import {getStoreUrlForWebDevice} from '@utils/webOpenApp';

import LogoOrange from '@assets/images/logo_orange.svg';

const WebDownloadBanner = () => {
  const [isAppInstallPromptVisible, setIsAppInstallPromptVisible] =
    useState(false);

  const handlePressAppDownload = () => {
    const storeUrl = getStoreUrlForWebDevice();

    if (storeUrl) {
      window.location.assign(storeUrl);
      return;
    }

    setIsAppInstallPromptVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.appIcon}>
          <LogoOrange width={36} height={36} />
        </View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={[FONTS.fs_14_semibold, styles.title]}>
            게딱지(게스트하우스 딱, 지금!)
          </Text>
          <Text
            numberOfLines={1}
            style={[FONTS.fs_12_medium, styles.description]}>
            지금 회원가입 시 20% 할인 쿠폰 제공
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePressAppDownload}
          style={styles.button}>
          <Text style={[FONTS.fs_14_semibold, styles.buttonText]}>다운로드</Text>
        </TouchableOpacity>
      </View>
      <AppInstallPromptModal
        visible={isAppInstallPromptVisible}
        onClose={() => setIsAppInstallPromptVisible(false)}
        title="게딱지 앱 다운로드"
        message="스토어 QR 코드를 휴대폰으로 스캔해 주세요."
        buttonText="다운로드"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: COLORS.grayscale_900,
    lineHeight: 20,
  },
  description: {
    marginTop: 2,
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary_orange,
  },
  buttonText: {
    color: COLORS.grayscale_0,
  },
});

export default WebDownloadBanner;
