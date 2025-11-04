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
import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const MeetEventModal = ({ visible, onClose, onSelect, shouldResetOnClose, initialEvents = [] }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // 문자열 배열 상태 (각 이벤트 내용)
  const [events, setEvents] = useState([]);
  // 마지막 적용값
  const [appliedData, setAppliedData] = useState(null);
  
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

    if (appliedData !== null) {
      // 마지막 적용값으로 복원
      setEvents(appliedData);
      return;
    }

    // 부모에서 초기값을 넘겨줬다면 정규화하여 반영
    if (Array.isArray(initialEvents) && initialEvents.length > 0) {
      const normalized = initialEvents.map(e =>
        typeof e === 'string' ? e : (e?.eventName ?? '')
      );
      setEvents(prev => {
        const same =
          prev.length === normalized.length &&
          prev.every((v, i) => v === normalized[i]);
        return same ? prev : normalized;
      });
    } else {
      setEvents(prev => (prev.length === 0 ? prev : []));
    }
  }, [visible]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) setEvents(appliedData);
      else setEvents([]);
    }
    onClose();
  };

  // 추가 / 삭제 / 수정
  const addEvent = () => setEvents(prev => [...prev, '']);
  const removeEvent = (idx) => setEvents(prev => prev.filter((_, i) => i !== idx));
  const changeEvent = (idx, text) =>
    setEvents(prev => prev.map((v, i) => (i === idx ? text : v)));

  // 적용
  const trimmedList = events.map(e => e.trim()).filter(e => e.length > 0);
  const disabled = trimmedList.length === 0;

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    if (disabled) return;
    setAppliedData(trimmedList); // 문자열 배열로 저장
    const payload = trimmedList.map(e => ({ eventName: e }));
    onSelect({ partyEvents: payload });
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
      >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              모임 이벤트
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
                  다양한 이벤트를 추가해주세요
                </Text>
                
                <TouchableOpacity onPress={addEvent} style={styles.circleBtn}>
                  <PlusIcon width={20} height={20}/>
                </TouchableOpacity>
              </View>

              <View style={[{paddingBottom: 200}]}>
                {events.map((val, idx) => (
                  <View key={`${idx}`} style={styles.eventRow}>
                    <Text style={[FONTS.fs_14_medium, styles.eventLabel]}>
                      이벤트 {idx + 1}
                    </Text>

                    <View style={styles.inputWithMinus}>
                      <TextInput
                        value={val}
                        onChangeText={(t) => changeEvent(idx, t)}
                        placeholder="이벤트 내용을 입력해 주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        style={[FONTS.fs_14_regular, styles.eventInput]}
                        maxLength={100}
                        returnKeyType="done"
                      />
                      <TouchableOpacity onPress={() => removeEvent(idx)} style={styles.circleBtnSmall}>
                        <MinusIcon width={20} height={20}/>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* 등록하기 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={handleConfirm}
            disabled={disabled}
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

export default MeetEventModal;

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


  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // 추가 버튼
  circleBtn: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  // 삭제 버튼
  circleBtnSmall: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },

  eventRow: { 
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLabel: { 
    color: COLORS.grayscale_600,
    marginRight: 12,
  },
  inputWithMinus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventInput: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_800,
  },
});