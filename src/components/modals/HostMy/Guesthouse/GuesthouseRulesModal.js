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

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseRulesModal = ({ visible, onClose, onSelect, shouldResetOnClose }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [text, setText] = useState('');
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState('');

  // 모달 열릴 때 마지막 적용 값 복원
  React.useEffect(() => {
    if (visible && appliedData) {
      setText(appliedData);
    }
  }, [visible]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setText(appliedData);
      } else {
        // 처음 상태로 초기화
        setText('');
      }
    }
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    // 현재 상태 저장
    setAppliedData(text);

    onSelect?.(text);
    onClose();
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
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
                scrollEnabled={false}
                textAlignVertical="top"
              />

              <TouchableOpacity onPress={() => setText('')}>
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
    minHeight: 400,
  },

  rewriteText: {
    color: COLORS.grayscale_500,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});