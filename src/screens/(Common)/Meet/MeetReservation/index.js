import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import Header from '@components/Header';
import styles from './MeetReservation.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import TermsModal from '@components/modals/TermsModal';
import userMeetApi from '@utils/api/userMeetApi';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import userMyApi from '@utils/api/userMyApi';
import {getUsableCouponCount} from '@utils/coupon/couponUtils';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import DiscountArrow from '@assets/images/discount_arrow.svg';

// 번화번호 사이에 '-' 집어넣기
const formatPhoneNumber = phone => {
  if (!phone || phone.length !== 11) return phone; // 예외 처리
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const MeetReservation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    partyId,
    partyTitle: routePartyTitle,
    partyStartDateTime: routePartyStartDateTime,
    partyStartTime: routePartyStartTime,
    partyEndTime: routePartyEndTime,
    amount: routeMaleGuestAmount,
    maleNonAmount: routeMaleNonAmount,
    thumbnailUrl: routeThumbnailUrl,
    selectedCoupon,
  } = route.params ?? {};
  const [reservationInfo, setReservationInfo] = useState(null);

  // 예약 정보
  useEffect(() => {
    if (!partyId) return;
    const run = async () => {
      try {
        const {data} = await userMeetApi.joinParty(partyId);
        setReservationInfo(data);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message;
        const status = e?.response?.status;
        // 숙박객 전용 접근 제한
        if (
          status === 403 ||
          (typeof msg === 'string' && msg.includes('숙박'))
        ) {
          Toast.show({
            type: 'error',
            text1: '숙박객만 참여할 수 있어요',
            position: 'top',
            visibilityTime: 3000,
          });
          // 디테일 페이지로 이동
          // navigation.replace('MeetDetail', { partyId });
          navigation.goBack();
          return;
        }
        Toast.show({
          type: 'error',
          text1: '이벤트 참가 정보를 불러오지 못했어요.',
          position: 'top',
        });
        navigation.goBack();
      }
    };
    run();
  }, [partyId, navigation]);

  const title = reservationInfo?.partyTitle ?? routePartyTitle ?? '';
  const checkInDate = reservationInfo?.partyStartDateTime ?? routePartyStartDateTime ?? null;
  const checkInTime =
    reservationInfo?.partyStartDateTime ??
    routePartyStartTime ??
    routePartyStartDateTime ??
    null;
  const checkOutTime =
    reservationInfo?.partyEndDateTime ?? routePartyEndTime ?? null;
  const isGuest = !!reservationInfo?.guest;
  const isFemale = reservationInfo?.gender === 'F';
  const gender = isFemale ? '여자' : '남자';
  const meetPrice = reservationInfo?.amount ?? 0;
  const name = reservationInfo?.name;
  const phone = reservationInfo?.phoneNumber;

  const [requestMessage, setRequestMessage] = useState('');
  const [pointValue, setPointValue] = useState('');
  const [pointBalance, setPointBalance] = useState(0);
  const [coupons, setCoupons] = useState([]);

  const formatTime = timeStr => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = dateStr => {
    if (!dateStr) return '-';
    const date = dayjs(dateStr);
    if (!date.isValid()) return '-';
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

  const formatPriceValue = value => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return `${numeric.toLocaleString()}원`;
  };

  const guestPrice = isGuest
    ? reservationInfo?.amount ?? routeMaleGuestAmount ?? null
    : routeMaleGuestAmount ?? null;
  const nonGuestPrice = isGuest
    ? routeMaleNonAmount ?? null
    : reservationInfo?.amount ?? routeMaleNonAmount ?? null;

  const guestPriceText = formatPriceValue(guestPrice) ?? '-';
  const nonGuestPriceText =
    nonGuestPrice == null
      ? '참여불가'
      : formatPriceValue(nonGuestPrice) ?? '참여불가';

  const eventDateText = formatDateWithDay(checkInDate);
  const eventTimeText = `${formatTime(checkInTime)}~${formatTime(checkOutTime)}`;
  const eventDateTimeText =
    eventDateText === '-' ? eventTimeText : `${eventDateText} ${eventTimeText}`;
  const eventDateTimeNoEndText =
    eventDateText === '-'
      ? formatTime(checkInTime)
      : `${eventDateText} ${formatTime(checkInTime)}`;
  const eventThumbnailSource = routeThumbnailUrl
    ? {uri: routeThumbnailUrl}
    : null;
  const numericPointValue = Number(pointValue || 0);
  const isPointOverBalance = numericPointValue > Number(pointBalance || 0);
  const usableCouponCount = getUsableCouponCount(coupons, meetPrice);
  const couponDiscountAmount = Number(selectedCoupon?.discountAmount || 0);
  const priceAfterCoupon = Math.max(
    Number(meetPrice || 0) - couponDiscountAmount,
    0,
  );
  const appliedPointAmount = Math.min(
    numericPointValue,
    Number(pointBalance || 0),
    priceAfterCoupon,
  );
  const finalPaymentAmount = Math.max(priceAfterCoupon - appliedPointAmount, 0);
  const totalDiscountAmount = couponDiscountAmount + appliedPointAmount;

  const [agreeAll, setAgreeAll] = useState(false);

  const [agreements, setAgreements] = useState({
    terms: false,
    personalInfo: false,
    thirdParty: false,
  });

  // 유효성 검사
  const isAllRequiredAgreed =
    agreements.terms && agreements.personalInfo && agreements.thirdParty;

  const toggleAgreement = key => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAll = () => {
    const newValue = !agreeAll;
    setAgreeAll(newValue);
    setAgreements({
      terms: newValue,
      personalInfo: newValue,
      thirdParty: newValue,
    });
  };

  useEffect(() => {
    const allChecked =
      agreements.terms && agreements.personalInfo && agreements.thirdParty;
    if (allChecked !== agreeAll) {
      setAgreeAll(allChecked);
    }
  }, [agreements]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchPointBalance = async () => {
      try {
        const response = await userMyApi.getPointBalance();
        if (!isActive) return;
        setPointBalance(response?.data?.currentPoints ?? 0);
      } catch (error) {
        if (!isActive) return;
        console.warn('포인트 조회 실패:', error);
        setPointBalance(0);
      }
    };

    fetchPointBalance();

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCoupons = async () => {
        try {
          const response = await userMyApi.getMyCoupons();
          if (!isActive) return;
          setCoupons(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
          if (!isActive) return;
          console.warn('쿠폰 조회 실패:', error);
          setCoupons([]);
        }
      };

      fetchCoupons();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const openTermModal = key => {
    setSelectedTerm(key);
    setModalVisible(true);
  };

  const handleAgreeModal = () => {
    if (selectedTerm) {
      setAgreements(prev => ({
        ...prev,
        [selectedTerm]: true,
      }));
    }
    setModalVisible(false);
  };

  const handleChangePointValue = text => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (!numericText) {
      setPointValue('');
      return;
    }

    setPointValue(numericText);
  };

  // 예약 생성
  const handleCreateReservation = async () => {
    if (!partyId || !reservationInfo) return;

    try {
      // 요청사항
      const requestText = requestMessage?.trim() || '';
      const {data} = await reservationPaymentApi.createPartyReservation(
        partyId,
        {
          amount: Number(reservationInfo?.amount ?? 0),
          request: requestText,
        },
      );

      const reservationId =
        typeof data === 'number'
          ? data
          : data?.id ?? data?.reservationId ?? Number.NaN;

      if (!reservationId) {
        throw new Error('예약 ID가 없습니다.');
      }

      // 결제로 이동 (amount는 joinParty 응답의 금액 사용)
      navigation.navigate('MeetPayment', {
        amount: finalPaymentAmount,
        reservationId,
        partyTitle: title,
        partyStartDateTime: checkInDate,
        partyStartTime: checkInTime,
        partyEndTime: checkOutTime,
        thumbnailUrl: routeThumbnailUrl,
        userCouponId:
          selectedCoupon?.userCouponId ||
          selectedCoupon?.couponId ||
          selectedCoupon?.id,
        pointUsed: appliedPointAmount,
      });
    } catch (e) {
      console.log('createPartyReservation error', e);
      const msg =
        e?.response?.data?.message || '예약 생성 중 오류가 발생했어요.';
      Toast.show({type: 'error', text1: msg, position: 'top'});
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <View style={{flex: 1}}>
        <Header title="예약" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">

          {/* 이벤트 정보 */}
          <View style={styles.eventInfoRow}>
            {eventThumbnailSource && (
              <Image
                source={eventThumbnailSource}
                style={styles.eventThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.eventTextRow}>
              <Text style={[FONTS.fs_18_medium]}>{title}</Text>
              <Text style={[FONTS.fs_14_medium]}>{eventDateTimeText}</Text>
              <View style={styles.eventPriceRow}>
                <Text style={[FONTS.fs_12_medium]}>
                  숙박객 {guestPriceText}
                </Text>
                <View style={styles.priceDevide} />
                <Text style={[FONTS.fs_12_medium]}>
                  비숙박객 {nonGuestPriceText}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.devide} />

          {/* 예약자 정보 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
              예약자 정보
            </Text>
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                이름
              </Text>
              <Text style={FONTS.fs_14_medium}>{name}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                전화번호
              </Text>
              <Text style={FONTS.fs_14_medium}>{formatPhoneNumber(phone)}</Text>
            </View>
          </View>

          <View style={styles.devide} />

          {/* 예약 정보, 가격 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
              예약 정보
            </Text>
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_semibold, styles.meetNameText]}>
                {isGuest ? '숙박객' : '비숙박객'}, {gender}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.meetPriceText]}>
                {Number(meetPrice || 0).toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.devide} />

          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
              할인 및 결제 정보
            </Text>
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                참가비
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.meetPriceText]}>
                {Number(meetPrice || 0).toLocaleString()}원
              </Text>
            </View>
            <View style={[styles.devide, {marginVertical: 8}]} />

            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                쿠폰 할인
              </Text>
              <TouchableOpacity
                style={styles.couponBtn}
                onPress={() =>
                  navigation.navigate('CouponSelect', {
                    totalPrice: meetPrice,
                    selectedCouponId:
                      selectedCoupon?.userCouponId ||
                      selectedCoupon?.couponId ||
                      selectedCoupon?.id ||
                      null,
                    targetScreen: 'MeetReservation',
                    title: '쿠폰 할인',
                  })
                }>
                {selectedCoupon?.discountLabel ? (
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.selectedCouponDiscountText,
                    ]}>
                    - {selectedCoupon.discountLabel}
                  </Text>
                ) : (
                  <Text style={FONTS.fs_14_medium}>
                    사용 가능 쿠폰 {usableCouponCount}장
                  </Text>
                )}
                <ChevronRight width={16} height={16} />
              </TouchableOpacity>
            </View>

            {selectedCoupon ? (
              <View style={styles.selectedCouponBanner}>
                <Text
                  style={[FONTS.fs_14_medium, styles.selectedCouponNameText]}
                  numberOfLines={1}>
                  ㄴ {selectedCoupon.title}
                </Text>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.selectedCouponAmountText,
                  ]}>
                  {selectedCoupon.discountLabel}
                </Text>
              </View>
            ) : (
              <View style={styles.couponBanner}>
                <Text style={[FONTS.fs_14_semibold]}>
                  쿠폰 적용하고{' '}
                  <Text style={styles.couponBannerText}>최대 할인 혜택</Text>{' '}
                  받으세요!
                </Text>
              </View>
            )}

            <View style={[styles.userInfo, {marginTop: 4}]}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                포인트
              </Text>
              <View style={styles.pointSection}>
                <TextInput
                  style={[FONTS.fs_14_medium, styles.pointInput]}
                  value={pointValue}
                  onChangeText={handleChangePointValue}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.grayscale_400}
                />
                <TouchableOpacity
                  style={styles.pointBtn}
                  onPress={() => setPointValue(String(pointBalance || 0))}>
                  <Text style={FONTS.fs_14_regular}>전액사용</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[FONTS.fs_12_medium, styles.pointText]}>
              보유 {Number(pointBalance || 0).toLocaleString()}P
            </Text>
            {isPointOverBalance ? (
              <Text style={[FONTS.fs_12_medium, styles.pointWarningText]}>
                보유 포인트보다 많이 입력할 수 없어요.
              </Text>
            ) : null}

            <View style={[styles.userInfo, {marginTop: 12}]}>
              <Text style={[FONTS.fs_16_semibold, styles.userInfoTitle]}>
                총 결제 금액
              </Text>
              <Text style={[FONTS.fs_18_semibold, styles.meetPriceText]}>
                {finalPaymentAmount.toLocaleString()}원
              </Text>
            </View>
          </View>

          <View style={styles.devide} />

          {/* 요청사항 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
              요청 사항 (선택)
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[FONTS.fs_14_regular, styles.requestInput]}
                placeholder="요청사항을 호스트께 전달해보세요"
                placeholderTextColor={COLORS.grayscale_400}
                value={requestMessage}
                onChangeText={setRequestMessage}
              />
            </View>
          </View>

          <View style={styles.devide} />

          {/* 약관 동의 */}
          <View style={styles.agreeRowContainer}>
            <TouchableOpacity onPress={toggleAll} style={styles.agreeRowTitle}>
              {agreeAll ? (
                <View style={styles.checkedBox}>
                  {' '}
                  <Checked width={24} height={24} />{' '}
                </View>
              ) : (
                <View style={styles.uncheckedBox}>
                  {' '}
                  <Unchecked width={24} height={24} />{' '}
                </View>
              )}
              <Text style={FONTS.fs_14_semibold}>전체 동의</Text>
            </TouchableOpacity>

            <View style={styles.agreeRowConent}>
              <View style={styles.agreeRow}>
                <TouchableOpacity onPress={() => toggleAgreement('terms')}>
                  {agreements.terms ? (
                    <View style={styles.checkedBox}>
                      {' '}
                      <Checked width={24} height={24} />{' '}
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox}>
                      {' '}
                      <Unchecked width={24} height={24} />{' '}
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                  <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                    [필수]
                  </Text>{' '}
                  이벤트 취소/환불 규정에 동의합니다.
                </Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => openTermModal('terms')}>
                  <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                    보기
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.agreeRow}>
                <TouchableOpacity
                  onPress={() => toggleAgreement('personalInfo')}
                  style={styles.agreeRow}>
                  {agreements.personalInfo ? (
                    <View style={styles.checkedBox}>
                      {' '}
                      <Checked width={24} height={24} />{' '}
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox}>
                      {' '}
                      <Unchecked width={24} height={24} />{' '}
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                  <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                    [필수]
                  </Text>{' '}
                  개인정보 수집 및 이용에 동의합니다.
                </Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => openTermModal('personalInfo')}>
                  <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                    보기
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.agreeRow}>
                <TouchableOpacity
                  onPress={() => toggleAgreement('thirdParty')}
                  style={styles.agreeRow}>
                  {agreements.thirdParty ? (
                    <View style={styles.checkedBox}>
                      {' '}
                      <Checked width={24} height={24} />{' '}
                    </View>
                  ) : (
                    <View style={styles.uncheckedBox}>
                      {' '}
                      <Unchecked width={24} height={24} />{' '}
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                  <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                    [필수]
                  </Text>{' '}
                  개인정보 제3자 제공에 동의합니다.
                </Text>
                <TouchableOpacity
                  style={styles.seeMore}
                  onPress={() => openTermModal('thirdParty')}>
                  <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                    보기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 요약정보 */}
          <View style={styles.bottomInfoRow}>
            <Text style={[FONTS.fs_14_medium]}>{eventDateTimeNoEndText}</Text>
            <Text  style={[FONTS.fs_16_medium]}>{finalPaymentAmount.toLocaleString()}원</Text>
          </View>

          <View style={styles.button}>
            {totalDiscountAmount > 0 ? (
              <View style={styles.discountBanner}>
                <DiscountArrow width={18} height={18} />
                <Text style={[FONTS.fs_14_semibold]}>
                  <Text style={styles.discountBannerText}>
                    총 {totalDiscountAmount.toLocaleString()}원
                  </Text>{' '}
                  할인 받았어요
                </Text>
              </View>
            ) : null}
            <ButtonScarlet
              title={`${finalPaymentAmount.toLocaleString()}원 결제하기`}
              disabled={!isAllRequiredAgreed || isPointOverBalance}
              onPress={handleCreateReservation}
            />
          </View>
        </ScrollView>

        {/* 약관동의 모달 */}
        <TermsModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={
            selectedTerm === 'terms'
              ? '이벤트 취소/환불 규정'
              : selectedTerm === 'personalInfo'
              ? '개인정보 수집 및 이용'
              : selectedTerm === 'thirdParty'
              ? '개인정보 제3자 제공'
              : ''
          }
          content={
            selectedTerm === 'terms'
              ? '취소 환불 규정 내용 ...'
              : selectedTerm === 'personalInfo'
              ? '개인정보 수집 이용 동의 내용 ...'
              : selectedTerm === 'thirdParty'
              ? '개인정보 제3자 제공 동의 내용 ...'
              : ''
          }
          onAgree={handleAgreeModal}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default MeetReservation;
