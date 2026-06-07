import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Modal, ScrollView } from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { formatLocalDateTimeToDotAndTimeWithDay } from '@utils/formatDate';
import ButtonScarlet from '@components/ButtonScarlet';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

export default function ReservationCancelDetailModal({
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
      const res = await userMyApi.getReservationDetail(reservationId);
      setReservation(res.data);
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
            <Text style={[FONTS.fs_18_semibold]}>취소 상세내역</Text>
          </View>

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
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>취소/환불 정보</Text>
              <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.paymentAt).time}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제가격</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                (취소){' '}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {reservation.reservationAmount.toLocaleString()}원
                </Text>
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>결제 수단</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>{reservation.paymentMethod}</Text>
            </View>
          </View> */}

          {/* 임시 예약 정보 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>취소/환불 정보</Text>
              <Text style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                {formatLocalDateTimeToDotAndTimeWithDay(reservation.cancelledAt).date} {formatLocalDateTimeToDotAndTimeWithDay(reservation.cancelledAt).time}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>가격</Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                (취소){' '}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {reservation.amount.toLocaleString()}원
                </Text>
              </Text>
            </View>
          </View>

          {/* 환불 정책 내용 */}
          <ScrollView style={styles.policyContainer}>
            <Text style={[FONTS.fs_14_medium, styles.policyText]}>
              [환불 정책 안내]
              {'\n'}- 체크인 7일 전 취소 시: 전액 환불
              {'\n'}- 체크인 3일 전 취소 시: 결제 금액의 50% 환불
              {'\n'}- 체크인 당일 취소 시: 환불 불가
              {'\n\n'}※ 환불 금액은 결제 수단 및 환불 시점에 따라
              영업일 기준 3~7일 내 처리됩니다.
              {'\n'}※ 자세한 환불 규정은 [이용 약관]을 참조해주세요.
            </Text>
          </ScrollView>

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
    minHeight: '80%',
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
  
  // 환불 정책
  policyContainer: {
    maxHeight: '50%',
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  policyText: {
    color: COLORS.grayscale_700,
    lineHeight: 20,
  },

  devide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginVertical: 12,
  },

  closeButton: {
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 12,
    bottom: 40,
    width: '100%',
  },
});
