import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Modal } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import ButtonScarlet from '@components/ButtonScarlet';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

// 가짜 데이터 생성 함수
const generateFakeReservation = (id) => {
  return {
    reservationId: id,
    reservationUserName: '김00',
    reservationAmount: 25000,
    paymentMethod: '카드 결제',
    paymentStatus: '결제 완료',
    guesthouseId: 101,
    guesthouseName: '제주 바다뷰 게스트하우스',
    guesthousePhone: '010-1234-5678',
    partyId: 501,
    partyTitle: '제주 선셋 바베큐 파티',
    partyImage: 'https://picsum.photos/400/200?random=1',
    partyLocation: '제주시 애월읍 바닷가길 12',
    reservationStatus: 'CONFIRMED',
    reservationRequest: '창가 쪽 자리 부탁드려요.',
    startDateTime: '2025-10-20T19:00:00',
  };
};

export default function ReservationDetailModal({
  visible,
  onClose,
  reservationId,
}) {
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && reservationId) {
      fetchReservationDetail();
    }
  }, [visible, reservationId]);

  const fetchReservationDetail = async () => {
    try {
      setLoading(true);
      // API 대신 0.5초 후 가짜 데이터 생성
      await new Promise((r) => setTimeout(r, 500));
      setReservation(generateFakeReservation(reservationId));
    } catch (error) {
      console.log('예약 상세 불러오기 실패', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reservation) {
    return (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Loading
              title={'내용을 불러오는 중 이에요'}
            />
          </View>
        </View>
      </Modal>
    );
  }

  const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(reservation.startDateTime);

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
              <Text style={[FONTS.fs_14_medium, styles.value]}>000</Text>
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
              <Text style={[FONTS.fs_14_medium, styles.label]}>게스트하우스 전화번호</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.guesthousePhone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>참여 모임</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.partyTitle}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>참여 장소</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.partyLocation}</Text>
            </View>
          </View>

          <View style={styles.devide}/>

          {/* 결제 정보 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>결제 정보</Text>
              {/* <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).time}
              </Text> */}
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제가격</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.reservationAmount.toLocaleString()}원</Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제 수단</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.paymentMethod}</Text>
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
    minHeight: '40%',
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
