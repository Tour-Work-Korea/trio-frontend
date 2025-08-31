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
  Pressable
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import { guesthouseTags } from '@data/guesthouseTags';
import AddressSearchModal from '@components/modals/AddressSearchModal';
import TimePickerModal from '@components/modals/TimePickerModal';
import { formatLocalTimeToKorean12Hour } from '@utils/formatDate';

import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';
import XBtn from '@assets/images/x_gray.svg';
import ClockIcon from '@assets/images/clock_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const GuesthouseInfoModal = ({ visible, onClose, defaultName, defaultAddress, defaultDetailAddress, defaultPhone, onSelect, shouldResetOnClose }) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [nameOption, setNameOption] = useState('default'); // 'default' | 'custom'
  const [addressOption, setAddressOption] = useState('default'); // 'default' | 'custom'
  const [detailAddressOption, setDetailAddressOption] = useState('default'); // 'default' | 'custom'
  const [phoneOption, setPhoneOption] = useState('default'); // 'default' | 'custom'
  
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customAddressDetail, setCustomAddressDetail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); // { id, hashtag }

  const [checkIn, setCheckIn] = useState('15:00:00');
  const [checkOut, setCheckOut] = useState('11:00:00');
  const [timePickerVisible, setTimePickerVisible] = useState({ type: null, visible: false });

  // 핸드폰 번호 유효성 검사
  const currentPhone = phoneOption === 'default' ? (defaultPhone || '') : (customPhone || '');
  // 숫자만 남겨서 검사
  const normalizedPhone = currentPhone.replace(/\D/g, '');
  // 입력이 있을 때만 경고, 010으로 시작
  const showPhoneWarn = normalizedPhone.length > 0 && !normalizedPhone.startsWith('010');

  // 마지막 적용된 값 저장
  const [appliedData, setAppliedData] = useState(null);

  // 주소 검색 모달
  const [addressSearchVisible, setAddressSearchVisible] = useState(false);

  // 모달 열릴 때 마지막 적용 값 복원
  React.useEffect(() => {
    if (visible && appliedData) {
      setNameOption(appliedData.nameOption);
      setAddressOption(appliedData.addressOption);
      setPhoneOption(appliedData.phoneOption);
      setCustomName(appliedData.customName);
      setCustomAddress(appliedData.customAddress);
      setCustomAddressDetail(appliedData.customAddressDetail);
      setCustomPhone(appliedData.customPhone);
      setSelectedTags(appliedData.selectedTags);
      setCheckIn(appliedData.checkIn);
      setCheckOut(appliedData.checkOut);
    }
  }, [visible]);

  // 버튼 활성화 조건
  const isDisabled =
    !(nameOption === 'default' ? defaultName : customName) ||
    !(addressOption === 'default' ? defaultAddress : customAddress) ||
    !(phoneOption === 'default' ? defaultPhone : customPhone) ||
    selectedTags.length === 0;
  
  // 단순 닫기일 때만 초기화
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (appliedData) {
        // 마지막 적용값 복원
        setNameOption(appliedData.nameOption);
        setAddressOption(appliedData.addressOption);
        setPhoneOption(appliedData.phoneOption);
        setCustomName(appliedData.customName);
        setCustomAddress(appliedData.customAddress);
        setCustomAddressDetail(appliedData.customAddressDetail);
        setCustomPhone(appliedData.customPhone);
        setSelectedTags(appliedData.selectedTags);
        setCheckIn(appliedData.checkIn);
        setCheckOut(appliedData.checkOut);
      } else {
        // 처음 상태로 초기화
        setNameOption('default');
        setAddressOption('default');
        setPhoneOption('default');
        setCustomName('');
        setCustomAddress('');
        setCustomAddressDetail('');
        setCustomPhone('');
        setSelectedTags([]);
        setCheckIn('15:00:00');
        setCheckOut('11:00:00');
      }
    }
    onClose();
  };

  // 태그 선택 (최대 3개)
  const toggleTag = (tag) => {
    const alreadySelected = selectedTags.find((t) => t.id === tag.id);
    if (alreadySelected) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      if (selectedTags.length >= 3) return;
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 적용 버튼 눌렀을 때
  const handleConfirm = () => {
    const nameValue = nameOption === 'default' ? defaultName : customName;
    const addressValue = addressOption === 'default' ? defaultAddress : customAddress;
    const phoneValue = phoneOption === 'default' ? defaultPhone : customPhone;
    const tagIds = selectedTags.map((tag) => tag.id);
    const addressDetailValue =
    addressOption === 'custom' ? customAddressDetail : (defaultDetailAddress || '');

    // 현재 상태 저장
    setAppliedData({
      nameOption,
      addressOption,
      phoneOption,
      customName,
      customAddress,
      customAddressDetail,
      customPhone,
      selectedTags,
      checkIn,
      checkOut
    });

    onSelect({
      name: nameValue,
      address: addressValue,
      addressDetail: addressDetailValue,
      phone: phoneValue,
      tagIds,
      checkIn,
      checkOut
    });    
    
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
      <View style={styles.overlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleModalClose}
      />
        <KeyboardAvoidingView style={{ width: '100%' }}>
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
          <ScrollView 
            style={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            {/* 이름 */}
            <Text style={FONTS.fs_16_medium}>게스트하우스 이름</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity style={styles.radioBtn} onPress={() => setNameOption('default')}>
                {nameOption === 'default' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                <View style={styles.input}>
                  <Text style={styles.radioText}>{defaultName}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioBtn} onPress={() => setNameOption('custom')}>
                {nameOption === 'custom' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                <TextInput
                  placeholder="이름이 달라요"
                  value={customName}
                  onChangeText={setCustomName}
                  editable={nameOption === 'custom'}
                  style={[styles.input, nameOption === 'custom' ? {} : styles.disabledInput]}
                />
              </TouchableOpacity>
            </View>

            {/* 위치 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>위치</Text>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>
              도로명 주소 또는 지번 주소를 정확히 입력해주세요.{'\n'}(지도에서 검색 가능한 주소)
            </Text>
            <View style={styles.radioRow}>
              <TouchableOpacity style={styles.radioBtn} onPress={() => setAddressOption('default')}>
                {addressOption === 'default' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                <View style={styles.input}>
                  <Text style={styles.radioText}>{defaultAddress}</Text>
                </View>
              </TouchableOpacity>
              {Boolean(defaultDetailAddress?.trim()) && (
                <View style={[styles.radioBtn]}>
                  <View style={{height: 28, width: 28}}/>
                  <View style={styles.input}>
                    <Text style={styles.radioText}>{defaultDetailAddress}</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.radioBtn} onPress={() => setAddressOption('custom')}>
                {addressOption === 'custom' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                {addressOption === 'default' && (
                  <View style={[styles.input, addressOption === 'custom' ? {} : styles.disabledInput]}>
                    <Text style={[{color: COLORS.grayscale_400}]}>
                      주소가 달라요
                    </Text>
                  </View>
                )}
                {addressOption === 'custom' && (
                  <TextInput
                    placeholder="주소를 입력해 주세요"
                    value={customAddress}
                    onChangeText={setCustomAddress}
                    editable={addressOption === 'custom'}
                    style={[styles.input]}
                  />
                )}
              </TouchableOpacity>
              {addressOption === 'custom' && (
                <View style={[styles.radioBtn]}>
                  <View style={[{height: 28, width:28}]}/>
                  <TextInput
                    placeholder="상세 주소를 입력해 주세요"
                    value={customAddressDetail}
                    onChangeText={setCustomAddressDetail}
                    editable={addressOption === 'custom'}
                    style={[styles.input]}
                  />
                  <TouchableOpacity
                    style={styles.searchBtn}
                    onPress={() => setAddressSearchVisible(true)}
                  >
                    <Text style={[FONTS.fs_14_medium, styles.searchBtnText]}>주소 검색</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* 전화번호 */}
            <Text style={[FONTS.fs_16_medium, { marginTop: 20 }]}>전화번호</Text>
            {showPhoneWarn && (
              <Text style={[FONTS.fs_12_medium, { color: COLORS.semantic_red, marginTop: 4 }]}>
                010으로 시작하는 전화번호를 사용해주세요
              </Text>
            )}
            <View style={styles.radioRow}>
              <TouchableOpacity style={styles.radioBtn} onPress={() => setPhoneOption('default')}>
                {phoneOption === 'default' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                <View style={styles.input}>
                  <Text style={styles.radioText}>{defaultPhone}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioBtn} onPress={() => setPhoneOption('custom')}>
                {phoneOption === 'custom' ? <EnabledRadioButton width={28} height={28}/> : <DisabledRadioButton width={28} height={28}/>}
                <TextInput
                  placeholder="전화번호가 달라요"
                  value={customPhone}
                  onChangeText={setCustomPhone}
                  editable={phoneOption === 'custom'}
                  style={[styles.input, phoneOption === 'custom' ? {} : styles.disabledInput]}
                  keyboardType="number-pad"
                />
              </TouchableOpacity>
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

          {/* 적용하기 버튼 */}
          <ButtonScarlet
            title={'적용하기'}
            onPress={handleConfirm}
            disabled={isDisabled}
            style={{ marginBottom: 16 }}
          />

          {/* 주소 검색 모달 */}
          <AddressSearchModal
            visible={addressSearchVisible}
            onClose={() => setAddressSearchVisible(false)}
            onSelected={(data) => setCustomAddress(data.address)}
          />

        </View>
        </KeyboardAvoidingView>
      </View>
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
    marginLeft: 8,
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