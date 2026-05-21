import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

import SuccessIcon from '@assets/images/meet_reservation_success.svg';
import XBtn from '@assets/images/x_gray.svg';

const ReviewSuccessModal = ({ visible, onClose, hasPhotoReview }) => {
  const pointAmount = hasPhotoReview ? '1,000' : '300';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.closeButton}
            onPress={onClose}
          >
            <XBtn width={24} height={24}/>
          </TouchableOpacity>
          <View style={styles.body}>
            <SuccessIcon width={180} height={140} />
            <Text style={[FONTS.fs_18_semibold, styles.title]}>
              리뷰 작성 완료!
            </Text>
            <View style={styles.pointBadge}>
              <Text style={[FONTS.fs_18_semibold, styles.pointText]}>
                +{pointAmount}P 적립 완료
              </Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.description]}>
              소중한 리뷰 감사합니다
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.description]}>
              포인트는 마이페이지에서 확인 가능합니다
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
    borderRadius: 20,
    width: '85%',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  body: {
    alignItems: 'center',
  },
  title: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginTop: 12,
  },
  pointBadge: {
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginVertical: 12,
  },
  pointText: {
    color: COLORS.primary_orange,
    textAlign: 'center',
  },
  description: {
    color: COLORS.grayscale_700,
    textAlign: 'center',
    lineHeight: 17,
  },
});
