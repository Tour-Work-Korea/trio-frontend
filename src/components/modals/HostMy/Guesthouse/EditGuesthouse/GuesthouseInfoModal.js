import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { guesthouseTags } from '@data/guesthouseTags';
import AddressSearchModal from '@components/modals/AddressSearchModal';
import TimePickerModal from '@components/modals/TimePickerModal';
import { formatLocalTimeToKorean12Hour } from '@utils/formatDate';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XBtn from '@assets/images/x_gray.svg';
import ClockIcon from '@assets/images/clock_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseInfoModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  guesthouseId,

  // 기본값 props
  defaultName = '',
  defaultAddress = '',
  defaultDetailAddress = '',
  defaultPhone = '',
  defaultCheckIn = '15:00:00',
  defaultCheckOut = '11:00:00',
  defaultHashtags = [],
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [baseline, setBaseline] = useState(null);
  const [baselineTags, setBaselineTags] = useState([]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); // [{id, hashtag}]
  const [checkIn, setCheckIn] = useState('15:00:00');
  const [checkOut, setCheckOut] = useState('11:00:00');
  const [timePickerVisible, setTimePickerVisible] = useState({ type: null, visible: false });

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 주소 검색 모달
  const [addressSearchVisible, setAddressSearchVisible] = useState(false);

  // 모달 열릴 때 초기화/복원
  useEffect(() => {
    if (!visible) return;

    if (appliedData && !shouldResetOnClose) {
      // 마지막 적용값 복원
      setName(appliedData.name);
      setAddress(appliedData.address);
      setAddressDetail(appliedData.addressDetail);
      setPhone(appliedData.phone);
      setSelectedTags(appliedData.selectedTags);
      setCheckIn(appliedData.checkIn);
      setCheckOut(appliedData.checkOut);
      setBaseline({
        name: appliedData.name,
        address: appliedData.address,
        addressDetail: appliedData.addressDetail,
        phone: appliedData.phone,
        checkIn: appliedData.checkIn,
        checkOut: appliedData.checkOut,
      });
      setBaselineTags((appliedData.selectedTags || []).map(t => t.id));
    } else {
      // 부모 기본값으로 초기화
      setName(defaultName || '');
      setAddress(defaultAddress || '');
      setAddressDetail(defaultDetailAddress || '');
      setPhone(defaultPhone || '');
      setCheckIn(defaultCheckIn || '15:00:00');
      setCheckOut(defaultCheckOut || '11:00:00');

      // 태그 프리셋 (최대 3개)
      const preset = guesthouseTags.filter(t =>
        (defaultHashtags || []).some(h => h.hashtag === t.hashtag)
      ).slice(0, 3);
      setSelectedTags(preset);
      setBaselineTags(preset.map(t => t.id));

      setBaseline({
        name: defaultName || '',
        address: defaultAddress || '',
        addressDetail: defaultDetailAddress || '',
        phone: defaultPhone || '',
        checkIn: defaultCheckIn || '15:00:00',
        checkOut: defaultCheckOut || '11:00:00',
      });
    }
  }, [
    visible,
    appliedData,
    shouldResetOnClose,
    defaultName,
    defaultAddress,
    defaultDetailAddress,
    defaultPhone,
    defaultCheckIn,
    defaultCheckOut,
    defaultHashtags,
  ]);

  // 필수값 유효성
  const isDisabled =
    !name?.trim() ||
    !address?.trim() ||
    !phone?.trim() ||
    selectedTags.length === 0;
  
  // 단순 닫기
  const handleModalClose = () => {
    onClose();
  };

  // 태그 선택 (최대 3개)
  const toggleTag = (tag) => {
    const exists = selectedTags.some(t => t.id === tag.id);
    if (exists) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      if (selectedTags.length >= 3) return;
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 변경된 값만 추린 서버 보낼 데이터
  const pickChangedBasics = (prev, next) => {
    const trim = (v) => (typeof v === 'string' ? v.trim() : v);
    const fields = [
      ['guesthouseName', 'name'],
      ['guesthouseAddress', 'address'],
      ['guesthouseDetailAddress', 'addressDetail'],
      ['guesthousePhone', 'phone'],
      ['checkIn', 'checkIn'],
      ['checkOut', 'checkOut'],
    ];
    const payload = {};
    for (const [prevKey, nextKey] of fields) {
      const prevVal = trim(prev?.[prevKey] ?? '');
      const nextVal = trim(next?.[nextKey] ?? '');
      if (nextVal !== '' && prevVal !== nextVal) {
        // 서버 스키마에 맞춰 key를 prevKey로 보냄
        payload[prevKey] = nextVal;
      }
    }
    return payload;
  };

  // 태그 변경 여부 비교(정렬 무시, 중복 무시)
  const idsChanged = (prevIds = [], nextIds = []) => {
    const a = Array.from(new Set(prevIds)).sort((x, y) => x - y);
    const b = Array.from(new Set(nextIds)).sort((x, y) => x - y);
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
    return false;
  };

  // 적용 버튼 눌렀을 때
   const handleConfirm = async () => {
    const snapshot = {
      name,
      address,
      addressDetail,
      phone,
      selectedTags,
      checkIn,
      checkOut,
    };
    setAppliedData(snapshot);

    const payload = pickChangedBasics(baseline || {}, snapshot);
    const nextTagIds = selectedTags.map(t => t.id);
    const tagWasChanged = idsChanged(baselineTags, nextTagIds);
    // 아무 것도 안 바뀌었으면 API 호출 생략
    if (Object.keys(payload).length === 0 && !tagWasChanged) {
      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });
      onClose();
      return;
    }

    if (!guesthouseId) {
      return;
    }
    try {
      const requests = [];
      if (Object.keys(payload).length > 0) {
        requests.push(hostGuesthouseApi.updateGuesthouseBasic(guesthouseId, payload));
      }
      if (tagWasChanged) {
        // 최대 3개 유지(방어코드)
        requests.push(
          hostGuesthouseApi.updateGuesthouseHashtags(guesthouseId, nextTagIds.slice(0, 3))
        );
      }
      await Promise.all(requests);
      Toast.show({ type: 'success', text1: '수정이 등록되었습니다!', position: 'top' });

      // 다음 비교를 위한 기준값 갱신
      setBaseline({ name, address, addressDetail, phone, checkIn, checkOut });
      setBaselineTags(nextTagIds.slice(0, 3));

      // 부모에 최신 값 전달 (미리보기 용)
      onSelect({
        name,
        address,
        addressDetail,
        phone,
        tagIds: nextTagIds,
        checkIn,
        checkOut,
      });
      onClose();
    } catch (e) {
      Toast.show({ type: 'error', text1: '수정 중 오류가 발생했어요.', position: 'top' });
      // 에러 시 모달은 그대로 열어둘 수도 있고, 닫을 수도 있음. 지금은 열어둠.
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
      >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
              게스트하우스 정보
            </Text>
            <TouchableOpacity style={styles.XBtn} onPress={handleModalClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 게하 정보 */}
          <ScrollView style={styles.body}>
            {/* 이름 */}
            <Text style={FONTS.fs_16_medium}>게스트하우스 이름</Text>
            <View style={styles.radioRow}>
              <TextInput
                placeholder="이름을 입력해 주세요"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor={COLORS.grayscale_400}
              />
            </View>

            {/* 위치 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>위치</Text>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>
              도로명 주소 또는 지번 주소를 정확히 입력해주세요.{'\n'}(지도에서 검색 가능한 주소)
            </Text>
            <View style={styles.radioRow}>
              <TextInput
                placeholder="주소를 입력해 주세요"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={COLORS.grayscale_400}
                style={styles.input}
              />
              <View style={[styles.radioBtn]}>
                <TextInput
                  placeholder="상세 주소를 입력해 주세요"
                  value={addressDetail}
                  onChangeText={setAddressDetail}
                  style={styles.input}
                  placeholderTextColor={COLORS.grayscale_400}
                />
                <TouchableOpacity
                  style={styles.searchBtn}
                  onPress={() => setAddressSearchVisible(true)}
                >
                  <Text style={[FONTS.fs_14_medium, styles.searchBtnText]}>주소 검색</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 전화번호 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>전화번호</Text>
            <View style={styles.radioRow}>
              <TextInput
                placeholder="전화번호를 입력해 주세요"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.grayscale_400}
              />
            </View>

            {/* 체크인 체크아웃 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>체크인 / 체크아웃</Text>
            <View style={{ marginTop: 8, gap: 12 }}>
              <View style={styles.timeRow}>
                <Text style={[FONTS.fs_14_medium, styles.timeTitle]}>체크인</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setTimePickerVisible({ type: 'checkIn', visible: true })}
                >
                  <Text style={styles.timeText}>{formatLocalTimeToKorean12Hour(checkIn)}</Text>
                  <ClockIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeRow}>
                <Text style={[FONTS.fs_14_medium, styles.timeTitle]}>체크아웃</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setTimePickerVisible({ type: 'checkOut', visible: true })}
                >
                  <Text style={styles.timeText}>{formatLocalTimeToKorean12Hour(checkOut)}</Text>
                  <ClockIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* TimePickerModal */}
            <TimePickerModal
              visible={timePickerVisible.visible}
              initialValue={
                timePickerVisible.type === 'checkIn' ? checkIn : checkOut
              }
              onClose={() => setTimePickerVisible({ type: null, visible: false })}
              onConfirm={(time) => {
                if (timePickerVisible.type === 'checkIn') setCheckIn(time);
                else setCheckOut(time);
                setTimePickerVisible({ type: null, visible: false });
              }}
            />

            {/* 태그 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>
              태그로 게스트하우스 특징을 알려주세요
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>최대 3개 선택가능</Text>
            <View style={styles.tagsContainer}>
              {guesthouseTags.map((tag) => {
                const isSelected = selectedTags.some((t) => t.id === tag.id);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => toggleTag(tag)}
                    style={styles.tagBtn}
                  >
                    <Text style={[styles.tagText, isSelected && styles.tagSelected]}>
                      {tag.hashtag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* 수정하기 버튼 */}
          <ButtonScarlet
            title={'수정하기'}
            onPress={handleConfirm}
            disabled={isDisabled}
            style={{ marginBottom: 16 }}
          />

          {/* 주소 검색 모달 */}
          <AddressSearchModal
            visible={addressSearchVisible}
            onClose={() => setAddressSearchVisible(false)}
            onSelected={(data) => {
              setAddress(data.address);
            }}
          />

        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GuesthouseInfoModal;

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
  },
  radioRow: {
    marginTop: 8,
    gap: 8,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: COLORS.grayscale_900,
  },
  // 텍스트 입력
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
  },
  disabledInput: {
    backgroundColor: COLORS.grayscale_100,
    color: COLORS.grayscale_400,
  },

  // 설명 텍스트
  subText: {
    color: COLORS.grayscale_400,
    marginTop: 4,
  },

  // 주소 검색
  searchBtn: {
    position: 'absolute',
    right: 4,
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  searchBtnText: {
    color: COLORS.grayscale_0,
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
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
  tagSelected: {
    color: COLORS.primary_orange,
  },

  // 체크인 체크아웃
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTitle: {
    width: 60,
    color: COLORS.grayscale_500,
  },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
});