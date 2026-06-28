import React, {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import XBtn from '@assets/images/x_gray.svg';
import LogoOrange from '@assets/images/logo_orange.svg';
import {
  APP_STORE_URLS,
  getStoreUrlForWebDevice,
  getWebDeviceType,
} from '@utils/webOpenApp';

const QR_IMAGE_SIZE = 116;

const getQrImageUri = url =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${QR_IMAGE_SIZE}x${QR_IMAGE_SIZE}&margin=8&data=${encodeURIComponent(url)}`;

const AppInstallPromptModal = ({
  visible,
  onClose,
  title,
  message,
  imageSource,
  imageUri,
  ImageComponent,
  buttonText,
  onButtonPress,
  showStoreQrOnDesktop = true,
}) => {
  const [qrVisible, setQrVisible] = useState(false);
  const deviceType = getWebDeviceType();
  const isMobileWeb = deviceType === 'ios' || deviceType === 'android';
  const hasImage = ImageComponent || imageSource || imageUri;
  const isDesktopWeb = deviceType === 'desktop';
  const shouldShowStoreQr = showStoreQrOnDesktop && isDesktopWeb && qrVisible;
  const storeQrItems = useMemo(
    () => [
      {
        label: 'App Store',
        url: APP_STORE_URLS.ios,
        qrUri: getQrImageUri(APP_STORE_URLS.ios),
      },
      {
        label: 'Google Play',
        url: APP_STORE_URLS.android,
        qrUri: getQrImageUri(APP_STORE_URLS.android),
      },
    ],
    [],
  );

  useEffect(() => {
    if (!visible) {
      setQrVisible(false);
    }
  }, [visible]);

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
      return;
    }

    const storeUrl = getStoreUrlForWebDevice();

    if (storeUrl) {
      window.location.assign(storeUrl);
      return;
    }

    if (isDesktopWeb && showStoreQrOnDesktop) {
      setQrVisible(true);
    }
  };

  const renderImage = () => {
    if (ImageComponent) {
      return (
        <View style={styles.imageSlot}>
          <ImageComponent width="100%" height="100%" />
        </View>
      );
    }

    if (imageSource) {
      return <Image source={imageSource} style={styles.image} />;
    }

    if (imageUri) {
      return <Image source={{uri: imageUri}} style={styles.image} />;
    }

    return null;
  };

  const renderStoreQr = () => {
    if (!shouldShowStoreQr) {
      return null;
    }

    return (
      <View style={styles.qrSection}>
        {storeQrItems.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.qrCard}
            focusable={false}
            onPress={() =>
              window.open(item.url, '_blank', 'noopener,noreferrer')
            }>
            <Image source={{uri: item.qrUri}} style={styles.qrImage} />
            <Text style={[FONTS.fs_12_medium, styles.qrLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {onClose ? (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              focusable={false}
              hitSlop={{top: 12, right: 12, bottom: 12, left: 12}}>
              <XBtn width={22} height={22} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.appIcon}>
            <LogoOrange width={70} height={70} />
          </View>

          {title ? (
            <Text style={[FONTS.fs_20_bold, styles.title]}>{title}</Text>
          ) : null}

          {message ? (
            <Text style={[FONTS.fs_14_semibold, styles.message]}>
              {message}
            </Text>
          ) : null}

          {hasImage && !qrVisible ? renderImage() : null}

          {renderStoreQr()}

          {buttonText &&
          !qrVisible &&
          (isMobileWeb || isDesktopWeb || onButtonPress) ? (
            <ButtonScarlet
              title={buttonText}
              onPress={handleButtonPress}
              style={styles.button}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 14px 36px rgba(0, 0, 0, 0.18)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    outlineStyle: 'none',
  },
  appIcon: {
    position: 'absolute',
    top: -54,
    width: 108,
    height: 108,
    borderRadius: 26,
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  title: {
    color: COLORS.grayscale_800,
    lineHeight: 28,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    color: COLORS.grayscale_600,
    lineHeight: 20,
    textAlign: 'center',
  },
  imageSlot: {
    width: '100%',
    height: 138,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 138,
    marginTop: 22,
    resizeMode: 'contain',
  },
  qrSection: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  qrCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: COLORS.grayscale_0,
    outlineStyle: 'none',
  },
  qrImage: {
    width: QR_IMAGE_SIZE,
    height: QR_IMAGE_SIZE,
  },
  qrLabel: {
    marginTop: 8,
    color: COLORS.grayscale_700,
    lineHeight: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    outlineStyle: 'none',
  },
});

export default AppInstallPromptModal;
