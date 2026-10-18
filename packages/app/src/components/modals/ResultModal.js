import React, {useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';
import {FONTS} from '@constants/fonts';
import XBtn from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import AdaptiveText from '@components/AdaptiveText';

/*
화면 높이 절반까지 오는 결과 모달
*/
export default function ResultModal({
  visible,
  onClose,
  title,
  Icon,
  subTitle = null,
  message = null,
  buttonText = null,
  onPress = null,
}) {
  useEffect(() => {
    if (visible && buttonText == null) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [buttonText, onClose, visible]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View />
            <AdaptiveText
              variant="header"
              style={[FONTS.fs_20_semibold, styles.headerText]}>
              {title}
            </AdaptiveText>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <Icon style={styles.image} />
          <View style={{gap: 4, alignItems: 'center'}}>
            {subTitle ? (
              <AdaptiveText
                variant="title"
                style={{...FONTS.fs_20_semibold, color: COLORS.grayscale_700}}>
                {subTitle}
              </AdaptiveText>
            ) : (
              <></>
            )}
            {message ? (
              <AdaptiveText
                variant="body"
                style={{...FONTS.fs_16_medium, color: COLORS.grayscale_500}}>
                {message}
              </AdaptiveText>
            ) : (
              <></>
            )}
          </View>

          {buttonText ? (
            <ButtonScarlet title={buttonText} onPress={onPress} />
          ) : (
            <></>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  headerText: {
    flex: 1,
    marginHorizontal: 32,
    textAlign: 'center',
  },
  image: {
    width: 168,
  },
});
