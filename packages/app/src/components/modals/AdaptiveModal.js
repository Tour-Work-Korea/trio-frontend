import React, {useEffect} from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const AdaptiveModal = ({
  visible,
  children,
  onRequestClose,
  androidOverlayStyle,
  useNativeModalOnAndroid = false,
  ...modalProps
}) => {
  const useAndroidOverlay =
    Platform.OS === 'android' && !useNativeModalOnAndroid;

  useEffect(() => {
    if (!useAndroidOverlay || !visible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!onRequestClose) {
          return false;
        }

        onRequestClose?.();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [onRequestClose, useAndroidOverlay, visible]);

  if (useAndroidOverlay) {
    if (!visible) {
      return null;
    }

    return (
      <View style={[styles.androidOverlayHost, androidOverlayStyle]}>
        {children}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      hardwareAccelerated
      statusBarTranslucent
      {...modalProps}>
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  androidOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});

export default AdaptiveModal;
