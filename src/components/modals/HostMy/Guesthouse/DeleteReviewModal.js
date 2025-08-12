import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';

const DeleteReviewModal = ({ visible, reviewId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');

  const canSubmit = reason.trim().length > 0;

  const handleDelete = async () => {
    try {
      await hostGuesthouseApi.deleteReview(reviewId, reason.trim());
      Toast.show({
        type: 'success',
        text1: '요청되었어요!',
        position: 'top',
        visibilityTime: 2000,
      });
      setReason('');
      onClose?.();
    } catch (e) {
      Alert.alert('삭제 요청 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  const confirmAndDelete = () => {
      Alert.alert(
        '삭제요청 안내',
        '삭제요청은 관리자의 검토 후 처리 되어요\n계속 진행하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: handleDelete }
      ],
      { cancelable: true }
    );
  };

  const handleClose = () => {
    setReason('');
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -160 : 0}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold]}>삭제 요청</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            <View style={styles.title}>
              <Text style={[FONTS.fs_16_medium]}>삭제 요청 사유 (필수)</Text>
              <Text style={[FONTS.fs_12_light, {color: COLORS.grayscale_400}]}>
                <Text style={{color: COLORS.primary_orange}}>{reason.length}</Text>/1,000
              </Text>
            </View>
            <Text style={[FONTS.fs_14_regular, { color: COLORS.grayscale_500, marginTop: 8}]}>
              리뷰 삭제 사유를 작성해 주세요. (운영팀에 전달됩니다)
            </Text>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="리뷰 삭제 요청 사유를 작성해주세요"
              multiline
              maxLength={1000}
              style={[FONTS.fs_14_regular, styles.input]}
              placeholderTextColor={COLORS.grayscale_400}
            />

            <TouchableOpacity onPress={() => setReason('')} style={styles.rewriteButton}>
              <Text style={[FONTS.fs_12_medium, { color: COLORS.grayscale_500, marginTop: 4 }]}>
                다시쓰기
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.btnRow}>
            <ButtonScarlet
              title="요청하기"
              onPress={confirmAndDelete}
              disabled={!canSubmit}
            />
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },

  container: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 24,
    padding: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  body: {
    paddingBottom: 24,
  },

  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  input: {
    minHeight: 320,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    textAlignVertical: 'top',
    marginTop: 12,
  },
  rewriteButton: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },

  btnRow: {
    marginBottom: 28,
  },
});

export default DeleteReviewModal;
