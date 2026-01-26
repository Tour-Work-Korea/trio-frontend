import React, {useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import ButtonScarlet from '@components/ButtonScarlet';

const ReservationCancelConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  data,
}) => {
  // ✅ mock 데이터
  const mock = useMemo(
    () => ({
      paidAmount: 125000,
      cancelFee: 0,
      refundAmount: 125000,
      payMethodLabel: '카카오페이',
      refundMethodLabel: '카카오페이 환불',
    }),
    [],
  );

  const info = data || mock;
  const formatWon = v => `${Number(v || 0).toLocaleString()}원`;

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
            환불 예정금액 확인
          </Text>

          <View style={styles.divider} />

          {/* 설명 */}
          <Text style={[FONTS.fs_14_semibold, styles.desc]}>
            결제하셨던{' '}
            <Text style={styles.highlightRed}>{info.payMethodLabel}</Text>
            (으)로{' '}
            <Text style={styles.highlightRed}>
              {formatWon(info.refundAmount)}
            </Text>
            {' '}환불이 예상됩니다. 
            {'\n'}아래 환불 상세 내역을 확인해주세요.
          </Text>

          {/* 상세 정보 */}
          <View style={styles.detailBlock}>
            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                실 결제 금액
              </Text>
              <Text style={[FONTS.fs_14_medium]}>
                {formatWon(info.paidAmount)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                예상 취소 수수료
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
                환불 방법
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.refundMethod]}>
                {info.refundMethodLabel}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                최종 환불 금액
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.refundAmount]}>
                {formatWon(info.refundAmount)}
              </Text>
            </View>
          </View>

          {/* 안내 문구 */}
          <Text style={[FONTS.fs_14_regular, styles.notice]}>
            동의 후 취소를 누르시면 취소가 진행됩니다.
          </Text>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <ButtonWhite
              onPress={onClose}
              title='취소'
              style={{flex:1}}
            />
            <ButtonScarlet
              onPress={onConfirm}
              title='동의 후 취소'
              style={{flex:1}}
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
});
