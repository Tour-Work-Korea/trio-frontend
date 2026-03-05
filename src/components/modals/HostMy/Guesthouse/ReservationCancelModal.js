import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import ButtonWhite from '@components/ButtonWhite';

import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

export default function ReservationCancelModal({
  visible,
  onClose,
  reservation, // 예약 정보 객체
  onSubmit,
}) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = ['고객 요청', '오버부킹', '시설 점검/고장', '운영 사정', '기타(직접 입력)'];
  const DIRECT_INPUT_REASON = '기타(직접 입력)';
  const isDirectInput = selectedReason === DIRECT_INPUT_REASON;
  const finalReason = isDirectInput ? customReason.trim() : selectedReason;
  const isReasonValid = !!finalReason;

  const resetAndClose = () => {
    setReasonOpen(false);
    setSelectedReason('');
    setCustomReason('');
    setSubmitting(false);
    onClose?.();
  };

  const handlePressSubmit = async () => {
    if (!reservation?.reservationId) {
      Alert.alert('오류', '예약 정보가 없어요.');
      return;
    }
    if (!isReasonValid) {
      Alert.alert('안내', '취소 사유를 선택해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await hostGuesthouseApi.cancelGuesthouseReservationByHost(
        reservation.reservationId,
        { cancelReason: finalReason },
      );
      await onSubmit?.(reservation.reservationId, finalReason);
      Toast.show({
        type: 'success',
        text1: '예약이 취소되었어요.',
        position: 'top',
        visibilityTime: 2000,
      });
      resetAndClose();
    } catch (e) {
      setSubmitting(false);
      Toast.show({
        type: 'error',
        text1: '예약 취소를 실패했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.keyboardDismissArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_18_semibold]}>예약 취소</Text>
          </View>

          {/* 예약 정보 */}
          <View style={styles.reservationInfoSection}>
            <InfoRow label="예약자" value={reservation.reservationUserName} />
            <InfoRow label="나이" value={reservation.age} />
            <InfoRow label="전화번호" value={reservation.reservationUserPhone} />
            <InfoRow label="예약번호" value={reservation.reservationNumber} />
            <InfoRow label="인원수" value={reservation.guestCount} />
            <InfoRow label="객실" value={reservation.roomName} isHighlight />
            <InfoRow
              label="이용기간"
              value={
                reservation.period ||
                `${formatLocalDateToDotWithDay(reservation.checkInDate)} ~ ${formatLocalDateToDotWithDay(reservation.checkOutDate)}`
              }
              isHighlight
            />
          </View>

          <View style={styles.section}>
            {/* 취소 사유 */}
            <Text style={[FONTS.fs_14_medium, { color: COLORS.grayscale_400, marginVertical: 12 }]}>
              취소 사유를 알려주세요
            </Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setReasonOpen(!reasonOpen)}
              >
                <Text style={[FONTS.fs_12_medium,{ color: selectedReason ? COLORS.grayscale_900 : COLORS.grayscale_400 }]}>
                  {selectedReason || '취소 사유를 선택해 주세요'}
                </Text>
                {reasonOpen ? <ChevronUp width={24} height={24}/> : <ChevronDown width={24} height={24}/>}
              </TouchableOpacity>

              {reasonOpen && (
                <View style={styles.dropdownList}>
                  {reasons.map((r, index) => (
                    <View key={r}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedReason(r);
                          if (r !== DIRECT_INPUT_REASON) {
                            setCustomReason('');
                          }
                          setReasonOpen(false);
                        }}
                      >
                        <Text 
                          style={[
                            FONTS.fs_14_medium,
                            selectedReason === r && FONTS.fs_14_semibold,
                            { color: selectedReason === r ? COLORS.primary_orange : COLORS.grayscale_900 }
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>

                      {index < reasons.length - 1 && <View style={styles.devide} />}
                    </View>
                  ))}
                </View>
              )}
            </View>
            {isDirectInput ? (
              <TextInput
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="취소 사유를 입력해 주세요"
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_12_medium, styles.reasonInput]}
              />
            ) : null}

            <View style={styles.buttonRow}>
              <ButtonWhite
                onPress={resetAndClose}
                title='닫기'
                style={{flex:1}}
              />
              <ButtonWhite
                onPress={handlePressSubmit}
                disabled={!isReasonValid || submitting}
                title='예약 취소'
                backgroundColor={COLORS.primary_orange}
                textColor={COLORS.grayscale_0}
                style={{flex:1}}
              />
            </View>
          </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const InfoRow = ({ label, value, isHighlight = false }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>{label}</Text>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.infoValue,
          isHighlight ? styles.infoValueHighlight : null,
        ]}
      >
        {value || '-'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.modal_background,
  },
  keyboardDismissArea: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  reservationInfoSection: {
    gap: 10,
  },
  infoContent: {
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {

  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.grayscale_500,
  },
  infoValue: {
    color: COLORS.grayscale_900,
    textAlign: 'right',
    marginLeft: 16,
    flexShrink: 1,
  },
  infoValueHighlight: {
    color: COLORS.primary_orange,
  },

  // 날짜, 시간
  dateContent: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_100,
    padding: 8,
    flexDirection: 'row',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    color: COLORS.grayscale_700,
  },
  timeText: {
    color: COLORS.grayscale_400,
  },
  devideText: {
    marginHorizontal: 16,
    alignSelf: 'center',
  },

  // 취소 정보
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: COLORS.grayscale_400,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    color: COLORS.grayscale_500,
  },
  value: {
  },
  reservationTimeText: {
    color: COLORS.grayscale_400,
  },

  // 취소 사유
  dropdown: { 
    borderWidth: 1, 
    borderColor: COLORS.grayscale_200, 
    borderRadius: 20, 
    padding: 8,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownList: { 
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    borderWidth: 1, 
    borderColor: COLORS.grayscale_200, 
    borderRadius: 20,
    paddingHorizontal: 8, 
    backgroundColor: COLORS.grayscale_0,
    zIndex: 101,
    elevation: 6,
  },
  dropdownItem: { 
    alignItems: 'center',
    paddingVertical: 12, 
  },
  reasonInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.grayscale_900,
  },
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});
