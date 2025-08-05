import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import userMyApi from '@utils/api/userMyApi';

import ArrowRight from '@assets/images/arrow_right_white.svg';
import XBtn from '@assets/images/x_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';

// 임시 데이터 예시
const mockPastReservation = [
  {
    reservationId: 1,
    reservationUserName: '홍길동',
    reservationUserPhone: '010-3333-3333',
    reservationAmount: 150000,
    paymentMethod: '카드결제',
    paymentStatus: '결제완료',
    paymentAt: "2025-08-05T06:48:19",
    guesthouseId: 101,
    guesthouseName: '서울 한옥 게스트하우스',
    guesthouseImage: 'https://picsum.photos/200/200?random=1',
    guesthousePhone: '010-1234-5678',
    guesthouseAddress: '서울특별시 종로구 한옥마을길 12',
    roomName: '온돌방',
    roomCapacity: 2,
    roomMaxCapacity: 4,
    reservationStatus: '이용완료',
    checkIn: '2025-07-10T15:00:00',
    checkOut: '2025-07-12T11:00:00',
    reservationRequest: "string",
    reservationAt: "2025-08-05T06:48:19",
    amount: 30000,
  },
];

export default function ReservationCancelModal({
  visible,
  onClose,
  reservation = mockPastReservation[0], // 기본값 mock 데이터,
  reservationId,
}) {
  const [step, setStep] = useState(1); // 1: 취소 정보, 2: 취소 사유
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const checkInFormatted = formatLocalDateTimeToDotAndTimeWithDay(reservation.checkIn);
  const checkOutFormatted = formatLocalDateTimeToDotAndTimeWithDay(reservation.checkOut);

  const cancelDateTime = dayjs().format('YYYY. MM. DD (dd) HH:mm');

  const reasons = ['단순변심', '예약착오', '가격차이', '기타'];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback 
        onPress={() => {
          setStep(1);
          setSelectedReason('');
          onClose();
        }}
      >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_18_semibold]}>예약 취소</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setStep(1);
                setSelectedReason('');
                onClose();
              }}
            >
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>

          {/* 예약 정보 */}
          <View style={styles.guesthouseInfo}>
            <Image
              source={{ uri: reservation.guesthouseImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoContent}>
              <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{reservation.guesthouseName}</Text>
              <Text style={[FONTS.fs_14_medium, styles.roomText]}>{reservation.roomName}</Text>
              <Text style={[FONTS.fs_12_medium, styles.adressText]}>{reservation.guesthouseAddress}</Text>
            </View>
          </View>
          <View style={styles.dateContent}>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkInFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkInFormatted.time} </Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.devideText]}>~</Text>
            <View style={styles.dateContainer}>
              <Text style={[FONTS.fs_14_semibold, styles.dateText]}> {checkOutFormatted.date} </Text>
              <Text style={[FONTS.fs_12_medium, styles.timeText]}> {checkOutFormatted.time} </Text>
            </View>
          </View>

          <View style={styles.section}>
            {/* 취소 정보 */}
            {step === 1 && (
              <>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>취소 일시</Text>
                  <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>{cancelDateTime}</Text>
                </View>
                {/* <View style={styles.row}>
                  <Text style={styles.label}>결제 가격</Text>
                  <Text style={styles.value}>{reservation.reservationAmount.toLocaleString()}원</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>결제 수단</Text>
                  <Text style={styles.value}>{reservation.paymentMethod}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>예상환불 금액</Text>
                  <Text style={[styles.value, { color: COLORS.primary_orange }]}>
                    {reservation.reservationAmount.toLocaleString()}원
                  </Text>
                </View> */}
                <View style={styles.row}>
                  <Text style={styles.label}>예약 가격</Text>
                  <Text style={styles.value}>{reservation.amount.toLocaleString()}원</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>예약 시간</Text>
                  <Text style={styles.value}>{formatLocalDateTimeToDotAndTimeWithDay(reservation.reservationAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.reservationAt).time}</Text>
                </View>
                <View style={[styles.row, {flexDirection: 'column', gap: 4}]}>
                  <Text style={styles.label}>요청사항</Text>
                  <Text style={[styles.value]}>
                    {reservation.reservationRequest}
                  </Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                  <Text style={styles.nextText}>다음</Text>
                  <ArrowRight width={24} height={24}/>
                </TouchableOpacity>
              </>
            )}

            {/* 취소 사유 */}
            {step === 2 && (
              <>
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
                  onPress={async () => {
                    if (!selectedReason) {
                      alert('취소 사유를 선택해주세요.');
                      return;
                    }
                    try {
                      const res = await userMyApi.cancelTempGuesthouseReservation(
                        reservationId,
                      );
                      setStep(1);
                      setSelectedReason('');
                      Toast.show({
                        type: 'success',
                        text1: '취소 되었어요!',
                        position: 'top',
                        visibilityTime: 2000,
                      });
                      onClose();
                    } catch (error) {
                      alert('예약 취소에 실패했습니다. 다시 시도해주세요.');
                    }
                  }}
                >
                  <Text style={styles.cancelText}>취소하기</Text>
                </TouchableOpacity>
              </>
            )}
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
