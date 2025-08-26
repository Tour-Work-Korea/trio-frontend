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
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import XBtn from '@assets/images/x_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';

import RoomList from './RoomList';
import RoomInfo from './RoomInfo';
import RoomType from './RoomType';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseRoomModal = ({ visible, onClose, onSelect, shouldResetOnClose }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [step, setStep] = useState('list'); // 'list' | 'info' | 'type'
  const [rooms, setRooms] = useState([]);

  const EMPTY_ROOM = {
    roomName: '',
    roomDesc: '',
    roomImages: [],
    roomCapacity: null,
    roomMaxCapacity: null,
    roomType: null,
    roomPrice: '',     // 문자열로 관리(숫자만 입력 허용)
  }; 

  const [tempRoomData, setTempRoomData] = useState(EMPTY_ROOM); // info, type 입력 중인 데이터

  // 객실 추가: 새 입력 시작 -> 무조건 초기화
  const startNewRoom = () => {
    setTempRoomData(EMPTY_ROOM);
    setStep('info');
  };

  const goToRoomInfo = () => {
    setTempRoomData(prev => prev ?? EMPTY_ROOM); // 새 방 입력 시작
    setStep('info');
  };

  const goToRoomType = () => {
    setStep('type');
  };

  const handleApplyRoom = () => {
    // roomMaxCapacity를 roomCapacity와 동일하게 세팅
    const normalized = {
      ...tempRoomData,
      roomMaxCapacity:
      tempRoomData.roomMaxCapacity ?? tempRoomData.roomCapacity,
    };
    setRooms(prev => [...prev, normalized]);
    setStep('list'); // 리스트로 돌아감
  };

  const handleDeleteRoom = (index) => {
    setRooms((prevRooms) => prevRooms.filter((_, i) => i !== index));
  };

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 모달 열릴 때 마지막 적용 값 복원
  React.useEffect(() => {
    if (visible && appliedData) {
      setRooms(appliedData);
    }
  }, [visible]);

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        setRooms(appliedData); // 마지막 적용값 복원
      } else {
        setRooms([]); // 처음 상태로 초기화
      }
      setTempRoomData(EMPTY_ROOM); // tempRoomData 초기화
      setStep('list'); // 초기화 시 항상 리스트부터 시작
    }
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    // 현재 상태 저장
    setAppliedData(rooms);

    onSelect(rooms);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -240 : 0}
      >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              객실
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 룸 정보 */}
          <View style={styles.body}>
            {step === 'list' && (
              <>
                {/* {console.log('[GuesthouseRoomModal] 등록된 객실:', JSON.stringify(rooms, null, 2))} */}
                <RoomList rooms={rooms} onAddRoom={goToRoomInfo} onDelete={handleDeleteRoom}/>
              </>
            )}

            {step === 'info' && (
              <RoomInfo
                data={tempRoomData}
                setData={setTempRoomData}
                onNext={goToRoomType}
              />
            )}

            {step === 'type' && (
              <RoomType
                data={tempRoomData}
                setData={setTempRoomData}
                onBack={() => setStep('info')}
                onApply={handleApplyRoom}
              />
            )}
          </View>

          {step === 'list' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={startNewRoom}
              >
                <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>객실 추가</Text>
                <PlusIcon width={16} height={16} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={rooms.length === 0}
                style={[
                  styles.submitButton,
                  rooms.length === 0 && styles.disabledButton,
                ]}
              >
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.submitText,
                    rooms.length === 0 && styles.disabledText,
                  ]}
                >등록하기</Text>
              </TouchableOpacity>
            </View>
          )}
          
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GuesthouseRoomModal;

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
  },

  // 버튼
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
    bottom: 40,
    gap: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.grayscale_800,
  },
  submitButton: {
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submitText: {
    color: COLORS.grayscale_0,
  },
  disabledButton: {
    backgroundColor: COLORS.grayscale_200,
  },
  disabledText: {
    color: COLORS.grayscale_400,
  },
});