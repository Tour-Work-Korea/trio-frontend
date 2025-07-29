import {FONTS} from '@constants/fonts';
import React, {useEffect} from 'react';
import {Modal, View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import XBtn from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

/*
화면 높이 절반까지 오는 결과 모달
*/
export default function ResultModal({
  visible,
  onClose,
  title,
  Icon,
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
  }, [visible]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>{title}</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <Icon style={styles.image} />
          {message ? <Text>{message}</Text> : <></>}
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
  image: {
    width: 168,
  },
});
