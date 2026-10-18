import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarlet from '@components/ButtonScarlet';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';

const ReservationCancelConfirmModal = ({visible, onClose, onConfirm, data}) => {
  const {t} = useTranslation();
  const [isPolicyExpanded, setIsPolicyExpanded] = useState(false);
  const info = data || {
    paidAmount: 0,
    cancelFee: 0,
    refundAmount: 0,
    payMethodLabel: '',
    refundMethodLabel: '',
  };
  const formatWon = v =>
    t('common.valueWon', {value1: Number(v || 0).toLocaleString()});

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.dim}>
        <View style={styles.modalBox}>
          {/* 제목 */}
          <Text style={[FONTS.fs_18_semibold, styles.title]}>
            {t('guesthouse.checkTheExpectedRefundAmount')}
          </Text>

          <View style={styles.divider} />

          {/* 설명 */}
          <Text style={[FONTS.fs_14_semibold, styles.desc]}>
            {t('guesthouse.whatYouPaidFor')}{' '}
            <Text style={styles.highlightRed}>{info.payMethodLabel}</Text>
            {t('guesthouse.to')}{' '}
            <Text style={styles.highlightRed}>
              {formatWon(info.refundAmount)}
            </Text>{' '}
            {t('guesthouse.estimatedRefund')}
            {'\n'}
            {t('guesthouse.pleaseCheckTheRefundDetailsBelow')}
          </Text>

          {/* 상세 정보 */}
          <View style={styles.detailBlock}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.actualPaymentAmount')}
              </Text>
              <Text style={[FONTS.fs_14_medium]}>
                {formatWon(info.paidAmount)}
              </Text>
            </View>

            {!!info.appliedPolicyText && (
              <>
                <View style={styles.row}>
                  <Text style={[FONTS.fs_14_medium, styles.label]}>
                    {t('common.applicableRegulations')}
                  </Text>
                  {info.dailyInfo ? (
                    <TouchableOpacity
                      style={{flexDirection: 'row', alignItems: 'center'}}
                      onPress={() => setIsPolicyExpanded(!isPolicyExpanded)}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          {color: COLORS.semantic_red, marginRight: 4},
                        ]}>
                        {info.appliedPolicyText}
                      </Text>
                      {isPolicyExpanded ? (
                        <ChevronUp width={16} height={16} />
                      ) : (
                        <ChevronDown width={16} height={16} />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        {color: COLORS.semantic_red},
                      ]}>
                      {info.appliedPolicyText}
                    </Text>
                  )}
                </View>

                {isPolicyExpanded && info.dailyInfo && (
                  <View style={styles.dailyPolicyContainer}>
                    {info.dailyInfo.map((infoItem, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dailyPolicyRow,
                          idx !== 0 && styles.dailyPolicyBorder,
                        ]}>
                        <View>
                          <Text
                            style={[
                              FONTS.fs_14_semibold,
                              styles.dailyPolicyTitle,
                            ]}>
                            {infoItem.nightIndex}
                            {t('common.tea')}
                            {infoItem.dateStr})
                          </Text>
                          <Text
                            style={[FONTS.fs_12_medium, styles.dailyPolicySub]}>
                            {infoItem.daysBeforeLabel}
                          </Text>
                        </View>
                        <Text
                          style={[
                            FONTS.fs_14_medium,
                            styles.dailyPolicyAmount,
                          ]}>
                          {infoItem.rate === 0
                            ? t('common.noRefundAmount0Won')
                            : t('guesthouse.valueRefundValue', {
                                infoItem_rate: infoItem.rate,
                                value2: formatWon(infoItem.refundAmt),
                              })}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.estimatedCancellationFee')}
              </Text>
              <Text style={[FONTS.fs_14_medium]}>
                {formatWon(info.cancelFee)}
              </Text>
            </View>
          </View>

          <View style={styles.middleDivider} />

          <View style={styles.detailBlock}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.refundMethod')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.refundMethod]}>
                {info.refundMethodLabel}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.finalRefundAmount')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.refundAmount]}>
                {formatWon(info.refundAmount)}
              </Text>
            </View>
          </View>

          {/* 안내 문구 */}
          <Text style={[FONTS.fs_14_regular, styles.notice]}>
            {t('guesthouse.clickCancelAfterAgreeingToCancel')}
          </Text>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <ButtonWhite
              onPress={onClose}
              title={t('common.cancel')}
              style={{flex: 1}}
            />

            <ButtonScarlet
              onPress={onConfirm}
              title={t('guesthouse.cancelAfterConsent')}
              style={{flex: 1}}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReservationCancelConfirmModal;

const styles = StyleSheet.create({
  dim: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 18,
    padding: 20,
  },

  // 제목
  title: {
    color: COLORS.grayscale_900,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginTop: 12,
    marginBottom: 14,
  },

  // 설명
  desc: {
    color: COLORS.grayscale_800,
    lineHeight: 20,
  },
  highlightRed: {
    color: COLORS.primary_orange,
  },

  // 취소 정보
  detailBlock: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    color: COLORS.grayscale_500,
  },
  middleDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginTop: 16,
  },
  refundMethod: {
    color: COLORS.primary_orange,
  },
  refundAmount: {
    color: COLORS.primary_orange,
  },

  // 안내 메세지
  notice: {
    marginTop: 16,
    color: COLORS.grayscale_600,
  },

  // 버튼
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 20,
  },

  // 차등수수료 내역
  dailyPolicyContainer: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 16,
    marginTop: 12,
  },
  dailyPolicyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dailyPolicyBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_100,
  },
  dailyPolicyTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  dailyPolicySub: {
    color: COLORS.grayscale_400,
  },
  dailyPolicyAmount: {
    color: COLORS.grayscale_900,
  },
});
