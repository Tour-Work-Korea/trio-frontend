import {useTranslation} from 'react-i18next';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import ButtonWhite from '@components/ButtonWhite';
import ButtonScarlet from '@components/ButtonScarlet';

const ReservationConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  guesthouseName = '',
  roomSummary = '',
  roomSubSummary = '',
  checkInLabel = '',
  checkOutLabel = '',
}) => {
  const {t} = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback>
        <View style={s.backdrop}>
          <TouchableWithoutFeedback>
            <View style={s.modal}>
              {/* 타이틀 */}
              <Text style={[FONTS.fs_20_bold, s.title]}>
                {t('guesthouse.checkReservationDetails')}
              </Text>
              <View style={s.divider} />

              <View style={{paddingHorizontal: 8}}>
                {/* 숙소명 */}
                <Text style={[FONTS.fs_18_bold, s.guesthouseName]}>
                  {guesthouseName}
                </Text>

                {/* 요약 */}
                <Text style={[FONTS.fs_16_regular, s.roomSummary]}>
                  {roomSummary}
                </Text>
                {!!roomSubSummary && (
                  <Text style={[FONTS.fs_14_regular, s.roomSubSummary]}>
                    {roomSubSummary}
                  </Text>
                )}

                {/* 체크인/아웃 */}
                <View style={s.row}>
                  <Text style={[FONTS.fs_14_regular, s.label]}>
                    {t('common.checkIn')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, s.value]}>
                    {checkInLabel}
                  </Text>
                </View>

                <View style={s.row}>
                  <Text style={[FONTS.fs_14_regular, s.label]}>
                    {t('common.checkOut')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, s.value]}>
                    {checkOutLabel}
                  </Text>
                </View>
              </View>

              {/* 안내 박스 */}
              <View style={s.noticeBox}>
                <View style={s.noticeItem}>
                  <Text style={s.bullet}>•</Text>
                  <View style={{flex: 1}}>
                    <Text style={[FONTS.fs_14_semibold, s.noticeTitle]}>
                      {t('guesthouse.noCancellationAndFees')}
                    </Text>
                    <Text style={[FONTS.fs_12_medium, s.noticeDesc]}>
                      {t(
                        'guesthouse.dependingOnTheCancellationAndRefundPolicyCancellationMayNot',
                      )}
                    </Text>
                  </View>
                </View>

                <View style={s.noticeItem}>
                  <Text style={s.bullet}>•</Text>
                  <View style={{flex: 1}}>
                    <Text style={[FONTS.fs_14_semibold, s.noticeTitle]}>
                      {t('guesthouse.minorsAndLegalRepresentativesRequired')}
                    </Text>
                    <Text style={[FONTS.fs_12_medium, s.noticeDesc]}>
                      {t(
                        'guesthouse.minorsAreNotPermittedToStayWithoutALegalRepresentative',
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 버튼 */}
              <View style={s.btnRow}>
                <ButtonWhite
                  title={t('common.cancel')}
                  onPress={onClose}
                  style={{flex: 1}}
                />

                <ButtonScarlet
                  onPress={onConfirm}
                  title={t('guesthouse.payAfterAgreeing')}
                  style={{flex: 1}}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modal: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginBottom: 14,
  },
  guesthouseName: {
    color: COLORS.grayscale_900,
    marginBottom: 10,
  },
  roomSummary: {
    color: COLORS.grayscale_900,
    marginBottom: 6,
  },
  roomSubSummary: {
    color: COLORS.grayscale_500,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    color: COLORS.grayscale_900,
  },
  value: {
    color: COLORS.grayscale_900,
  },
  noticeBox: {
    backgroundColor: COLORS.secondary_red,
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    gap: 16,
  },
  noticeItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    color: COLORS.semantic_red,
    fontSize: 18,
    lineHeight: 18,
  },
  noticeTitle: {
    color: COLORS.semantic_red,
    marginBottom: 4,
  },
  noticeDesc: {
    color: COLORS.grayscale_700,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default ReservationConfirmModal;
