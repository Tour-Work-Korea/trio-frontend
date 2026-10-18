import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {PAYMENT_TYPE_LABEL} from '@constants/payment';
import Header from '@components/Header';
import styles from './MeetPaymentReceipt.styles';
import ButtonWhite from '@components/ButtonWhite';
import Loading from '@components/Loading';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import AlertModal from '@components/modals/AlertModal';
import AppImage from '@components/AppImage';

export default function MeetPaymentReceipt() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {
    reservationId,
    isFromDeeplink = false,
    partyId,
    openContactModal = false,
  } = route.params ?? {};
  const [reservationDetail, setReservationDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelUnavailableOpen, setCancelUnavailableOpen] = useState(false);
  const [contactGuesthouseOpen, setContactGuesthouseOpen] = useState(false);

  const fetchReservationDetail = useCallback(async () => {
    if (!reservationId) {
      return;
    }
    try {
      setLoading(true);
      const {data} = await reservationPaymentApi.getPartyReservationDetail(
        reservationId,
      );

      if (data?.reservationStatus === 'CANCELLED') {
        Toast.show({
          type: 'error',
          text1: t('meet.thisApplicationHasAlreadyBeenCancelled'),
        });
        if (isFromDeeplink || !navigation.canGoBack()) {
          navigation.reset({
            index: 1,
            routes: [
              {
                name: 'MainTabs',
                params: {
                  screen: '마이',
                  params: {screen: 'UserMyPage'},
                },
              },
              {name: 'UserMeetReservationCheck'},
            ],
          });
        } else {
          navigation.goBack();
        }
        return;
      }

      setReservationDetail(data);
      if (openContactModal && data?.reservationStatus !== 'PENDING') {
        setContactGuesthouseOpen(true);
      }
    } catch (e) {
      console.log('파티 예약 상세 불러오기 실패', e);
      if (isFromDeeplink) {
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'MainTabs',
              params: {
                screen: '마이',
                params: {screen: 'UserMyPage'},
              },
            },
            {name: 'UserMeetReservationCheck'},
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isFromDeeplink, navigation, openContactModal, reservationId, t]);

  useEffect(() => {
    fetchReservationDetail();
  }, [fetchReservationDetail]);

  const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.startDateTime,
  );
  const endFormatted = formatLocalDateTimeToDotAndTimeWithDay(
    reservationDetail?.endDateTime,
  );
  const partyDescription = reservationDetail?.partyDescription ?? '';
  const partyAnnouncementItems = useMemo(() => {
    const announcements = Array.isArray(reservationDetail?.partyAnnouncements)
      ? reservationDetail.partyAnnouncements
      : [];

    return announcements
      .map(item => (typeof item === 'string' ? item : item?.announcement))
      .map(item => item?.trim())
      .filter(Boolean);
  }, [reservationDetail?.partyAnnouncements]);
  const hasPartyAnnouncements = partyAnnouncementItems.length > 0;
  const reservationRequest =
    reservationDetail?.reservationRequest?.trim() ?? '';
  const locationText =
    trimJejuPrefix(
      reservationDetail?.partyLocation || reservationDetail?.meetingPlace,
    ) || '';
  const guesthousePhone = reservationDetail?.guesthousePhone?.trim() ?? '';
  const handleCopyLocation = () => {
    if (!locationText) {
      return;
    }

    Clipboard.setString(locationText);
    Toast.show({
      type: 'success',
      text1: t('meet.iCopiedTheLocation'),
      position: 'top',
    });
  };
  const handleCopyGuesthousePhone = () => {
    if (!guesthousePhone) {
      return;
    }

    Clipboard.setString(guesthousePhone);
    Toast.show({
      type: 'success',
      text1: t('common.iCopiedYourPhoneNumber'),
      position: 'top',
    });
  };
  const handleContactGuesthouse = async () => {
    if (!guesthousePhone) {
      return;
    }

    setContactGuesthouseOpen(false);
    const phone = guesthousePhone.replace(/[^0-9+]/g, '');
    await Linking.openURL(`tel:${phone}`);
  };
  const handlePressCancel = () => {
    const startDate = reservationDetail?.startDateTime
      ? new Date(reservationDetail.startDateTime)
      : null;

    if (
      startDate &&
      !Number.isNaN(startDate.getTime()) &&
      startDate <= new Date()
    ) {
      setCancelUnavailableOpen(true);
      return;
    }

    navigation.navigate('MeetCancelConfirm', {
      reservationId,
      cancelContext: {
        partyTitle: reservationDetail?.partyTitle,
        partyImage: reservationDetail?.partyImage,
        guesthouseName:
          reservationDetail?.guesthouse ?? reservationDetail?.guesthouseName,
        startDateTime: reservationDetail?.startDateTime,
        endDateTime: reservationDetail?.endDateTime,
        partyLocation:
          reservationDetail?.partyLocation || reservationDetail?.meetingPlace,
        ...(typeof reservationDetail?.amount === 'number'
          ? {paidAmount: reservationDetail.amount}
          : {}),
        ...(typeof reservationDetail?.cancelFee === 'number'
          ? {cancelFee: reservationDetail.cancelFee}
          : {}),
        ...(typeof reservationDetail?.refundAmount === 'number'
          ? {refundAmount: reservationDetail.refundAmount}
          : {}),
        ...(reservationDetail?.refundMethod
          ? {refundMethod: reservationDetail.refundMethod}
          : {}),
      },
    });
  };

  const isPending = reservationDetail?.reservationStatus === 'PENDING';
  const headerTitle = isPending
    ? t('meet.waitingForApplication')
    : reservationDetail?.reservationStatus === 'COMPLETED'
    ? t('common.completedUse')
    : t('common.applicationConfirmed');

  const additionalInfo = [
    [t('meet.detailedSchedule'), reservationDetail?.detailSchedule],
    [
      t('meet.meetingPlace_1994b8'),
      trimJejuPrefix(reservationDetail?.meetingPlace),
    ],
    [t('meet.snacksProvided'), reservationDetail?.snacks],
    [t('meet.transportationInformation'), reservationDetail?.trafficInfo],
    [t('meet.parkingInformation_d224f7'), reservationDetail?.parkingInfo],
    [t('meet.otherInformation'), reservationDetail?.extraInfo],
  ].filter(([, value]) => typeof value === 'string' && value.trim());

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header title={headerTitle} />

        {loading ? (
          <Loading title={t('meet.retrievingReservationInformation')} />
        ) : (
          <View style={styles.body}>
            {/* 콘텐츠 제목, 사진 */}
            <View style={styles.card}>
              <Text style={[FONTS.fs_18_medium, styles.title]}>
                {reservationDetail?.partyTitle || '-'}
              </Text>

              {reservationDetail?.partyImage ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    const targetPartyId = reservationDetail?.partyId || partyId;
                    if (targetPartyId) {
                      navigation.navigate('MeetDetail', {
                        partyId: targetPartyId,
                      });
                    }
                  }}>
                  <AppImage
                    uri={reservationDetail.partyImage}
                    style={styles.image}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.divide} />

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.date')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {startFormatted.date}
              </Text>
            </View>

            {!!guesthousePhone && (
              <View style={styles.infoRow}>
                <Text style={[FONTS.fs_14_medium, styles.label]}>
                  {t('common.contactUs_531f6a')}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyGuesthousePhone}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.value,
                      styles.copyablePhone,
                    ]}>
                    {guesthousePhone}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.hour')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.value]}>
                {startFormatted.time}
                {endFormatted.time ? ` ~ ${endFormatted.time}` : ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.label]}>
                {t('common.location_962eeb')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!locationText}
                onPress={handleCopyLocation}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.value,
                    locationText && styles.copyableLocation,
                  ]}>
                  {locationText || '-'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 안내 박스 */}
            <View style={styles.noticeBox}>
              <Text style={[FONTS.fs_14_semibold, styles.noticeTitle]}>
                {t('meet.notification')}
              </Text>
              {hasPartyAnnouncements ? (
                partyAnnouncementItems.map((announcement, index) => (
                  <View
                    key={`${announcement}-${index}`}
                    style={styles.noticeItem}>
                    <View style={styles.noticeBullet} />
                    <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
                      {announcement}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
                  {partyDescription ||
                    t('meet.thereAreNoRegisteredInstructions')}
                </Text>
              )}
            </View>

            {additionalInfo.map(([label, value]) => (
              <View key={label} style={styles.noticeBox}>
                <Text style={[FONTS.fs_14_semibold, styles.noticeTitle]}>
                  {label}
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.requestText]}>
                  {value}
                </Text>
              </View>
            ))}

            {reservationRequest ? (
              <View style={styles.requestBox}>
                <Text style={[FONTS.fs_14_semibold, styles.requestTitle]}>
                  {t('common.request')}
                </Text>
                <Text style={[FONTS.fs_14_regular, styles.requestText]}>
                  {reservationRequest}
                </Text>
              </View>
            ) : null}

            {reservationDetail && (
              <View style={styles.paymentBox}>
                <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
                  {t('common.paymentInformation')}
                </Text>
                {!!reservationDetail.approvedAt && (
                  <Text style={[FONTS.fs_12_medium, styles.subText]}>
                    {t('meet.paymentDateAndTime')}
                    {
                      formatLocalDateTimeToDotAndTimeWithDay(
                        reservationDetail.approvedAt,
                      ).date
                    }{' '}
                    {
                      formatLocalDateTimeToDotAndTimeWithDay(
                        reservationDetail.approvedAt,
                      ).time
                    }
                  </Text>
                )}
                {!!reservationDetail.selectedPriceOptionName && (
                  <View style={styles.priceInfoRow}>
                    <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                      {t('meet.optionalFee')}
                    </Text>
                    <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                      {reservationDetail.selectedPriceOptionName}
                    </Text>
                  </View>
                )}
                <View style={styles.priceInfoRow}>
                  <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                    {t('common.actualPaymentAmount')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                    {typeof reservationDetail.amount === 'number'
                      ? t('common.valueWon', {
                          value1:
                            reservationDetail.amount.toLocaleString('ko-KR'),
                        })
                      : '-'}
                  </Text>
                </View>
                <View style={styles.priceInfoRow}>
                  <Text style={[FONTS.fs_14_semibold, styles.priceLabel]}>
                    {t('common.paymentMethod')}
                  </Text>
                  <Text style={[FONTS.fs_14_medium, styles.priceValue]}>
                    {PAYMENT_TYPE_LABEL[reservationDetail.paymentType] || '-'}
                  </Text>
                </View>
              </View>
            )}

            {/* 예약 취소 버튼 */}
            <ButtonWhite
              title={
                isPending
                  ? t('common.cancelApplication')
                  : t('common.cancellationRefundInquiry')
              }
              backgroundColor={
                isPending ? COLORS.secondary_red : COLORS.grayscale_100
              }
              textColor={isPending ? COLORS.semantic_red : COLORS.grayscale_600}
              onPress={
                isPending
                  ? handlePressCancel
                  : () => setContactGuesthouseOpen(true)
              }
            />
          </View>
        )}
      </ScrollView>

      <AlertModal
        visible={cancelUnavailableOpen}
        message={t('meet.cancellationIsNotPossibleAfterTheStartTime')}
        buttonText={t('common.close')}
        onPress={() => setCancelUnavailableOpen(false)}
        onRequestClose={() => setCancelUnavailableOpen(false)}
      />

      <AlertModal
        visible={contactGuesthouseOpen}
        message={t('meet.thisIsActivityForWhichTheApplicationHasBeenConfirmed')}
        buttonText={t('common.confirm')}
        onPress={() => setContactGuesthouseOpen(false)}
        buttonText2={guesthousePhone ? t('common.contactUs_531f6a') : null}
        onPress2={guesthousePhone ? handleContactGuesthouse : null}
        onRequestClose={() => setContactGuesthouseOpen(false)}
      />
    </View>
  );
}
