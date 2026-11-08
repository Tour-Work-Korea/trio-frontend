import React, {useState} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Modal from '@components/modals/AdaptiveModal';
import ButtonWhite from '@components/ButtonWhite';
import AdaptiveText from '@components/AdaptiveText';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {getWebDeviceType, openAppOrStoreFromWeb} from '@utils/webOpenApp';
import LogoOrange from '@assets/images/logo_orange.svg';

// Detail-entry prompt only; reuses the existing modal and app/store bridge.
export default function SharedDetailAppPrompt({deepLinkUrl, directEntry = false}) {
  const {t} = useTranslation();
  const [visible, setVisible] = useState(() =>
    Platform.OS === 'web' && getWebDeviceType() !== 'desktop' &&
    (directEntry || new URLSearchParams(window.location.search).get('shared') === '1'),
  );

  if (Platform.OS !== 'web') {
    return null;
  }

  const continueOnWeb = () => {
    setVisible(false);
    // Do not ask again when this shared URL is refreshed after choosing web.
    const url = new URL(window.location.href);
    url.searchParams.delete('shared');
    window.history.replaceState(window.history.state, '', url.href);
    try {
      window.sessionStorage.setItem(`shared-detail-web:${url.pathname}`, '1');
    } catch {
      // Browsing remains available when storage is disabled.
    }
  };

  let choseWeb = false;
  try {
    choseWeb =
      new URLSearchParams(window.location.search).get('shared') !== '1' &&
      window.sessionStorage.getItem(
        `shared-detail-web:${window.location.pathname}`,
      ) === '1';
  } catch {
    // Storage is optional for this prompt.
  }

  const openApp = () => {
    // Keep the gesture synchronous and avoid an extra mobile browser tab.
    openAppOrStoreFromWeb(deepLinkUrl, {sameWindow: true});
  };

  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={visible && !choseWeb}
        onRequestClose={continueOnWeb}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <LogoOrange width={76} height={36} />
            <AdaptiveText variant="title" style={styles.title}>
              {t('share.openDetailTitle')}
            </AdaptiveText>
            <ButtonWhite
              title={t('share.viewInApp')}
              onPress={openApp}
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              style={styles.button}
            />
            <ButtonWhite
              title={t('share.continueOnWeb')}
              onPress={continueOnWeb}
              style={styles.button}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginVertical: 8,
  },
  button: {
    minHeight: 44,
    height: undefined,
  },
});
