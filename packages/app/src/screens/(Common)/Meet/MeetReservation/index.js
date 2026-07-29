import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import Header from '@components/Header';
import styles from './MeetReservation.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import TermsModal from '@components/modals/TermsModal';
import PartyApplicationAppPromptModal from '@components/modals/PartyApplicationAppPromptModal';
import userMeetApi from '@utils/api/userMeetApi';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import { AGREEMENT_CONTENT } from '@data/agreeContents';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';
import AppImage from '@components/AppImage';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_white.svg';
import WarningAlarm from '@assets/images/notice_bubble_orange.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import { COLORS } from '@constants/colors';

const TERM_DOCUMENT_MAP = {
  personalInfo: 'GUESTHOUSE_RESERVATION_PRIVACY_POLICY',
};

const formatPhoneNumber = phone => {
  if (!phone || phone.length !== 11) {
    return phone;
  }
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const isDateOptionClosed = option =>
  option?.isClosed === true ||
  option?.isApplyOpen === false ||
  (option?.partyStatus && option.partyStatus !== 'RECRUIT');

const MeetReservation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    partyId,
    partyTitle: routePartyTitle,
    partyStartDateTime: routePartyStartDateTime,
    partyStartTime: routePartyStartTime,
    partyEndTime: routePartyEndTime,
    applicationType: routeApplicationType,
    partyDateOptions: routePartyDateOptions,
    amount: routeAmount,
    thumbnailUrl: routeThumbnailUrl,
    partyAnnouncements,
    selectedCoupon,
  } = route.params ?? {};
  const announcementItems = Array.isArray(partyAnnouncements)
    ? partyAnnouncements
      .map(item =>
        typeof item === 'string' ? item : item?.announcement,
      )
      .filter(Boolean)
    : [];
  const hasAnnouncementGuide = announcementItems.length > 0;
  const [step, setStep] = useState(
    selectedCoupon || !hasAnnouncementGuide ? 2 : 1,
  );
  const [guideAgreed, setGuideAgreed] = useState(false);
  const [reservationInfo, setReservationInfo] = useState(null);
  const [appPromptVisible, setAppPromptVisible] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedCoupon) {
      setStep(2);
    }
  }, [selectedCoupon]);

  // 예약 정보
  useEffect(() => {
    if (!partyId) {return;}
    const run = async () => {
      try {
        const { data } = await userMeetApi.joinParty(partyId);
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
          text1: '콘텐츠 참가 정보를 불러오지 못했어요.',
          position: 'top',
        });
        navigation.goBack();
      }
    };
    run();
  }, [partyId, navigation]);

  const normalizeDateOptions = useCallback(source => {
    const candidates = [
      source?.applicationStatuses,
      source?.partySchedules,
      source?.schedules,
      source?.availableSchedules,
      source?.availableParties,
      source?.partyDates,
      source?.partyDateTimes,
    ].find(Array.isArray);
    const list = candidates?.length
      ? candidates
      : Array.isArray(routePartyDateOptions) && routePartyDateOptions.length
        ? routePartyDateOptions
        : [source].filter(Boolean);

    return list
      .map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: `${item}-${index}`,
            partyId,
            partyStartDateTime: item,
            partyStartTime: item,
            partyEndTime: routePartyEndTime,
            partyEndDateTime: routePartyEndTime,
            isApplyOpen: true,
            isClosed: false,
          };
        }

        return {
          id: item?.partyId ?? item?.id ?? `${item?.partyStartDateTime ?? index}`,
          partyId: item?.partyId ?? item?.id ?? partyId,
          partyStartDateTime:
            item?.partyStartDateTime ??
            item?.startDateTime ??
            item?.dateTime ??
            item?.date ??
            source?.partyStartDateTime ??
            routePartyStartDateTime,
          partyStartTime:
            item?.partyStartTime ??
            item?.startTime ??
            item?.partyStartDateTime ??
            source?.partyStartTime ??
            source?.partyStartDateTime ??
            routePartyStartTime ??
            routePartyStartDateTime,
          partyEndTime:
            item?.partyEndTime ??
            item?.endTime ??
            item?.partyEndDateTime ??
            source?.partyEndTime ??
            source?.partyEndDateTime ??
            routePartyEndTime,
          partyEndDateTime:
            item?.partyEndDateTime ??
            item?.endDateTime ??
            item?.partyEndTime ??
            source?.partyEndDateTime ??
            source?.partyEndTime ??
            routePartyEndTime,
          partyStatus: item?.partyStatus ?? item?.status,
          isApplyOpen: item?.isApplyOpen ?? source?.isApplyOpen ?? true,
          isClosed: item?.isClosed ?? false,
        };
      })
      .filter(item => !!item.partyStartDateTime);
  }, [
    partyId,
    routePartyDateOptions,
    routePartyEndTime,
    routePartyStartDateTime,
    routePartyStartTime,
  ]);

  const dateOptions = useMemo(
    () => normalizeDateOptions(reservationInfo),
    [normalizeDateOptions, reservationInfo],
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const selectedDateOption = dateOptions[selectedDateIndex] ?? dateOptions[0];
  const applicationType =
    reservationInfo?.applicationType ?? routeApplicationType ?? 'SAME_DAY';
  const shouldShowDateSelector =
    applicationType !== 'SAME_DAY' && dateOptions.length > 0;
  const title = reservationInfo?.partyTitle ?? routePartyTitle ?? '';
  const checkInDate =
    selectedDateOption?.partyStartDateTime ??
    reservationInfo?.partyStartDateTime ??
    routePartyStartDateTime ??
    null;
  const checkInTime =
    selectedDateOption?.partyStartTime ??
    selectedDateOption?.partyStartDateTime ??
    reservationInfo?.partyStartDateTime ??
    routePartyStartTime ??
    routePartyStartDateTime ??
    null;
  const checkOutTime =
    selectedDateOption?.partyEndDateTime ??
    selectedDateOption?.partyEndTime ??
    reservationInfo?.partyEndDateTime ??
    routePartyEndTime ??
    null;
  const name = reservationInfo?.name;
  const phone = reservationInfo?.phoneNumber;
  const reservationAmount = Number(
    reservationInfo?.amount ?? routeAmount ?? 0,
  );
  const isPaidContent =
    reservationInfo?.chargeType !== 'FREE' &&
    Number.isFinite(reservationAmount) &&
    reservationAmount > 0;
  const genderLabel =
    ['F', 'FEMALE'].includes(reservationInfo?.gender)
      ? '여성'
      : ['M', 'MALE'].includes(reservationInfo?.gender)
        ? '남성'
        : null;
  const isReservationGuest =
    reservationInfo?.guest ?? reservationInfo?.isGuest ?? false;
  const attendeeTypeLabel = [
    isReservationGuest ? '숙박객' : '비숙박객',
    genderLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    if (selectedDateIndex >= dateOptions.length) {
      setSelectedDateIndex(0);
      return;
    }

    if (isDateOptionClosed(dateOptions[selectedDateIndex])) {
      const firstOpenIndex = dateOptions.findIndex(
        option => !isDateOptionClosed(option),
      );

      if (firstOpenIndex >= 0 && firstOpenIndex !== selectedDateIndex) {
        setSelectedDateIndex(firstOpenIndex);
      }
    }
  }, [dateOptions, selectedDateIndex]);
  const [requestMessage, setRequestMessage] = useState('');
  const {
    scrollRef,
    keyboardHeight,
    contentContainerStyle: keyboardAwareContentStyle,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 120,
    extraScrollOffset: 80,
    scrollDelay: 160,
    iosOnly: false,
  });
  const requestInputRef = useRef(null);
  const keyboardHeightRef = useRef(0);
  const scrollYRef = useRef(0);
  const isKeyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    keyboardHeightRef.current = keyboardHeight;
  }, [keyboardHeight]);

  const scrollRequestAboveKeyboard = useCallback(() => {
    const keyboardOffset = keyboardHeightRef.current;

    if (!requestInputRef.current || !keyboardOffset) {
      return;
    }

    requestInputRef.current.measureInWindow((x, y, width, height) => {
      const keyboardTop = Dimensions.get('window').height - keyboardOffset;
      const fieldBottom = y + height;
      const overlap = fieldBottom + 20 - keyboardTop;

      if (overlap <= 0) {
        return;
      }

      scrollRef.current?.scrollTo?.({
        y: Math.max(0, scrollYRef.current + overlap),
        animated: true,
      });
    });
  }, [scrollRef]);

  const handleFocusRequest = useCallback(() => {
    requestAnimationFrame(scrollRequestAboveKeyboard);
    setTimeout(scrollRequestAboveKeyboard, 320);
    setTimeout(scrollRequestAboveKeyboard, 520);
  }, [scrollRequestAboveKeyboard]);

  const formatTime = timeStr => {
    if (!timeStr) {return '시간 없음';}
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = dateStr => {
    if (!dateStr) {return '-';}
    const date = dayjs(dateStr);
    if (!date.isValid()) {return '-';}
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };
  const formatReservationOption = option => {
    const date = dayjs(option?.partyStartDateTime);
    const dateText = date.isValid() ? date.format('YYYY.MM.DD (dd)') : '-';
    return `${dateText} ${formatTime(option?.partyStartTime ?? option?.partyStartDateTime)}`;
  };

  const eventDateText = formatDateWithDay(checkInDate);
  const eventTimeText = `${formatTime(checkInTime)}~${formatTime(checkOutTime)}`;
  const eventDateTimeText =
    eventDateText === '-' ? eventTimeText : `${eventDateText} ${eventTimeText}`;
  const eventThumbnailSource = routeThumbnailUrl
    ? { uri: routeThumbnailUrl }
    : null;
  const [agreements, setAgreements] = useState({
    personalInfo: false,
  });

  // 유효성 검사
  const isAllRequiredAgreed = agreements.personalInfo;
  const canApplySelectedDate = !isDateOptionClosed(selectedDateOption);

  const toggleAgreement = key => {
    setAgreements(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const selectedAgreementDoc =
    selectedTerm && TERM_DOCUMENT_MAP[selectedTerm]
      ? AGREEMENT_CONTENT.USER?.[TERM_DOCUMENT_MAP[selectedTerm]]
      : null;

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

  // 예약 생성
  const handleCreateReservation = async () => {
    if (!partyId || !reservationInfo) {return;}

    if (Platform.OS === 'web') {
      setAppPromptVisible(true);
      return;
    }

    try {
      const requestText = requestMessage?.trim() || '';
      const amount = reservationAmount;
      const reservationPartyId = selectedDateOption?.partyId ?? partyId;
      const { data } = await reservationPaymentApi.createPartyReservation(
        reservationPartyId,
        {
          amount,
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

      if (amount === 0) {
        // 0원 결제인 경우 결제창(웹뷰) 및 requestPayment 호출을 거치지 않고 바로 성공 화면으로 이동
        navigation.replace('MeetPaymentSuccess', {
          reservationId,
          partyTitle: title,
          partyStartDateTime: checkInDate,
          partyStartTime: checkInTime,
          partyEndTime: checkOutTime,
          thumbnailUrl: routeThumbnailUrl,
        });
      } else {
        // 유료 결제인 경우 결제 웹뷰로 이동
        navigation.navigate('MeetPayment', {
          amount,
          reservationId,
          partyTitle: title,
          partyStartDateTime: checkInDate,
          partyStartTime: checkInTime,
          partyEndTime: checkOutTime,
          thumbnailUrl: routeThumbnailUrl,
          pointUsed: 0,
        });
      }
    } catch (e) {
      console.log('createPartyReservation error', e);
      const msg =
        e?.response?.data?.message || '예약 생성 중 오류가 발생했어요.';
      Toast.show({ type: 'error', text1: msg, position: 'top' });
    }
  };

  const handleBackPress = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      return;
    }
    navigation.goBack();
  };

  const handleToggleGuideAgreement = () => {
    setGuideAgreed(prev => !prev);
  };

  const handlePressGuideNext = () => {
    if (!guideAgreed) {
      return;
    }

    if (Platform.OS === 'web') {
      setAppPromptVisible(true);
      return;
    }

    setStep(2);
  };

  const handleSelectDate = index => {
    setSelectedDateIndex(index);
    setIsDateDropdownOpen(false);
  };

  const renderGuideStep = () => {
    const checked = guideAgreed;

    return (
      <View style={styles.guideContainer}>
        <Header title="신청" onPress={handleBackPress} />
        <View style={styles.guideProgressTrack}>
          <View
            style={[
              styles.guideProgressFill,
              { width: '50%' },
            ]}
          />
        </View>

        <View style={styles.guideContent}>
          <WarningAlarm width={36} height={36} />
          <Text style={[FONTS.fs_20_medium, styles.guideTitle]}>
            모두가 즐거운 시간이 될 수 있도록{'\n'}꼭 확인해 주세요!
          </Text>

          <ScrollView
            style={styles.guideRuleScroll}
            contentContainerStyle={styles.guideRuleList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled>
            {announcementItems.map((item, index) => (
              <View key={`${step}-${index}`} style={styles.guideRuleRow}>
                <View style={styles.guideRuleNumber}>
                  <Text style={[FONTS.fs_16_semibold, styles.guideRuleNumberText]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[FONTS.fs_18_medium, styles.guideRuleText]}>
                  {item}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.guideAgreeBox,
                checked && styles.guideAgreeBoxActive,
              ]}
              activeOpacity={1}
              onPress={handleToggleGuideAgreement}>
              {checked ? (
                <View style={styles.guideCheckedCircle}>
                  <Unchecked width={20} height={20} />
                </View>
              ) : (
                <View style={styles.guideUncheckedCircle}>
                  <Unchecked width={20} height={20} />
                </View>
              )}
              <Text
                style={[
                  FONTS.fs_16_medium,
                  styles.guideAgreeText,
                  checked && styles.guideAgreeTextActive,
                ]}>
                이용 규칙을 확인했어요!
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.guideBottomButtonWrap}>
          <ButtonScarlet
            title="다음"
            style={styles.guideNextButton}
            disabled={!checked}
            onPress={handlePressGuideNext}
          />
        </View>
      </View>
    );
  };

  if (step === 1 && hasAnnouncementGuide) {
    return renderGuideStep();
  }

  return (
    <View style={styles.container}>
        <Header title="예약" onPress={handleBackPress} />
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

          {/* 콘텐츠 정보 */}
          <View style={styles.eventInfoRow}>
            {eventThumbnailSource && (
              <AppImage
                source={eventThumbnailSource}
                style={styles.eventThumbnail}
                resizeMode="cover"
              />
            )}
            <View style={styles.eventTextRow}>
              <Text style={[FONTS.fs_18_medium]}>{title}</Text>
              <Text style={[FONTS.fs_14_medium]}>{eventDateTimeText}</Text>
            </View>
          </View>

          <View style={styles.devide} />

          {shouldShowDateSelector && (
            <>
              <View style={styles.section}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  참여 일정
                </Text>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.dateSelector,
                    isDateDropdownOpen && styles.dateSelectorOpen,
                  ]}
                  onPress={() => setIsDateDropdownOpen(prev => !prev)}>
                  <Text style={[FONTS.fs_14_medium, styles.dateSelectorText]}>
                    {formatReservationOption(selectedDateOption)}
                  </Text>
                  {isDateDropdownOpen ? (
                    <ChevronUp width={16} height={16} />
                  ) : (
                    <ChevronDown width={16} height={16} />
                  )}
                </TouchableOpacity>
                {isDateDropdownOpen && (
                  <View style={styles.dateDropdownList}>
                    {dateOptions.map((option, index) => {
                      const disabled = isDateOptionClosed(option);
                      const selected = index === selectedDateIndex;

                      return (
                        <TouchableOpacity
                          activeOpacity={1}
                          key={option.id}
                          style={[
                            styles.dateDropdownItem,
                            selected && styles.dateDropdownItemSelected,
                            disabled && styles.dateDropdownItemDisabled,
                          ]}
                          disabled={disabled}
                          onPress={() => handleSelectDate(index)}>
                          <Text
                            style={[
                              FONTS.fs_14_medium,
                              styles.dateDropdownText,
                              disabled && styles.dateDropdownTextDisabled,
                            ]}>
                            {formatReservationOption(option)}
                          </Text>
                          {disabled && (
                            <Text
                              style={[
                                FONTS.fs_12_medium,
                                styles.dateDropdownClosedText,
                              ]}>
                              마감
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.devide} />
            </>
          )}

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

          {/* 유료 콘텐츠 예약 정보 */}
          {isPaidContent && (
            <>
              <View style={styles.section}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  예약 정보
                </Text>
                <View style={styles.userInfo}>
                  <Text style={FONTS.fs_14_medium}>
                    {attendeeTypeLabel}
                  </Text>
                  <Text
                    style={[FONTS.fs_14_medium, styles.reservationPriceText]}>
                    {reservationAmount.toLocaleString('ko-KR')}원
                  </Text>
                </View>
              </View>

              <View style={styles.devide} />
            </>
          )}

          {/* 요청사항 */}
          <View style={styles.section} ref={requestInputRef}>
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
                onFocus={handleFocusRequest}
              />
            </View>
          </View>

          <View style={styles.devide} />

          {/* 약관 동의 */}
          <View style={styles.agreeRowContainer}>
            <View style={styles.agreeRowConent}>
              <View style={styles.agreeRow}>
                <TouchableOpacity
                  activeOpacity={1}
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
                  activeOpacity={1}
                  style={styles.seeMore}
                  onPress={() => openTermModal('personalInfo')}>
                  <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>
                    보기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </ScrollView>

        {!isKeyboardVisible ? (
          <View style={styles.fixedButton}>
            <ButtonScarlet
              title="신청하기"
              disabled={!isAllRequiredAgreed || !canApplySelectedDate}
              onPress={handleCreateReservation}
            />
          </View>
        ) : null}

        {/* 약관동의 모달 */}
        <TermsModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={selectedAgreementDoc?.title || ''}
          content={selectedAgreementDoc?.detail || ''}
          contentHtml={selectedAgreementDoc?.detailHtml || ''}
          onAgree={handleAgreeModal}
        />
        <PartyApplicationAppPromptModal
          visible={appPromptVisible}
          onClose={() => setAppPromptVisible(false)}
        />
    </View>
  );
};

export default MeetReservation;
