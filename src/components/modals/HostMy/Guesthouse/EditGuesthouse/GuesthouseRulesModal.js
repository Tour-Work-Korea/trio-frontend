import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseRulesModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,

  defaultRules = '',
  guesthouseId,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [text, setText] = useState('');

  // 마지막 적용값 / 변경 비교용 기준값
  const [appliedData, setAppliedData] = useState(null);
  const [baselineText, setBaselineText] = useState('');
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (!visible) return;

    if (appliedData && !shouldResetOnClose) {
      setText(appliedData);
      setBaselineText(appliedData);
    } else {
      const init = defaultRules ?? '';
      setText(init);
      setBaselineText(init);
    }
  }, [visible, shouldResetOnClose, appliedData, defaultRules]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = async () => {
    const next = (text ?? '').trim();
    const changed = baselineText !== next;

    if (!changed) {
      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });
      onSelect?.(next);
      onClose();
      return;
    }

    if (!guesthouseId) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      onClose();
      return;
    }

    try {
      await hostGuesthouseApi.updateGuesthouseBasic(guesthouseId, {
        rules: next,
      });

      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });

      // 기준/적용값 갱신 + 부모 동기화
      setAppliedData(next);
      setBaselineText(next);
      onSelect?.(next);

      onClose();
    } catch (e) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      onClose();
    }
  };

  const handleOverlayPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss(); // 키보드만 닫기
    } else {
      handleModalClose(); // 모달 닫기
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -220 : 0}
      >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              이용규칙
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* 상세 정보 */}
            <View style={styles.body}>
              <View style={styles.title}>
                <Text style={[FONTS.fs_16_medium]}>
                  이용규칙 및 환불규정을 작성해주세요
                </Text>
                <Text style={[FONTS.fs_12_light, styles.countText]}>
                  <Text style={{color: COLORS.primary_orange}}>{text.length}</Text>/5,000
                </Text>
              </View>
            
              <TextInput
                style={[styles.textArea, FONTS.fs_14_regular]}
                multiline
                maxLength={5000}
                placeholder="게스트하우스 이용규칙에 대해 자세히 적어주세요"
                placeholderTextColor={COLORS.grayscale_400}
                value={text}
                onChangeText={setText}
                scrollEnabled={true}
                textAlignVertical="top"
              />

              <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => setText('')}>
                <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 등록하기 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={handleConfirm}
            disabled={text.trim() === ''}
            style={{ marginBottom: 16 }}
          />
          
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GuesthouseRulesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  XBtn: {
    position: 'absolute',
    right: 0,
  },

  // 내용
  body: {
    flex: 1,
    marginBottom: 100,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countText: {
    color: COLORS.grayscale_400,
  },

  textArea: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    height: 400,
  },

  rewriteText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
});