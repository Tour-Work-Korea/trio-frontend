import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import {getStoreUrlForWebDevice} from '@utils/webOpenApp';

import LogoOrange from '@assets/images/logo_orange.svg';

const WebDownloadBanner = () => {
  const {t} = useTranslation();
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
            {t('components.ddakjiGuesthousePerfectNow')}
          </Text>
          <Text
            numberOfLines={1}
            style={[FONTS.fs_12_medium, styles.description]}>
            {t('components.getA20DiscountCouponWhenYouSignUpNow')}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePressAppDownload}
          style={styles.button}>
          <Text style={[FONTS.fs_14_semibold, styles.buttonText]}>
            {t('common.download')}
          </Text>
        </TouchableOpacity>
      </View>
      <AppInstallPromptModal
        visible={isAppInstallPromptVisible}
        onClose={() => setIsAppInstallPromptVisible(false)}
        title={t('common.downloadTheDdakjiApp')}
        message={t('components.pleaseScanTheStoreQrCodeWithYourPhone')}
        buttonText={t('common.download')}
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
