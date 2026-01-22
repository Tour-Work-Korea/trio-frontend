import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';
import ErrorToast from '@components/toasts/ErrorToast';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';

import RoomList from './RoomList';
import RoomInfo from './RoomInfo';
import RoomType from './RoomType';
import RoomTypePrivate from './RoomTypePrivate';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

// 숫자 안전 변환
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// 이미지 비교(순서 무시): url + 썸네일 동일성
const imagesEqual = (a = [], b = []) => {
  const norm = (xs = []) => {
    const m = new Map();
    xs.forEach(x => {
      const url = String(x?.roomImageUrl || '');
      if (!url) return;
      m.set(url, !!x.isThumbnail);
    });
    return m;
  };
  const A = norm(a);
  const B = norm(b);
  if (A.size !== B.size) return false;
  for (const [url, th] of A) {
    if (!B.has(url)) return false;
    if (B.get(url) !== th) return false;
  }
  return true;
};

// 썸네일 정확히 1개 보장
const ensureOneThumbnail = (list = []) => {
  const arr = (list || []).map(i => ({
    roomImageUrl: i.roomImageUrl,
    isThumbnail: !!i.isThumbnail,
  }));
  if (arr.length === 0) return arr;

  // 하나도 없으면 첫 번째를 썸네일로
  if (!arr.some(i => i.isThumbnail)) arr[0].isThumbnail = true;

  // 여러 개 true면 첫 번째만 true로
  let seen = false;
  return arr.map(i => {
    if (i.isThumbnail && !seen) {
      seen = true;
      return i;
    }
    return { ...i, isThumbnail: seen ? false : i.isThumbnail };
  });
};

// 변경 필드만 추출 (업데이트 payload)
const buildRoomBasicDiff = (base, cur) => {
  const payload = {};

  const baseName = base?.roomName ?? '';
  const curName = cur?.roomName ?? '';
  if (baseName !== curName) payload.roomName = curName;

  const baseType = base?.roomType ?? null;
  const curType = cur?.roomType ?? null;
  if (baseType !== curType) payload.roomType = curType;

  const baseDorm = base?.dormitoryGenderType ?? null;
  const curDorm = cur?.dormitoryGenderType ?? null;
  if (curType === 'DORMITORY' && baseDorm !== curDorm) {
    payload.dormitoryGenderType = curDorm;
  }

  const baseCap = toNum(base?.roomCapacity);
  const curCap = toNum(cur?.roomCapacity);
  if (baseCap !== curCap && curCap != null) payload.roomCapacity = curCap;

  const baseMax = toNum(base?.roomMaxCapacity ?? base?.roomCapacity);
  const curMax = toNum(cur?.roomMaxCapacity ?? cur?.roomCapacity);
  if (baseMax !== curMax && curMax != null) payload.roomMaxCapacity = curMax;

  const baseDesc = base?.roomDesc ?? base?.roomDescription ?? '';
  const curDesc = cur?.roomDesc ?? cur?.roomDescription ?? '';
  if (baseDesc !== curDesc) payload.roomDescription = curDesc;

  const basePrice = toNum(base?.roomPrice);
  const curPrice = toNum(cur?.roomPrice);
  if (basePrice !== curPrice && curPrice != null) payload.roomPrice = curPrice;

  return payload;
};

// 전체 payload (신규 생성 / fallback 업데이트용)
const buildRoomBasicFull = (cur) => {
  const payload = {
    roomName: cur?.roomName ?? '',
    roomType: cur?.roomType ?? null,
    roomCapacity: toNum(cur?.roomCapacity),
    roomMaxCapacity: toNum(cur?.roomMaxCapacity ?? cur?.roomCapacity),
    roomDescription: cur?.roomDesc ?? cur?.roomDescription ?? '',
    roomPrice: toNum(cur?.roomPrice),
  };

  if (payload.roomType === 'DORMITORY' && cur?.dormitoryGenderType != null) {
    payload.dormitoryGenderType = cur.dormitoryGenderType;
  }

  return payload;
};

const GuesthouseRoomModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,

  defaultRooms = [],
  guesthouseId,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 토스트 메세지 따로 설정
  const insets = useSafeAreaInsets();
  const [localToast, setLocalToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current; // 화면 위에서 시작
  // localToast: { type: 'success' | 'error', text1: string } | null

  const showLocalToast = (type, text1, ms = 2000) => {
    setLocalToast({ type, text1 });

    // 먼저 내려오기
    Animated.timing(translateY, {
      toValue: insets.top + 20, // 노치 고려해서 내려오기
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 일정 시간 후에 올라가기
    clearTimeout(showLocalToast._t);
    showLocalToast._t = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setLocalToast(null));
    }, ms);
  };

  const [step, setStep] = useState('list'); // 'list' | 'info' | 'typeDormitory' | 'typePrivate'
  const [rooms, setRooms] = useState([]);
  const [baselineRooms, setBaselineRooms] = useState([]);

  const EMPTY_ROOM = {
    id: undefined,
    roomName: '',
    roomDesc: '',
    roomImages: [],
    roomCapacity: null,
    roomMaxCapacity: null,
    roomType: null,
    dormitoryGenderType: null,
    roomPrice: '',     // 문자열로 관리(숫자만 입력 허용)
  }; 

  const [tempRoomData, setTempRoomData] = useState(EMPTY_ROOM); // info, type 입력 중인 데이터
  const [editId, setEditId] = useState(null);
  const [editIndexFallback, setEditIndexFallback] = useState(null); // id 없을 때 폴백

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 기본값 normalize (깊은 복사 + 빠진 필드 보정)
  const normalizeRooms = (list = []) =>
    (Array.isArray(list) ? list : []).map((r) => {
      const rawRoomType = r.roomType ?? null;
      const isLegacyGenderType = ['MIXED', 'MALE_ONLY', 'FEMALE_ONLY'].includes(rawRoomType);
      const normalizedRoomType = isLegacyGenderType ? 'DORMITORY' : rawRoomType;
      const normalizedDormitoryGenderType = isLegacyGenderType
        ? rawRoomType
        : r.dormitoryGenderType ?? null;

      return {
        id: r.id ?? undefined,
        roomName: r.roomName ?? '',
        roomDesc: r.roomDesc ?? '',
        roomImages: (r.roomImages ?? []).map(ri => ({
          id: ri.id ?? undefined,
          roomImageUrl: ri.roomImageUrl,
          isThumbnail: !!ri.isThumbnail,
        })),
        roomCapacity: r.roomCapacity ?? null,
        roomMaxCapacity: r.roomMaxCapacity ?? r.roomCapacity ?? null,
        roomType: normalizedRoomType,
        dormitoryGenderType: normalizedDormitoryGenderType,
        // 내부 입력은 문자열로 관리 (기존 입력 UX 유지)
        roomPrice: r.roomPrice != null ? String(r.roomPrice) : '',
        roomExtraFees: r.roomExtraFees ?? [],
      };
    });

  const normalizeRoom = (r) => normalizeRooms([r])[0] ?? EMPTY_ROOM;

  // 모달 열릴 때 초기화/복원
  useEffect(() => {
    if (!visible) return;

    if (appliedData && !shouldResetOnClose) {
      const n = normalizeRooms(appliedData);
      setRooms(n);
      setBaselineRooms(n);
    } else {
      const n = normalizeRooms(defaultRooms);
      setRooms(n);
      setBaselineRooms(n);
      setTempRoomData(EMPTY_ROOM);
      setEditId(null);
      setEditIndexFallback(null);
      setStep('list');
    }
  }, [visible, shouldResetOnClose, appliedData, defaultRooms]);

  // 객실 추가: 새 입력 시작 -> 무조건 초기화
  const startNewRoom = () => {
    setEditId(null);
    setEditIndexFallback(null);
    setTempRoomData(EMPTY_ROOM);
    setStep('info');
  };

  // 리스트에서 수정 진입
  const startEditRoom = (id, index) => {
    const byId = id != null ? rooms.find(r => r.id === id) : null;
    const target = byId ?? rooms[index];
    if (!target) return;
    setEditId(byId ? id : null);
    setEditIndexFallback(byId ? null : index);
    setTempRoomData(normalizeRoom(target));
    setStep('info');
  };

  const goToRoomType = () => {
    setStep(tempRoomData.roomType === 'PRIVATE' ? 'typePrivate' : 'typeDormitory');
  };

  const handleApplyRoom = (nextData) => {
    const src = nextData ?? tempRoomData;
    const normalized = {
      ...src,
      roomMaxCapacity:
      tempRoomData.roomMaxCapacity ?? tempRoomData.roomCapacity,
      roomImages: ensureOneThumbnail(tempRoomData.roomImages),
    };

    setRooms(prev => {
      if (editId != null) {
        const idx = prev.findIndex(r => r.id === editId);
        if (idx >= 0) {
          const next = [...prev];
          // id는 유지
          next[idx] = { ...normalized, id: prev[idx].id };
          return next;
        }
      }
      if (editIndexFallback != null) {
        const next = [...prev];
        next[editIndexFallback] = { ...normalized, id: prev[editIndexFallback].id };
        return next;
      }
      // 신규 추가
      return [...prev, normalized];
    });

    setEditId(null);
    setEditIndexFallback(null);
    setStep('list');
  };

  // 객실 삭제
  const handleDeleteRoom = (id, index) => {
    Alert.alert(
      '객실 삭제',
      '정말 삭제하시겠습니까?\n삭제 후에는 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (id != null) {
              try {
                await hostGuesthouseApi.deleteRoom(guesthouseId, id);
                showLocalToast('success', '객실이 삭제되었습니다.');

                setRooms(prev => prev.filter(r => r.id !== id));
                setBaselineRooms(prev => prev.filter(r => r.id !== id));
                setAppliedData(prev => (prev ? prev.filter(r => r.id !== id) : prev));
              } catch (e) {
                showLocalToast('error', '객실 삭제 중 오류가 발생했어요.');
              }
            } else {
              // 서버에 아직 없는 신규 항목은 그냥 로컬에서만 제거
              setRooms(prev => prev.filter((_, i) => i !== index));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 단순 닫기 시 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        const n = normalizeRooms(appliedData);
        setRooms(n);
        setBaselineRooms(n);
      } else {
        const n = normalizeRooms(defaultRooms);
        setRooms(n);
        setBaselineRooms(n);
      }
      setTempRoomData(EMPTY_ROOM);
      setEditId(null);
      setEditIndexFallback(null);
      setStep('list');
    }
    onClose();
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = async () => {
    if (!guesthouseId) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      return;
    }

    const current = rooms.map(r => ({
      ...r,
      roomImages: ensureOneThumbnail(r.roomImages),
    }));

    const requests = [];

    for (const cur of current) {
      const base = cur?.id != null
        ? baselineRooms.find(b => b.id === cur.id)
        : null;

      if (cur?.id != null) {
        // 기존 방: diff 후 변경 시 update
        if (!base) {
          // 기준이 없는데 id가 있으면 전체 업데이트로 안전하게
          const fullPayload = buildRoomBasicFull(cur);
          requests.push(hostGuesthouseApi.updateRoomBasic(guesthouseId, cur.id, fullPayload));
          requests.push(
            hostGuesthouseApi.updateRoomImages(
              guesthouseId,
              cur.id,
              cur.roomImages.map(i => ({ roomImageUrl: i.roomImageUrl, isThumbnail: !!i.isThumbnail }))
            )
          );
        } else {
          const basicDiff = buildRoomBasicDiff(base, cur);
          const imgsChanged = !imagesEqual(base.roomImages, cur.roomImages);

          if (Object.keys(basicDiff).length > 0) {
            requests.push(hostGuesthouseApi.updateRoomBasic(guesthouseId, cur.id, basicDiff));
          }
          if (imgsChanged) {
            requests.push(
              hostGuesthouseApi.updateRoomImages(
                guesthouseId,
                cur.id,
                cur.roomImages.map(i => ({ roomImageUrl: i.roomImageUrl, isThumbnail: !!i.isThumbnail }))
              )
            );
          }
        }
      } else {
        // 신규 방: create
        const createPayload = {
          ...buildRoomBasicFull(cur),
          roomExtraFees: Array.isArray(cur.roomExtraFees) ? cur.roomExtraFees : [],
          roomImages: (cur.roomImages || []).map(i => ({
            roomImageUrl: i.roomImageUrl,
            isThumbnail: !!i.isThumbnail,
          })),
        };
        requests.push(hostGuesthouseApi.createRoom(guesthouseId, createPayload));
      }
    }

    try {
      if (requests.length === 0) {
        Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });
        onClose();
        return;
      }

      await Promise.all(requests);

      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });

      // 기준값 갱신 + 부모 반영
      setAppliedData(current);
      setBaselineRooms(current);
      onSelect(current);

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
      <View style={{ flex: 1 }}>
      <Pressable style={styles.overlay} onPress={handleOverlayPress} />
      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -240 : 0}
      >
        <View
          style={styles.modalContainer}
        >

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
                <RoomList 
                  rooms={rooms} 
                  onEdit={startEditRoom} 
                  onDelete={handleDeleteRoom}
                />
              </>
            )}

            {step === 'info' && (
              <RoomInfo
                data={tempRoomData}
                setData={setTempRoomData}
                onNext={goToRoomType}
              />
            )}

            {step === 'typeDormitory' && (
              <RoomType
                data={tempRoomData}
                setData={setTempRoomData}
                onBack={() => setStep('info')}
                onApply={handleApplyRoom}
              />
            )}

            {step === 'typePrivate' && (
              <RoomTypePrivate
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
        {localToast && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.localToastWrap,
              { transform: [{ translateY }] },
            ]}
          >
            {localToast.type === 'error'
              ? <ErrorToast text1={localToast.text1} />
              : <BasicToast text1={localToast.text1} />
            }
          </Animated.View>
        )}
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default GuesthouseRoomModal;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.modal_background,
  },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
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

  localToastWrap: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
});
