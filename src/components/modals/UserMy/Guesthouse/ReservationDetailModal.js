import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import ButtonScarlet from '@components/ButtonScarlet';

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

export default function ReservationDetailModal({
  visible,
  onClose,
  reservation = mockPastReservation[0], // 기본값 mock 데이터,
  reservationId,
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_18_semibold]}>상세내역</Text>
          </View>

          {/* 예약자 정보 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약자 정보</Text>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>이름</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.reservationUserName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>전화번호</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.reservationUserPhone}</Text>
            </View>
          </View>

          <View style={styles.devide}/>

          {/* 예약 정보 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약 정보</Text>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>게스트하우스</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.guesthouseName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>방</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.roomName}</Text>
            </View>
          </View>

          <View style={styles.devide}/>

          {/* 결제 정보 */}
          {/* <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>결제 정보</Text>
              <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).time}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제가격</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.reservationAmount.toLocaleString()}원</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제 수단</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.paymentMethod}</Text>
            </View>
          </View> */}
          {/* 예약 정보 (임시) */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약 내용</Text>
              <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(reservation.reservationAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.reservationAt).time}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>가격</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.amount.toLocaleString()}원</Text>
            </View>
            <View style={[styles.row, {flexDirection: 'column', gap: 4, marginBottom: 12,}]}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>요청 사항</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.reservationRequest}</Text>
            </View>
          </View>

          {/* 닫기 버튼 */}
          <View style={styles.closeButton}>
            <ButtonScarlet
              title={'닫기'}
              onPress={onClose}
            />
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
  XButton: {
    position: 'absolute',
    right: 0,
  },

  section: {
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
  
  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 12,
  },

  closeButton: {
    marginTop: 12,
  },
});
