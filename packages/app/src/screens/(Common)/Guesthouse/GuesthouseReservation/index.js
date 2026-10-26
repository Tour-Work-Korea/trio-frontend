import {formatNumber} from '@utils/localeFormat';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import Header from '@components/Header';
import styles from './GuesthouseReservation.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import userMyApi from '@utils/api/userMyApi';
import {getUsableCouponCount} from '@utils/coupon/couponUtils';
import {applyRefundPoliciesToAgreementHtml} from '@utils/refundPolicyAgreement';
import {AGREEMENT_CONTENT} from '@data/agreeContents';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';
import useUserStore from '@stores/userStore';
import TermsModal from '@components/modals/TermsModal';
import ReservationConfirmModal from '@components/modals/Guesthouse/ReservationConfirmModal';
import AlertModal from '@components/modals/AlertModal';
import {prepareWebPaymentWindow} from '@web/webPaymentWindow';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import DiscountArrow from '@assets/images/discount_arrow.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';

const EXPECTED_CHECK_IN_START_MINUTES = 13 * 60;
const EXPECTED_CHECK_IN_END_MINUTES = 23 * 60 + 30;
const EXPECTED_CHECK_IN_ITEM_HEIGHT = 44;
const EXPECTED_CHECK_IN_OPTIONS = Array.from(
  {
    length:
      (EXPECTED_CHECK_IN_END_MINUTES - EXPECTED_CHECK_IN_START_MINUTES) / 30 +
      1,
  },
  (_, index) => {
    const totalMinutes = EXPECTED_CHECK_IN_START_MINUTES + index * 30;
    const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minute = String(totalMinutes % 60).padStart(2, '0');
    return `${hour}:${minute}`;
  },
);

const getInitialExpectedCheckInIndex = (...timeValues) => {
  const timeValue = timeValues.find(
    value => typeof value === 'string' && value,
  );
  const match = timeValue?.match(/(?:T|^)(\d{2}):(\d{2})/);
  if (!match) return 0;

  const totalMinutes = Number(match[1]) * 60 + Number(match[2]);
  const boundedMinutes = Math.min(
    EXPECTED_CHECK_IN_END_MINUTES,
    Math.max(EXPECTED_CHECK_IN_START_MINUTES, totalMinutes),
  );

  return Math.floor((boundedMinutes - EXPECTED_CHECK_IN_START_MINUTES) / 30);
};

// 번화번호 사이에 '-' 집어넣기
const formatPhoneNumber = phone => {
  if (!phone || phone.length !== 11) return phone; // 예외 처리
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const TERM_DOCUMENT_MAP = {
  terms: 'GUESTHOUSE_RESERVATION_POLICY',
  personalInfo: 'GUESTHOUSE_RESERVATION_PRIVACY_POLICY',
  thirdParty: 'GUESTHOUSE_PRIVACY_THIRD_PARTY',
};

const GuesthouseReservation = ({route}) => {
  const {t, i18n: translationI18n} = useTranslation();
  const isEnglish = (translationI18n.resolvedLanguage || translationI18n.language || '').startsWith('en');
  const {
    roomId,
    roomName,
    roomPrice,
    guesthouseName,
    guesthouseId,
    guesthouseAddress,
    guesthouseAddressDetail,
    guesthousePhone,
    checkIn,
    checkOut,
    checkInTime,
    checkOutTime,
    guestCount,
    totalPrice,
    roomSubtotal,
    multiNightDiscount,
    multiNightDiscountAmount,
    roomType,
    dormitoryGenderType,
    roomCapacity,
    roomMaxCapacity,
    extraPersonPrice,
    additionalGuestPrice,
    extraPersonCount,
    extraPersonTotalPrice,
    femaleOnly,
    selectedCoupon,
    refundPolicies,
    reservationPolicy,
  } = route.params || {};
  const [agreeAll, setAgreeAll] = useState(false);
  const navigation = useNavigation();
  const [agreements, setAgreements] = useState({
    terms: false,
    personalInfo: false,
    thirdParty: false,
  });
  const name = useUserStore(state => state.userProfile.name);
  const phone = useUserStore(state => state.userProfile.phone);
  const userOriginType = useUserStore(
    state => state.userProfile.userOriginType,
  );
  const isForeignUser = userOriginType === 'FOREIGN';
  const [requestMessage, setRequestMessage] = useState('');
  const [expectedCheckInTime, setExpectedCheckInTime] = useState(null);
  const [isExpectedCheckInOpen, setExpectedCheckInOpen] = useState(false);
  const [isActualGuestExpanded, setActualGuestExpanded] = useState(false);
  const [actualGuestName, setActualGuestName] = useState('');
  const [actualGuestPhone, setActualGuestPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [pointValue, setPointValue] = useState('');
  const [pointBalance, setPointBalance] = useState(0);
  const [coupons, setCoupons] = useState([]);

  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const [isSameDayNoticeVisible, setSameDayNoticeVisible] = useState(false);
  const [
    isRequestConfirmationNoticeVisible,
    setRequestConfirmationNoticeVisible,
  ] = useState(false);
  const [reservationErrorMessage, setReservationErrorMessage] = useState('');
  const {
    scrollRef,
    keyboardHeight,
    contentContainerStyle: keyboardAwareContentStyle,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 20,
    extraScrollOffset: 80,
    scrollDelay: 160,
    iosOnly: false,
  });
  const inputRefs = useRef({});
  const expectedCheckInListRef = useRef(null);
  const keyboardHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const isKeyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    keyboardHeightRef.current = keyboardHeight;
  }, [keyboardHeight]);

  const setInputRef = useCallback(
    key => node => {
      if (node) {
        inputRefs.current[key] = node;
      }
    },
    [],
  );

  const scrollInputAboveKeyboard = useCallback(
    key => {
      const inputRef = inputRefs.current[key];
      const keyboardOffset = keyboardHeightRef.current;

      if (!inputRef || !keyboardOffset) {
        return;
      }

      inputRef.measureInWindow((x, y, width, height) => {
        const keyboardTop = Dimensions.get('window').height - keyboardOffset;
        const fieldBottom = y + height;
        const bottomSpacing = 20;
        const overlap = fieldBottom + bottomSpacing - keyboardTop;

        if (overlap <= 0) {
          return;
        }

        scrollRef.current?.scrollTo?.({
          y: Math.max(0, scrollYRef.current + overlap),
          animated: true,
        });
      });
    },
    [scrollRef],
  );

  const focusInput = useCallback(
    key => {
      requestAnimationFrame(() => scrollInputAboveKeyboard(key));
      setTimeout(() => scrollInputAboveKeyboard(key), 320);
      setTimeout(() => scrollInputAboveKeyboard(key), 520);
    },
    [scrollInputAboveKeyboard],
  );

  const formatTime = timeStr => {
    if (!timeStr) return t('common.noTime');
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = dateStr => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('ddd')})`;
  };
  const formatDateTime = (dateStr, timeStr) => {
    const dateLabel = formatDateWithDay(dateStr);
    const timeLabel = formatTime(timeStr || dateStr);
    return `${dateLabel} ${timeLabel}`;
  };
  const nights = Math.max(
    1,
    dayjs(checkOut).startOf('day').diff(dayjs(checkIn).startOf('day'), 'day'),
  );
  const hasMultiNightDiscount =
    multiNightDiscount?.enabled === true &&
    nights >= 2 &&
    Number(multiNightDiscountAmount) > 0;
  const roomTypeMap = {
    MIXED: t('common.mixedDormitory'),
    FEMALE_ONLY: t('common.womenOnly'),
    MALE_ONLY: t('common.menOnly'),
  };
  const isDormitory = roomType === 'DORMITORY';
  const genderText = roomTypeMap[dormitoryGenderType] || '';
  const baseCapacity = Number(roomCapacity || 1);
  const calculatedExtraGuestCount = isDormitory
    ? 0
    : Math.max(Number(guestCount || 1) - baseCapacity, 0);
  const displayExtraGuestCount =
    Number(extraPersonCount) > 0
      ? Number(extraPersonCount)
      : calculatedExtraGuestCount;
  const extraGuestUnitPrice = Number(
    extraPersonPrice ?? additionalGuestPrice ?? 0,
  );
  const displayExtraGuestTotalPrice =
    Number(extraPersonTotalPrice) > 0
      ? Number(extraPersonTotalPrice || 0)
      : extraGuestUnitPrice * displayExtraGuestCount * nights;
  const shouldShowExtraGuestPrice = !isDormitory && displayExtraGuestCount > 0;
  const originalRoomSubtotal = Number(
    roomSubtotal ??
      Math.max(
        Number(totalPrice || 0) -
          (shouldShowExtraGuestPrice ? displayExtraGuestTotalPrice : 0),
        0,
      ) + Number(multiNightDiscountAmount || 0),
  );
  const numericPointValue = Number(pointValue || 0);
  const isPointOverBalance = numericPointValue > Number(pointBalance || 0);
  const usableCouponCount = getUsableCouponCount(coupons, totalPrice);
  const couponDiscountAmount = Number(selectedCoupon?.discountAmount || 0);
  const priceAfterCoupon = Math.max(
    Number(totalPrice || 0) - couponDiscountAmount,
    0,
  );
  const appliedPointAmount = Math.min(
    numericPointValue,
    Number(pointBalance || 0),
    priceAfterCoupon,
  );
  const finalPaymentAmount = Math.max(priceAfterCoupon - appliedPointAmount, 0);
  const totalDiscountAmount = couponDiscountAmount + appliedPointAmount;
  const isSameDayReservation = dayjs(checkIn).isSame(dayjs(), 'day');
  const isSameDayInstantReservation =
    reservationPolicy?.mode === 'INSTANT_CONFIRMATION' && isSameDayReservation;
  const isRequestConfirmationReservation =
    reservationPolicy?.mode === 'REQUEST_CONFIRMATION';
  const requestConfirmationNoticeTitle = isSameDayReservation
    ? t('guesthouse.beSureToCheckBeforeMakingASameDayReservation')
    : t('guesthouse.beSureToCheckBeforeMakingAReservation');

  const requestConfirmationNoticeMessage = isSameDayReservation
    ? t('guesthouse.accommodationWillBeConfirmedAfterTheOwnerSApprovalDon')
    : t('guesthouse.thisAccommodationIsConfirmedAfterApprovalByTheOwnerIf');

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
  }, [agreeAll, agreements]);

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

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const selectedAgreementDoc =
    selectedTerm && TERM_DOCUMENT_MAP[selectedTerm]
      ? AGREEMENT_CONTENT.USER?.[TERM_DOCUMENT_MAP[selectedTerm]]
      : null;
  const selectedAgreementContent = (selectedAgreementDoc?.detail || '').replace(
    /{{guesthouseName}}/g,
    guesthouseName || t('common.theGuesthouse'),
  );
  const selectedAgreementBaseHtml =
    selectedTerm === 'terms'
      ? applyRefundPoliciesToAgreementHtml(
          selectedAgreementDoc?.detailHtml || '',
          refundPolicies,
        )
      : selectedAgreementDoc?.detailHtml || '';
  const selectedAgreementHtml = selectedAgreementBaseHtml.replace(
    /{{guesthouseName}}/g,
    guesthouseName || t('common.theGuesthouse'),
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

  const handlePressPayment = () => {
    if (isRequestConfirmationReservation) {
      setRequestConfirmationNoticeVisible(true);
      return;
    }

    if (isSameDayInstantReservation) {
      setSameDayNoticeVisible(true);
      return;
    }

    setConfirmVisible(true);
  };

  const toggleExpectedCheckIn = () => {
    const shouldOpen = !isExpectedCheckInOpen;
    setExpectedCheckInOpen(shouldOpen);

    if (shouldOpen) {
      const initialIndex = getInitialExpectedCheckInIndex(checkInTime, checkIn);
      requestAnimationFrame(() => {
        expectedCheckInListRef.current?.scrollTo?.({
          y: initialIndex * EXPECTED_CHECK_IN_ITEM_HEIGHT,
          animated: false,
        });
      });
    }
  };

  // 예약 호출
  const handleReservation = async () => {
    if (!isAllRequiredAgreed) return;

    let paymentWindowRef = null;

    try {
      const trimmedActualGuestName = actualGuestName.trim();
      const trimmedActualGuestPhone = actualGuestPhone.trim();
      const hasActualGuestInfo =
        trimmedActualGuestName.length > 0 || trimmedActualGuestPhone.length > 0;

      if (
        isActualGuestExpanded &&
        hasActualGuestInfo &&
        (!trimmedActualGuestName || !trimmedActualGuestPhone)
      ) {
        Alert.alert(
          t('guesthouse.checkVisitorInformation'),
          t('guesthouse.pleaseEnterAllActualVisitorNamesAndContactInformation'),
        );
        return;
      }

      const trimmedEmergencyContactName = emergencyContactName.trim();
      const trimmedEmergencyContactPhone = emergencyContactPhone.trim();
      if (
        isForeignUser &&
        (!trimmedEmergencyContactName || !trimmedEmergencyContactPhone)
      ) {
        Alert.alert(
          t('guesthouse.checkEmergencyContactInformation'),
          t('guesthouse.pleaseEnterAllEmergencyContactNamesAndPhoneNumbers'),
        );
        return;
      }

      const body = {
        checkIn,
        checkOut,
        guestCount,
        amount: totalPrice,
        request: requestMessage,
        isActualGuestDifferent: isActualGuestExpanded && hasActualGuestInfo,
      };

      if (expectedCheckInTime) {
        body.expectedCheckInTime = expectedCheckInTime;
      }

      if (body.isActualGuestDifferent) {
        body.actualGuestName = trimmedActualGuestName;
        body.actualGuestPhone = trimmedActualGuestPhone;
      }

      if (trimmedEmergencyContactName || trimmedEmergencyContactPhone) {
        body.emergencyContactName = trimmedEmergencyContactName;
        body.emergencyContactPhone = trimmedEmergencyContactPhone;
      }

      const preparedPaymentWindow =
        Platform.OS === 'web'
          ? prepareWebPaymentWindow()
          : {name: null, windowRef: null};
      paymentWindowRef = preparedPaymentWindow.windowRef;

      const res = await reservationPaymentApi.createRoomReservation(
        roomId,
        body,
      );

      const reservationId = res?.data;

      // 결제
      navigation.navigate('GuesthousePayment', {
        reservationId,
        amount: finalPaymentAmount,
        userCouponId:
          selectedCoupon?.userCouponId ||
          selectedCoupon?.couponId ||
          selectedCoupon?.id,
        pointUsed: appliedPointAmount,
        paymentWindowName: preparedPaymentWindow.name,
        receiptContext: {
          guesthouseName,
          guesthouseId,
          guesthouseAddress,
          guesthouseAddressDetail,
          guesthousePhone,
          checkIn,
          checkOut,
          checkInTime,
          checkOutTime,
          roomName,
          roomType,
          dormitoryGenderType,
          roomCapacity,
          roomMaxCapacity,
          femaleOnly,
          guestCount,
          roomPrice,
          totalPrice,
          selectedCoupon,
          refundPolicies,
          reservationPolicy,
          expectedCheckInTime,
          request: requestMessage,
          pointUsed: appliedPointAmount,
          finalPaymentAmount,
          userName: name,
          userPhone: formatPhoneNumber(phone),
        },
      });
    } catch (err) {
      paymentWindowRef?.close();
      setReservationErrorMessage(
        err?.response?.data?.message ||
          t('guesthouse.thereWasAProblemProcessingYourReservation'),
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header title={t('common.reservation')} />
      <ScrollView
        ref={scrollRef}
        onScroll={e => {
          scrollYRef.current = e?.nativeEvent?.contentOffset?.y ?? 0;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardAwareContentStyle,
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <Text style={[FONTS.fs_20_semibold, styles.title]}>
          {guesthouseName}
        </Text>
        {/* 방 정보 */}
        <Text style={[FONTS.fs_16_regular, styles.roomName]}>{roomName}</Text>
        {isDormitory ? (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text style={[FONTS.fs_16_regular, {color: COLORS.grayscale_500}]}>
              [{roomCapacity}
              {t('common.inDormitory')}
            </Text>
            {dormitoryGenderType !== 'MIXED' && !!genderText && (
              <Text
                style={[FONTS.fs_16_regular, {color: COLORS.grayscale_500}]}>
                {genderText}
              </Text>
            )}
          </View>
        ) : (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Text style={[FONTS.fs_14_medium, styles.roomType]}>
              {roomCapacity}
              {t('common.basedOnPhosphorusMaximum')}
              {roomMaxCapacity}
              {t('common.phosphorus')}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.roomType]}>
              {femaleOnly ? t('common.womenOnly_40edf9') : ''}
            </Text>
          </View>
        )}
        {/* 날짜 */}
        <View style={styles.dateBoxContainer}>
          <View style={styles.dateBoxCheckIn}>
            <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>
              {t('common.checkIn')}
            </Text>
            <Text style={[FONTS.fs_16_regular, styles.dateText]}>
              {formatDateWithDay(checkIn)}
            </Text>
            <Text style={[FONTS.fs_16_regular, styles.dateText]}>
              {formatTime(checkIn)}
            </Text>
          </View>
          <View style={styles.nightsBox}>
            <Text style={[FONTS.fs_14_regular]}>
              {t('units.night', {count: nights})}
            </Text>
          </View>
          <View style={styles.dateBoxCheckOut}>
            <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>
              {t('common.checkOut')}
            </Text>
            <Text style={[FONTS.fs_16_regular, styles.dateText]}>
              {formatDateWithDay(checkOut)}
            </Text>
            <Text style={[FONTS.fs_16_regular, styles.dateText]}>
              {formatTime(checkOut)}
            </Text>
          </View>
        </View>

        <View style={styles.devide} />

        {/* 예약자 정보 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
            {t('common.reservationInformation_206122')}
          </Text>
          <View style={styles.userInfo}>
            <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
              {t('common.name')}
            </Text>
            <Text style={FONTS.fs_14_medium}>{name}</Text>
          </View>

          {isForeignUser && (
            <View style={styles.actualGuestForm}>
              <Text style={[FONTS.fs_14_medium, styles.actualGuestGuide]}>
                {t('guesthouse.pleaseEnterEmergencyContactInformationRequired')}
              </Text>
              <View style={styles.actualGuestInputRow}>
                <Text style={[FONTS.fs_14_medium, styles.actualGuestLabel]}>
                  {t('common.name')}
                </Text>
                <TextInput
                  ref={setInputRef('emergencyContactName')}
                  style={styles.actualGuestInput}
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  onFocus={() => focusInput('emergencyContactName')}
                  placeholder={t('guesthouse.emergencyContactName')}
                  placeholderTextColor={COLORS.grayscale_400}
                  maxLength={30}
                />
              </View>
              <View style={styles.actualGuestInputRow}>
                <Text style={[FONTS.fs_14_medium, styles.actualGuestLabel]}>
                  {t('common.phoneNumber')}
                </Text>
                <TextInput
                  ref={setInputRef('emergencyContactPhone')}
                  style={styles.actualGuestInput}
                  value={emergencyContactPhone}
                  onChangeText={setEmergencyContactPhone}
                  onFocus={() => focusInput('emergencyContactPhone')}
                  placeholder={t('guesthouse.includeCountryCodeEG14155551234')}
                  placeholderTextColor={COLORS.grayscale_400}
                  keyboardType="phone-pad"
                  maxLength={20}
                />
              </View>
            </View>
          )}
          {!isForeignUser && (
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                {t('common.phoneNumber')}
              </Text>
              <Text style={FONTS.fs_14_medium}>{formatPhoneNumber(phone)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.actualGuestToggle}
            activeOpacity={1}
            onPress={() => setActualGuestExpanded(prev => !prev)}>
            <Text style={[FONTS.fs_14_medium, styles.actualGuestToggleText]}>
              {isActualGuestExpanded
                ? t('guesthouse.collapseVisitorInformation')
                : t(
                    'guesthouse.ifTheActualVisitorIsDifferentPleaseAddInformation',
                  )}
            </Text>
            {isActualGuestExpanded ? (
              <ChevronUp width={18} height={18} />
            ) : (
              <ChevronDown width={18} height={18} />
            )}
          </TouchableOpacity>

          {isActualGuestExpanded ? (
            <View style={styles.actualGuestForm}>
              <Text style={[FONTS.fs_14_regular, styles.actualGuestGuide]}>
                {t(
                  'guesthouse.pleaseEnterTheInformationOfThePersonWhoWillActually',
                )}
              </Text>
              <View ref={setInputRef('actualGuestName')}>
                <View style={styles.actualGuestInputRow}>
                  <Text style={[FONTS.fs_14_semibold, styles.actualGuestLabel]}>
                    {t('common.name')}
                  </Text>
                  <TextInput
                    style={[FONTS.fs_14_regular, styles.actualGuestInput]}
                    placeholder={t('guesthouse.pleaseEnterYourName')}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={actualGuestName}
                    onChangeText={setActualGuestName}
                    onFocus={() => focusInput('actualGuestName')}
                  />
                </View>
              </View>
              <View ref={setInputRef('actualGuestPhone')}>
                <View style={styles.actualGuestInputRow}>
                  <Text style={[FONTS.fs_14_semibold, styles.actualGuestLabel]}>
                    {t('common.contactInformation')}
                  </Text>
                  <TextInput
                    style={[FONTS.fs_14_regular, styles.actualGuestInput]}
                    placeholder={t(
                      'guesthouse.pleaseEnterYourContactInformation',
                    )}
                    placeholderTextColor={COLORS.grayscale_400}
                    value={actualGuestPhone}
                    onChangeText={setActualGuestPhone}
                    keyboardType="phone-pad"
                    onFocus={() => focusInput('actualGuestPhone')}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.devide} />

        {/* 예상 체크인 시간 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
            {t('common.expectedCheckInTime')}
          </Text>
          <TouchableOpacity
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel={t('guesthouse.selectExpectedCheckInTime')}
            accessibilityState={{expanded: isExpectedCheckInOpen}}
            style={[
              styles.expectedCheckInSelector,
              isExpectedCheckInOpen && styles.expectedCheckInSelectorOpen,
            ]}
            onPress={toggleExpectedCheckIn}>
            <Text
              style={[
                FONTS.fs_14_medium,
                expectedCheckInTime
                  ? styles.expectedCheckInSelectedText
                  : styles.expectedCheckInPlaceholder,
              ]}>
              {expectedCheckInTime ||
                t('guesthouse.pleaseSelectYourExpectedCheckInTime')}
            </Text>
            {isExpectedCheckInOpen ? (
              <ChevronUp width={18} height={18} />
            ) : (
              <ChevronDown width={18} height={18} />
            )}
          </TouchableOpacity>

          {isExpectedCheckInOpen ? (
            <View style={styles.expectedCheckInDropdown}>
              <ScrollView
                ref={expectedCheckInListRef}
                nestedScrollEnabled
                showsVerticalScrollIndicator>
                {EXPECTED_CHECK_IN_OPTIONS.map(option => (
                  <TouchableOpacity
                    activeOpacity={1}
                    accessibilityRole="button"
                    key={option}
                    style={styles.expectedCheckInOption}
                    onPress={() => {
                      setExpectedCheckInTime(option);
                      setExpectedCheckInOpen(false);
                    }}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.expectedCheckInOptionText,
                        expectedCheckInTime === option &&
                          styles.expectedCheckInOptionTextSelected,
                      ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.devide} />

        {/* 결제 정보 */}
        <View style={styles.section}>
          <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
            {t('guesthouse.discountAndPaymentInformation')}
          </Text>
          <View style={styles.userInfo}>
            <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
              {hasMultiNightDiscount
                ? t('guesthouse.roomPriceValueValueNights', {
                    value1: isDormitory
                      ? t('guesthouse.valueBeds', {
                          guestCount: guestCount,
                          count: guestCount,
                        })
                      : t('guesthouse.1Room'),
                    nights: nights,
                  })
                : t('guesthouse.roomPriceValue', {
                    value1: isDormitory
                      ? t('common.perBed')
                      : t('common.perRoom'),
                  })}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.roomPriceText]}>
              {(hasMultiNightDiscount
                ? originalRoomSubtotal
                : roomPrice
              )?.toLocaleString()}
              {t('common.won')}
            </Text>
          </View>
          {hasMultiNightDiscount && (
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                {t('guesthouse.consecutiveNightDiscount')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.multiNightDiscountText]}>
                - {Number(multiNightDiscountAmount).toLocaleString()}
                {t('common.won')}
              </Text>
            </View>
          )}
          {shouldShowExtraGuestPrice ? (
            <View style={styles.userInfo}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                {t('common.additionalPeople')}
                {displayExtraGuestCount}
                {t('common.peopleUnit')}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.roomPriceText]}>
                {displayExtraGuestTotalPrice.toLocaleString()}
                {t('common.won')}
              </Text>
            </View>
          ) : null}
          <View style={styles.userInfo}>
            <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
              {hasMultiNightDiscount
                ? t('common.totalPrice')
                : t(
                    isDormitory
                      ? 'reservation.totalBedPrice'
                      : 'reservation.totalRoomPrice',
                    {
                      context:
                        isDormitory && guestCount !== 1
                          ? 'multipleBeds'
                          : undefined,
                      beds: guestCount,
                      count: nights,
                    },
                  )}
            </Text>
            <Text style={FONTS.fs_14_medium}>
              {totalPrice?.toLocaleString()}
              {t('common.won')}
            </Text>
          </View>
          <View style={[styles.devide, {marginVertical: 8}]} />
          {/* 쿠폰 */}
          <View style={styles.userInfo}>
            <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
              {t('common.couponDiscount')}
            </Text>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.couponBtn}
              onPress={() =>
                navigation.navigate('CouponSelect', {
                  totalPrice,
                  selectedCouponId:
                    selectedCoupon?.userCouponId ||
                    selectedCoupon?.couponId ||
                    selectedCoupon?.id ||
                    null,
                  targetScreen: 'GuesthouseReservation',
                  title: t('common.couponDiscount'),
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
                  {t('guesthouse.availableCouponCount', {
                    count: usableCouponCount,
                  })}
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
                style={[FONTS.fs_14_medium, styles.selectedCouponAmountText]}>
                {selectedCoupon.discountLabel}
              </Text>
            </View>
          ) : (
            <View style={styles.couponBanner}>
              <Text style={[FONTS.fs_14_semibold]}>
                {t('guesthouse.applyTheCoupon')}{' '}
                <Text style={styles.couponBannerText}>
                  {t('guesthouse.maximumDiscount')}
                </Text>{' '}
                {t('guesthouse.getIt')}
              </Text>
            </View>
          )}
          {/* 포인트 */}
          <View ref={setInputRef('point')}>
            <View style={[styles.userInfo, {marginTop: 4}]}>
              <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                {t('common.point')}
              </Text>
              <View style={styles.pointSection}>
                <TextInput
                  style={[FONTS.fs_14_medium, styles.pointInput]}
                  value={pointValue}
                  onChangeText={handleChangePointValue}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.grayscale_400}
                  onFocus={() => focusInput('point')}
                />

                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.pointBtn}
                  onPress={() => setPointValue(String(pointBalance || 0))}>
                  <Text style={FONTS.fs_14_regular}>
                    {t('guesthouse.fullUse')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={[FONTS.fs_12_medium, styles.pointText]}>
            {t('reservation.pointBalance', {
              points: formatNumber(pointBalance),
            })}
          </Text>
          {isPointOverBalance ? (
            <Text style={[FONTS.fs_12_medium, styles.pointWarningText]}>
              {t('guesthouse.youCannotEnterMorePointsThanYouHave')}
            </Text>
          ) : null}

          {/* 총 결제 금액 */}
          <View style={[styles.userInfo, {marginTop: 12}]}>
            <Text style={[FONTS.fs_16_semibold, styles.userInfoTitle]}>
              {t('common.totalPaymentAmount')}
            </Text>
            <Text style={[FONTS.fs_18_semibold, styles.roomPriceText]}>
              {finalPaymentAmount.toLocaleString()}
              {t('common.won')}
            </Text>
          </View>
        </View>

        <View style={styles.devide} />

        {/* 요청사항 */}
        <View style={styles.section} ref={setInputRef('request')}>
          <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
            {t('common.requestOptional')}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[FONTS.fs_14_regular, styles.requestInput]}
              placeholder={t('common.pleaseConveyYourRequestToTheHost')}
              placeholderTextColor={COLORS.grayscale_400}
              value={requestMessage}
              onChangeText={setRequestMessage}
              onFocus={() => focusInput('request')}
            />
          </View>
        </View>

        <View style={styles.devide} />

        {/* 약관 동의 */}
        <View style={styles.agreeRowContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={toggleAll}
            style={styles.agreeRowTitle}>
            {agreeAll ? (
              <View style={styles.checkedBox}>
                <Checked width={24} height={24} />
              </View>
            ) : (
              <View style={styles.uncheckedBox}>
                <Unchecked width={24} height={24} />
              </View>
            )}
            <Text style={FONTS.fs_14_semibold}>
              {t('guesthouse.totallyAgree')}
            </Text>
          </TouchableOpacity>

          <View style={styles.agreeRowConent}>
            <View style={[styles.agreeRow, isEnglish && {alignItems: 'flex-start'}]}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => toggleAgreement('terms')}>
                {agreements.terms ? (
                  <View style={styles.checkedBox}>
                    <Checked width={24} height={24} />
                  </View>
                ) : (
                  <View style={styles.uncheckedBox}>
                    <Unchecked width={24} height={24} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[FONTS.fs_14_regular, styles.agreeText, isEnglish && {flex: 1, minWidth: 0, lineHeight: 20}]}>
                <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                  {t('common.required')}
                </Text>
                {t(
                  'guesthouse.iAgreeToTheAccommodationCancellationRefundPolicy',
                )}
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.seeMore, isEnglish && {position: 'relative', flexShrink: 0, alignSelf: 'flex-start', paddingVertical: 2}]}
                onPress={() => openTermModal('terms')}>
                <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                  {t('common.view')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.agreeRow, isEnglish && {alignItems: 'flex-start'}]}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => toggleAgreement('personalInfo')}
                style={[styles.agreeRow, isEnglish && {alignItems: 'flex-start'}]}>
                {agreements.personalInfo ? (
                  <View style={styles.checkedBox}>
                    <Checked width={24} height={24} />
                  </View>
                ) : (
                  <View style={styles.uncheckedBox}>
                    <Unchecked width={24} height={24} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[FONTS.fs_14_regular, styles.agreeText, isEnglish && {flex: 1, minWidth: 0, lineHeight: 20}]}>
                <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                  {t('common.required')}
                </Text>
                {t('common.iAgreeToTheCollectionAndUseOfPersonalInformation')}
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.seeMore, isEnglish && {position: 'relative', flexShrink: 0, alignSelf: 'flex-start', paddingVertical: 2}]}
                onPress={() => openTermModal('personalInfo')}>
                <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                  {t('common.view')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.agreeRow, isEnglish && {alignItems: 'flex-start'}]}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => toggleAgreement('thirdParty')}
                style={[styles.agreeRow, isEnglish && {alignItems: 'flex-start'}]}>
                {agreements.thirdParty ? (
                  <View style={styles.checkedBox}>
                    <Checked width={24} height={24} />
                  </View>
                ) : (
                  <View style={styles.uncheckedBox}>
                    <Unchecked width={24} height={24} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[FONTS.fs_14_regular, styles.agreeText, isEnglish && {flex: 1, minWidth: 0, lineHeight: 20}]}>
                <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>
                  {t('common.required')}
                </Text>
                {t(
                  'guesthouse.iAgreeToTheProvisionOfPersonalInformationToThird',
                )}
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.seeMore, isEnglish && {position: 'relative', flexShrink: 0, alignSelf: 'flex-start', paddingVertical: 2}]}
                onPress={() => openTermModal('thirdParty')}>
                <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                  {t('common.view')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {!isKeyboardVisible ? (
        <View style={styles.button}>
          {totalDiscountAmount > 0 ? (
            <View style={styles.discountBanner}>
              <DiscountArrow width={18} height={18} />
              <Text style={[FONTS.fs_14_semibold]}>
                <Text style={styles.discountBannerText}>
                  {t('guesthouse.totalDiscountApplied', {
                    amount: totalDiscountAmount.toLocaleString(),
                  })}
                </Text>
              </Text>
            </View>
          ) : null}
          <ButtonScarlet
            title={t('guesthouse.payValueWon', {
              value1: finalPaymentAmount.toLocaleString(),
            })}
            onPress={handlePressPayment}
            disabled={!isAllRequiredAgreed || isPointOverBalance}
          />
        </View>
      ) : null}

      <AlertModal
        visible={isSameDayNoticeVisible}
        title={t('guesthouse.beSureToCheckBeforeMakingASameDayReservation')}
        message={t(
          'guesthouse.reservationsForTodayWillBeConfirmedImmediatelyAfterPaymentAnd',
        )}
        highlightText={t('guesthouse.impossible')}
        buttonText={t('common.confirm')}
        buttonText2={t('common.cancel')}
        onPress={() => {
          setSameDayNoticeVisible(false);
          setConfirmVisible(true);
        }}
        onPress2={() => setSameDayNoticeVisible(false)}
      />

      <AlertModal
        visible={isRequestConfirmationNoticeVisible}
        title={requestConfirmationNoticeTitle}
        message={requestConfirmationNoticeMessage}
        highlightText={t('guesthouse.100Refund')}
        buttonText={t('common.makeAReservation')}
        buttonText2={t('common.cancel')}
        onPress={() => {
          setRequestConfirmationNoticeVisible(false);
          setConfirmVisible(true);
        }}
        onPress2={() => setRequestConfirmationNoticeVisible(false)}
      />

      <AlertModal
        visible={!!reservationErrorMessage}
        title={t('guesthouse.reservationFailed')}
        message={reservationErrorMessage}
        buttonText={t('common.confirm')}
        onPress={() => setReservationErrorMessage('')}
        onRequestClose={() => setReservationErrorMessage('')}
      />

      {/* 약관동의 모달 */}
      <TermsModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={selectedAgreementDoc?.title || ''}
        content={selectedAgreementContent}
        contentHtml={selectedAgreementHtml}
        onAgree={handleAgreeModal}
      />

      {/* 예약 확인 모달 */}
      <ReservationConfirmModal
        visible={isConfirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          handleReservation();
        }}
        guesthouseName={guesthouseName}
        roomSummary={t('guesthouse.valueValueNights', {
          value1: isDormitory
            ? t('guesthouse.valueValueBed', {
                roomName: roomName,
                guestCount: guestCount,
              })
            : `${roomName}`,
          nights: nights,
        })}
        roomSubSummary={
          isDormitory
            ? t('guesthouse.valueDormitoryValue', {
                roomCapacity: roomCapacity,
                value2:
                  genderText && dormitoryGenderType !== 'MIXED'
                    ? `, ${genderText}`
                    : '',
              })
            : t('guesthouse.basedOnValueUpToValueValue', {
                roomCapacity: roomCapacity,
                roomMaxCapacity: roomMaxCapacity,
                value3: femaleOnly ? t('common.womenOnly_40edf9') : '',
              })
        }
        checkInLabel={formatDateTime(checkIn, checkInTime)}
        checkOutLabel={formatDateTime(checkOut, checkOutTime)}
      />
    </View>
  );
};

export default GuesthouseReservation;
