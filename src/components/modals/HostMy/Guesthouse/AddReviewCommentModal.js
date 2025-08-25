import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';

const CHAR_LIMIT = 200;

const AddReviewCommentModal = ({
  visible,
  onClose,
  reviewId,
  onSuccess,
}) => {
  const [reply, setReply] = useState('');

  // 모달 닫힐 때 입력 초기화
  useEffect(() => {
    if (!visible) {
      setReply('');
    }
  }, [visible]);

  const canSubmit = reply.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;

    Alert.alert(
      '등록 확인',
      '한 번 적용하면 수정하거나\n삭제할 수 없습니다.\n등록하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '적용',
          style: 'destructive',
          onPress: async () => {
            try {
              await hostGuesthouseApi.postReviewReply(reviewId, reply.trim());
              Toast.show({
                type: 'success',
                text1: '등록되었어요!',
                position: 'top',
                visibilityTime: 2000,
              });
              onSuccess?.();      // 부모에서 새로고침
              onClose?.();
            } catch (e) {
              Alert.alert('등록 실패', '잠시 후 다시 시도해주세요.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -160 : 0}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.headerRow}>
            <Text style={[FONTS.fs_20_semibold, styles.headerTitle]}>사장님의 한마디</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            {/* 안내 + 글자수 */}
            <View style={styles.captionRow}>
              <Text style={[FONTS.fs_16_medium]}>
                게스트하우스 리뷰에 답글을 달아주세요
              </Text>
              <Text style={[FONTS.fs_12_light, {color: COLORS.grayscale_400}]}>
                <Text style={{color: COLORS.primary_orange}}>{reply.length}</Text>/{CHAR_LIMIT}
              </Text>
            </View>

            {/* 입력창 */}
            <View style={styles.inputWrap}>
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder="답글을 작성해주세요"
                placeholderTextColor={COLORS.grayscale_400}
                multiline
                maxLength={CHAR_LIMIT}
                style={[FONTS.fs_14_regular, styles.input]}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity onPress={() => setReply('')} style={styles.rewriteButton}>
              <Text style={[FONTS.fs_12_medium, { color: COLORS.grayscale_500, marginTop: 4 }]}>
                다시쓰기
              </Text>
            </TouchableOpacity>

            {/* 유의사항 */}
            <View style={styles.noticeBox}>
              <Text style={[FONTS.fs_12_light, styles.noticeText]}>
                · 작성한 답글은 누구나 볼 수 있습니다.
              </Text>
              <Text style={[FONTS.fs_12_light, styles.noticeText]}>
                · 솔직한 답글은 이용객들에게 큰 도움이 됩니다. 다만 허위사실/비방/모욕 등 타인의 권리를 침해하는 내용은 관련 법령 및 약관에 따라 제재될 수 있습니다.
              </Text>
              <Text style={[FONTS.fs_12_light, styles.noticeText]}>
                · 답글의 책임은 작성자에게 있으며, 워케이에는 이에 대한 법적 책임을 지지 않습니다.
              </Text>
            </View>
          </ScrollView>

          {/* 적용 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={submit}
            disabled={!canSubmit}
            style={{ marginTop: 24 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddReviewCommentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    minHeight: '60%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // 헤더
  headerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  headerTitle: {
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  body: {
    paddingBottom: 24,
  },
  // title
  captionRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // 입력란
  inputWrap: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 12,
    height: 200,
  },
  input: {
  },
  rewriteButton: {
    alignSelf: 'flex-end',
  },

  // 유의사항
  noticeBox: {
    marginTop: 12,
  },
  noticeText: {
    color: COLORS.grayscale_400,
    lineHeight: 18,
  },
});
