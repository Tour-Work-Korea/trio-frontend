import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import userMyApi from '@utils/api/userMyApi';

const ReviewConfirmModal = ({ visible, onCancel, guesthouseId, data, onSuccess }) => {

  const handleConfirm = async () => {
    try {
      await userMyApi.createReview(guesthouseId, data);
      onSuccess?.(); // 성공 시 부모에서 후처리
    } catch (error) {
      console.log('리뷰 등록 실패:', error);
      Alert.alert('리뷰 등록 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 안내 문구 */}
          <Text style={[FONTS.fs_14_medium, styles.message]}>
            한 번 등록한 리뷰는 수정할 수 없어요{'\n'}
            리뷰를 등록하시겠습니까?
          </Text>

          {/* 버튼 영역 */}
          <View style={styles.buttonRow}>
            <ButtonWhite
              title={'다시쓰기'}
              onPress={onCancel}
              style={styles.confirmButton}
            />
            <ButtonScarlet
              title={'등록하기'}
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    width: '80%',
    padding: 20,
    alignItems: 'center',
  },
  message: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  confirmButton: {
    flex: 1,
  },
});
