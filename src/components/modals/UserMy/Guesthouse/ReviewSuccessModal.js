import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

import SuccessIcon from '@assets/images/meet_reservation_success.svg';
import XBtn from '@assets/images/x_gray.svg';

const ReviewSuccessModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.header} onPress={onClose}>
            <XBtn width={24} height={24}/>
          </TouchableOpacity>
          <View style={styles.body}>
            <SuccessIcon />
            <Text style={[FONTS.fs_18_semibold, styles.message]}>
              리뷰 작성이 완료되었어요!
            </Text>
          </View>
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ReviewSuccessModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 24,
    width: '80%',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  body: {
    alignItems: 'center',
  },
  message: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginTop: 20,
  },
});
