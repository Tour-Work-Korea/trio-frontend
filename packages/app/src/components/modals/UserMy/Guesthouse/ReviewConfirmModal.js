import {useTranslation} from 'react-i18next';
import React from 'react';
import {Alert, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import userMyApi from '@utils/api/userMyApi';

const ReviewConfirmModal = ({
  visible,
  onCancel,
  guesthouseId,
  data,
  onConfirm,
  onSuccess,
}) => {
  const {t} = useTranslation();

  const handleConfirm = async () => {
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        await userMyApi.createReview(guesthouseId, data);
      }
      onSuccess?.(); // 성공 시 부모에서 후처리
    } catch (error) {
      console.log('리뷰 등록 실패:', error);
      const responseData = error?.response?.data;
      const serverMessage =
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === 'string' ? responseData : null);

      Alert.alert(
        t('guesthouse.reviewRegistrationFailed'),

        serverMessage || t('common.pleaseTryAgainLater'),
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 안내 문구 */}
          <Text style={[FONTS.fs_14_medium, styles.message]}>
            {t('guesthouse.reviewsOncePostedCannotBeEdited')}
            {'\n'}
            {t('guesthouse.wouldYouLikeToPostAReview')}
          </Text>

          {/* 버튼 영역 */}
          <View style={styles.buttonRow}>
            <ButtonWhite
              title={t('common.rewrite')}
              onPress={onCancel}
              style={styles.confirmButton}
            />

            <ButtonScarlet
              title={t('guesthouse.register')}
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
