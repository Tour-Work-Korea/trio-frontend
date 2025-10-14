import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';

import XBtn from '@assets/images/x_gray.svg';
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
  const [submitting, setSubmitting] = useState(false);

  const reasons = ['객실 점검 및 시설 문제', '중복 예약으로 인한 불가', '고객 요청에 따른 취소', '기타(직접 입력)'];

  const resetAndClose = () => {
    setReasonOpen(false);
    setSelectedReason('');
    setSubmitting(false);
    onClose?.();
  };

  const handlePressSubmit = async () => {
    if (!reservation?.reservationId) {
      Alert.alert('오류', '예약 정보가 없어요.');
      return;
    }
    if (!selectedReason) {
      Alert.alert('안내', '취소 사유를 선택해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit?.(reservation.reservationId, selectedReason);
      // 성공/실패 토스트는 상위에서 처리
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
      <TouchableWithoutFeedback onPress={resetAndClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_18_semibold]}>예약 취소</Text>
            <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 예약 정보 */}
          <View style={styles.guesthouseInfo}>
            {/* <Image
              source={{ uri: reservation.guesthouseImage }}
              style={styles.image}
              resizeMode="cover"
            /> */}
            <View style={styles.infoContent}>
              {/* <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{reservation.guesthouseName}</Text> */}
              <Text style={[FONTS.fs_14_medium, styles.roomText]}>{reservation.roomName}</Text>
              <Text style={[FONTS.fs_12_medium, styles.adressText]}>이용자: {reservation.reservationUserName}</Text>
              <Text style={[FONTS.fs_12_medium, styles.adressText]}>전화번호: {reservation.reservationUserPhone}</Text>
            </View>
          </View>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>{formatLocalDateToDotWithDay(reservation.checkInDate)}</Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.devideText]}>~</Text>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}>{formatLocalDateToDotWithDay(reservation.checkOutDate)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            {/* 취소 사유 */}
            <Text style={[FONTS.fs_16_medium, { color: COLORS.grayscale_400, marginBottom: 16 }]}>
              취소 사유를 알려주세요
            </Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setReasonOpen(!reasonOpen)}
            >
              <Text style={[FONTS.fs_14_medium,{ color: selectedReason ? COLORS.black : COLORS.grayscale_400 }]}>
                {selectedReason || '취소 사유를 선택해 주세요'}
              </Text>
              {reasonOpen ? <ChevronUp width={24} height={24}/> : <ChevronDown width={24} height={24}/>}
            </TouchableOpacity>

            {reasonOpen && (
              <View style={styles.dropdownList}>
                {reasons.map((r, index) => (
                  <>
                    <TouchableOpacity
                      key={r}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedReason(r);
                        setReasonOpen(false);
                      }}
                    >
                      <Text 
                        style={[
                          FONTS.fs_14_medium,
                          selectedReason === r && FONTS.fs_14_semibold,
                          { color: selectedReason === r ? COLORS.primary_orange : COLORS.black }
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>

                    {index < reasons.length - 1 && <View style={styles.devide} />}
                  </>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: COLORS.primary_orange }]}
              onPress={handlePressSubmit}
              disabled={submitting}
            >
              <Text style={styles.cancelText}>취소하기</Text>
            </TouchableOpacity>
          </View>

        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modal_background,
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // 헤더
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 게하 정보
  guesthouseInfo: {
    flexDirection: 'row',
  },
  image: {
    width: 112,
    height: 112,
    borderRadius: 4,
    marginRight: 12,
  },
  infoContent: {
    paddingVertical: 4,
    gap: 4,
  },
  nameText: {

  },
  roomText: {
    color: COLORS.grayscale_800,
  },
  adressText: {
    color: COLORS.grayscale_500,
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
    flex: 1,
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

  // 버튼
  nextButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.grayscale_0,
    marginRight: 10,
  },

  // 취소 사유
  dropdown: { 
    borderWidth: 1, 
    borderColor: COLORS.grayscale_200, 
    borderRadius: 20, 
    padding: 12,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  dropdownList: { 
    marginTop: 8, 
    borderWidth: 1, 
    borderColor: COLORS.grayscale_200, 
    borderRadius: 20,
    paddingHorizontal: 8, 
  },
  dropdownItem: { 
    alignItems: 'center',
    paddingVertical: 12, 
  },
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
  },
  cancelText: {
    color: COLORS.grayscale_0,
  },
});
