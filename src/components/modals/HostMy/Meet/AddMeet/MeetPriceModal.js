import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const MeetPriceModal = ({visible, onClose, onSelect, shouldResetOnClose,
  initialMinAttendees = 1,
  initialMaxAttendees = 10,
  initialIsGuest = true,
  initialAmount = '',
  initialFemaleAmount = '',
  initialMaleNonAmount = '',
  initialFemaleNonAmount = '',
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [minAttendees, setMinAttendees] = useState(1);
  const [maxAttendees, setMaxAttendees] = useState(10);
  const [guestOnly, setGuestOnly] = useState(true); // true = 숙박객만 참여가능
  const [femaleAmount, setFemaleAmount] = useState(''); // 숙박 여
  const [amount, setAmount] = useState(''); // 숙박 남
  const [femaleNonAmount, setFemaleNonAmount] = useState(''); // 비숙 여
  const [maleNonAmount, setMaleNonAmount] = useState(''); // 비숙 남

  // 마지막 적용값 저장/복원
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 모달 열릴 때 마지막 적용 값 복원
  useEffect(() => {
    if (!visible) return;
    if (appliedData) return;

    setMinAttendees(initialMinAttendees ?? 1);
    setMaxAttendees(initialMaxAttendees ?? 10);
    setGuestOnly(!!initialIsGuest);
    setAmount(String(initialAmount ?? ''));
    setFemaleAmount(String(initialFemaleAmount ?? ''));
    setMaleNonAmount(String(initialMaleNonAmount ?? ''));
    setFemaleNonAmount(String(initialFemaleNonAmount ?? ''));
  }, [
    visible,
    initialMinAttendees, initialMaxAttendees, initialIsGuest,
    initialAmount, initialFemaleAmount, initialMaleNonAmount, initialFemaleNonAmount
  ]);

  // 단순 닫기일 때만 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 적용값 복원
        setMinAttendees(appliedData.minAttendees);
        setMaxAttendees(appliedData.maxAttendees);
        setGuestOnly(appliedData.guestOnly);
        setFemaleAmount(appliedData.femaleAmount);
        setAmount(appliedData.amount);
        setFemaleNonAmount(appliedData.femaleNonAmount);
        setMaleNonAmount(appliedData.maleNonAmount);
      } else {
        // 초기화
        setMinAttendees(10);
        setMaxAttendees(35);
        setGuestOnly(true);
        setFemaleAmount('');
        setAmount('');
        setFemaleNonAmount('');
        setMaleNonAmount('');
      }
    }
    onClose();
  };

  const step = (setter, dir, min = 1, max = 99) => {
    setter(prev => {
      const n = Number(prev) || 0;
      const next = dir === 'minus' ? n - 1 : n + 1;
      return Math.min(max, Math.max(min, next));
    });
  };

  // 버튼 활성화 조건
  const minOk = Number.isFinite(+minAttendees) && +minAttendees > 0;
  const maxOk =
    Number.isFinite(+maxAttendees) && +maxAttendees >= +minAttendees;

  const moneyOkGuest =
    femaleAmount !== '' &&
    amount !== '' &&
    Number.isFinite(+femaleAmount) &&
    Number.isFinite(+amount) &&
    +femaleAmount >= 0 &&
    +amount >= 0;

  const moneyOkNonGuest = guestOnly
    ? true
    : femaleNonAmount !== '' &&
      maleNonAmount !== '' &&
      Number.isFinite(+femaleNonAmount) &&
      Number.isFinite(+maleNonAmount) &&
      +femaleNonAmount >= 0 &&
      +maleNonAmount >= 0;

  const isDisabled = !(minOk && maxOk && moneyOkGuest && moneyOkNonGuest);

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    if (isDisabled) return;

    const snapshot = {
      minAttendees,
      maxAttendees,
      guestOnly,
      femaleAmount,
      amount,
      femaleNonAmount,
      maleNonAmount,
    };
    setAppliedData(snapshot);

    onSelect({
      minAttendees: Number(minAttendees),
      maxAttendees: Number(maxAttendees),
      isGuest: guestOnly, // payload 키에 맞춤 (숙박객만 참여가능)
      amount: Number(amount ?? 0),
      femaleAmount: Number(femaleAmount ?? 0),
      maleNonAmount: guestOnly ? 0 : Number(maleNonAmount ?? 0),
      femaleNonAmount: guestOnly ? 0 : Number(femaleNonAmount ?? 0),
    });

    onClose();
  };

  // 숫자만 남기는 공통 헬퍼
  const onlyNum = (t) => t.replace(/[^0-9]/g, '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleModalClose} />
        <KeyboardAvoidingView style={{width: '100%'}}>
          <View style={styles.modalContainer}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
                이벤트 인원 및 금액
              </Text>
              <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* 게하 정보 */}
            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              {/* 이벤트 인원 */}
              <Text style={FONTS.fs_16_medium}>이벤트 인원</Text>
              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  {/* 최소 */}
                  <View style={styles.counterBlock}>
                    <Text style={[FONTS.fs_14_medium, styles.gray]}>최소</Text>
                    <View style={styles.counterRow}>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => step(setMinAttendees, 'minus', 1, 99)}>
                        <MinusIcon width={20} height={20} />
                      </TouchableOpacity>
                      <Text style={[FONTS.fs_16_semibold, styles.counterNum]}>
                        {minAttendees}
                      </Text>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => step(setMinAttendees, 'plus', 1, 99)}>
                        <PlusIcon width={20} height={20} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 최대 */}
                  <View style={styles.counterBlock}>
                    <Text style={[FONTS.fs_14_medium, styles.gray]}>최대</Text>
                    <View style={styles.counterRow}>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => step(setMaxAttendees, 'minus', 1, 99)}>
                        <MinusIcon width={20} height={20} />
                      </TouchableOpacity>
                      <Text style={[FONTS.fs_16_semibold, styles.counterNum]}>
                        {maxAttendees}
                      </Text>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => step(setMaxAttendees, 'plus', 1, 99)}>
                        <PlusIcon width={20} height={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* 숙박 여부 */}
              <Text style={[FONTS.fs_16_medium, {marginTop: 20}]}>
                숙박 여부
              </Text>
              <View style={styles.section}>
                <View style={styles.segment}>
                  <Pressable
                    style={[
                      styles.segmentItem,
                      guestOnly && styles.segmentActive,
                    ]}
                    onPress={() => setGuestOnly(true)}>
                    <Text
                      style={[
                        guestOnly ? FONTS.fs_14_semibold : FONTS.fs_14_medium,
                        guestOnly
                          ? styles.segmentTextActive
                          : styles.segmentText,
                      ]}>
                      숙박객만 참여가능
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.segmentItem,
                      !guestOnly && styles.segmentActive,
                    ]}
                    onPress={() => setGuestOnly(false)}>
                    <Text
                      style={[
                        !guestOnly ? FONTS.fs_14_semibold : FONTS.fs_14_medium,
                        !guestOnly
                          ? styles.segmentTextActive
                          : styles.segmentText,
                      ]}>
                      비숙박객 참여가능
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* 이벤트 금액 */}
              <Text style={[FONTS.fs_16_medium, {marginTop: 20}]}>
                이벤트 금액
              </Text>
              <View style={styles.section}>
                <View style={styles.inputRow}>
                  <Text style={[FONTS.fs_14_medium, styles.grayText]}>
                    숙박객
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={(t) => {
                      const v = onlyNum(t);
                      setAmount(v);
                      setFemaleAmount(v);
                    }}
                    keyboardType="number-pad"
                    placeholder="이벤트 금액을 입력해주세요"
                    placeholderTextColor={COLORS.grayscale_400}
                    style={[FONTS.fs_14_regular, styles.input]}
                  />
                </View>

                {/* 비숙박 금액 (옵션) */}
                {!guestOnly && (
                  <>
                    <View style={[styles.inputRow]}>
                      <Text style={[FONTS.fs_14_medium, styles.grayText]}>
                        비숙박객
                      </Text>
                      <TextInput
                        value={femaleNonAmount}
                        onChangeText={(t) => {
                          const v = onlyNum(t);
                          setFemaleNonAmount(v);
                          setMaleNonAmount(v);
                        }}
                        keyboardType="number-pad"
                        placeholder="이벤트 금액을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        style={[FONTS.fs_14_regular, styles.input]}
                      />
                    </View>
                  </>
                )}
              </View>

            </ScrollView>

            {/* 적용하기 버튼 */}
            <ButtonScarlet
              title={'적용하기'}
              onPress={handleConfirm}
              disabled={isDisabled}
              style={{marginBottom: 16}}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default MeetPriceModal;

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

  // 게하 정보 입력폼
  body: {
    flex: 1,
    marginBottom: 20,
  },
  section: {
    marginTop: 12,
  },

  // 설명 텍스트
  subText: {
    color: COLORS.grayscale_400,
    marginTop: 4,
  },

  // 태그
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    gap: 4,
    marginBottom: 20,
    alignContent: 'center',
  },
  tagBtn: {
    padding: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
  tagSelected: {
    color: COLORS.primary_orange,
  },

  // 이벤트 인원
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counterRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  counterNum: {
    width: 64,
    textAlign: 'center',
    color: COLORS.grayscale_900,
  },

  // 분할 토글
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.grayscale_0,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
  },
  segmentText: {color: COLORS.grayscale_400},
  segmentTextActive: {color: COLORS.primary_orange},

  // 금액 입력
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    color: COLORS.grayscale_900,
    backgroundColor: COLORS.grayscale_0,
  },
  grayText: {
    color: COLORS.grayscale_600,
  },
});
