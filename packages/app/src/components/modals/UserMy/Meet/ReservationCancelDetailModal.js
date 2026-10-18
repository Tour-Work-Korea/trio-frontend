import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import ButtonScarlet from '@components/ButtonScarlet';
import Loading from '@components/Loading';
import userMyApi from '@utils/api/userMyApi';

export default function ReservationCancelDetailModal({
  visible,
  onClose,
  reservationId,
}) {
  const {t} = useTranslation();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReservationDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userMyApi.getReservationDetail(reservationId);
      setReservation(res.data);
    } catch (error) {
      console.log('예약 상세 불러오기 실패', error);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    if (visible && reservationId) {
      fetchReservationDetail();
    }
  }, [fetchReservationDetail, reservationId, visible]);

  if (loading || !reservation) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Loading title={t('common.loadingContent')} />
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
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* 헤더 */}
              <View style={styles.header}>
                <Text style={[FONTS.fs_18_semibold]}>
                  {t('meet.cancellationDetails')}
                </Text>
              </View>

              {/* 예약 정보 */}
              <View style={styles.section}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  {t('common.reservationInformation')}
                </Text>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.guestHouse')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.value]}>
                    {reservation.guesthouseName}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('meet.room')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.value]}>
                    {reservation.roomName}
                  </Text>
                </View>
              </View>

              <View style={styles.devide} />

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
                  <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                    {t('common.cancellationRefundInformation')}
                  </Text>
                  <Text
                    style={[FONTS.fs_14_regular, styles.reservationTimeText]}>
                    {
                      formatLocalDateTimeToDotAndTimeWithDay(
                        reservation.cancelledAt,
                      ).date
                    }{' '}
                    {
                      formatLocalDateTimeToDotAndTimeWithDay(
                        reservation.cancelledAt,
                      ).time
                    }
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.price')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.value]}>
                    {t('common.cancel_ecae02')}{' '}
                    <Text style={{textDecorationLine: 'line-through'}}>
                      {reservation.amount.toLocaleString()}
                      {t('common.won')}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* 환불 정책 내용 */}
              <ScrollView style={styles.policyContainer}>
                <Text style={[FONTS.fs_14_medium, styles.policyText]}>
                  {t('meet.refundPolicyInformation')}

                  {'\n'}
                  {t('meet.cancellation7DaysBeforeCheckInFullRefund')}
                  {'\n'}
                  {t('meet.cancellation3DaysBeforeCheckIn50RefundOfPayment')}
                  {'\n'}
                  {t('meet.ifCanceledOnTheDayOfCheckInNoRefund')}
                  {'\n\n'}
                  {t('meet.refundsWillBeProcessedWithin3To7BusinessDays')}

                  {'\n'}
                  {t('meet.pleaseReferToTermsOfUseForDetailedRefundPolicies')}
                </Text>
              </ScrollView>

              {/* 닫기 버튼 */}
              <View style={styles.closeButton}>
                <ButtonScarlet title={t('common.close')} onPress={onClose} />
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

  section: {},
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
  value: {},
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
