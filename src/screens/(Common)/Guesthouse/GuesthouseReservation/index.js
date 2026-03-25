import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import Header from '@components/Header';
import styles from './GuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import userMyApi from '@utils/api/userMyApi';
import { getUsableCouponCount } from '@utils/coupon/couponUtils';
import { AGREEMENT_CONTENT } from '@data/agreeContents';
import useUserStore from '@stores/userStore';
import TermsModal from '@components/modals/TermsModal';
import ReservationConfirmModal from '@components/modals/Guesthouse/ReservationConfirmModal';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import DiscountArrow from '@assets/images/discount_arrow.svg';

// 번화번호 사이에 '-' 집어넣기
const formatPhoneNumber = (phone) => {
  if (!phone || phone.length !== 11) return phone; // 예외 처리
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const TERM_DOCUMENT_MAP = {
  terms: 'GUESTHOUSE_RESERVATION_POLICY',
  personalInfo: 'GUESTHOUSE_RESERVATION_PRIVACY_POLICY',
  thirdParty: 'GUESTHOUSE_PRIVACY_THIRD_PARTY',
};

const GuesthouseReservation = ({ route }) => {
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
    roomType,
    dormitoryGenderType,
    roomCapacity,
    roomMaxCapacity,
    femaleOnly,
    selectedCoupon,
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
  const [requestMessage, setRequestMessage] = useState('');
  const [pointValue, setPointValue] = useState('');
  const [pointBalance, setPointBalance] = useState(0);
  const [coupons, setCoupons] = useState([]);

  const [isConfirmVisible, setConfirmVisible] = useState(false);

  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid()
        ? date.format('HH:mm')
        : timeStr.slice(0, 5);
  };
  const formatDateWithDay = (dateStr) => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };
  const formatDateTime = (dateStr, timeStr) => {
    const dateLabel = formatDateWithDay(dateStr);
    const timeLabel = formatTime(timeStr || dateStr);
    return `${dateLabel} ${timeLabel}`;
  };
  const nights = Math.max(0, dayjs(checkOut).diff(dayjs(checkIn), 'day'))+1;
  const roomTypeMap = {
    MIXED: '혼숙',
    FEMALE_ONLY: '여성전용',
    MALE_ONLY: '남성전용',
  };
  const isDormitory = roomType === 'DORMITORY';
  const genderText = roomTypeMap[dormitoryGenderType] || '';
  const numericPointValue = Number(pointValue || 0);
  const isPointOverBalance = numericPointValue > Number(pointBalance || 0);
  const usableCouponCount = getUsableCouponCount(coupons, totalPrice);
  const couponDiscountAmount = Number(selectedCoupon?.discountAmount || 0);
  const priceAfterCoupon = Math.max(Number(totalPrice || 0) - couponDiscountAmount, 0);
  const appliedPointAmount = Math.min(
    numericPointValue,
    Number(pointBalance || 0),
    priceAfterCoupon,
  );
  const finalPaymentAmount = Math.max(priceAfterCoupon - appliedPointAmount, 0);
  const totalDiscountAmount = couponDiscountAmount + appliedPointAmount;

  // 유효성 검사
  const isAllRequiredAgreed = agreements.terms && agreements.personalInfo && agreements.thirdParty;

  const toggleAgreement = (key) => {
    setAgreements((prev) => ({
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
    const allChecked = agreements.terms && agreements.personalInfo && agreements.thirdParty;
    if (allChecked !== agreeAll) {
      setAgreeAll(allChecked);
    }
  }, [agreements]);

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
    guesthouseName || '해당 게스트하우스',
  );
  const selectedAgreementHtml = (selectedAgreementDoc?.detailHtml || '').replace(
    /{{guesthouseName}}/g,
    guesthouseName || '해당 게스트하우스',
  );

  const openTermModal = (key) => {
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

  const handleChangePointValue = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (!numericText) {
      setPointValue('');
      return;
    }

    setPointValue(numericText);
  };

  // 예약 호출
  const handleReservation = async () => {
    if (!isAllRequiredAgreed) return;

    try {
      const body = {
        checkIn,
        checkOut,
        guestCount,
        amount: totalPrice,
        request: requestMessage,
      };

      const res = await reservationPaymentApi.createRoomReservation(roomId, body);

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
          pointUsed: appliedPointAmount,
          finalPaymentAmount,
          userName: name,
          userPhone: formatPhoneNumber(phone),
        },
      });

    } catch (err) {
      Alert.alert('예약 실패', err.response.data.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <View style={{flex: 1}}>
        <Header title="예약" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[FONTS.fs_20_semibold, styles.title]}>{guesthouseName}</Text>
          {/* 방 정보 */}
          <Text style={[FONTS.fs_16_regular, styles.roomName]}>{roomName}</Text>
          {isDormitory ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text
                style={[
                  FONTS.fs_16_regular,
                  {color: COLORS.grayscale_500},
                ]}>
                [{roomCapacity}인 도미토리]
              </Text>
              {dormitoryGenderType !== 'MIXED' && !!genderText && (
                <Text
                  style={[
                    FONTS.fs_16_regular,
                    {color: COLORS.grayscale_500},
                  ]}>
                  {genderText}
                </Text>
              )}
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                {roomCapacity}인 기준(최대 {roomMaxCapacity}인)
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.roomType]}>
                {femaleOnly ? ', 여성전용' : ''}
              </Text>
            </View>
          )}
          {/* 날짜 */}
          <View style={styles.dateBoxContainer}>
              <View style={styles.dateBoxCheckIn}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크인</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkIn)}</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkIn)}</Text>
              </View>
              <View style={styles.nightsBox}>
                <Text style={[FONTS.fs_14_regular]}>{nights}박</Text>
              </View>
              <View style={styles.dateBoxCheckOut}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크아웃</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkOut)}</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkOut)}</Text>
              </View>
          </View>

          <View style={styles.devide}/>

          {/* 예약자 정보 */}
          <View style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약자 정보</Text>
              <View style={styles.userInfo}>
                  <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>이름</Text>
                  <Text style={FONTS.fs_14_medium}>{name}</Text>
              </View>
              <View style={styles.userInfo}>
                  <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>전화번호</Text>
                  <Text style={FONTS.fs_14_medium}>{formatPhoneNumber(phone)}</Text>
              </View>
          </View>

          <View style={styles.devide}/>

          {/* 결제 정보 */}
          <View style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>할인 및 결제 정보</Text>
              <View style={styles.userInfo}>
                <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                  객실 가격 ({isDormitory ? '1베드 당' : '1객실 당'})
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.roomPriceText]}>
                  {roomPrice?.toLocaleString()}원
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                  {`총 가격 (${isDormitory ? `베드 ${guestCount}개 X ` : ''}${nights}박)`}
                </Text>
                <Text style={FONTS.fs_14_medium}>
                  {totalPrice?.toLocaleString()}원
                </Text>
              </View>
              <View style={[styles.devide,{marginVertical: 8}]}/>
              {/* 쿠폰 */}
              <View style={styles.userInfo}>
                <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>
                  쿠폰 할인
                </Text>
                <TouchableOpacity
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
                  <ChevronRight width={16} height={16}/>
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
              {/* 포인트 */}
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

              {/* 총 결제 금액 */}
              <View style={[styles.userInfo, {marginTop: 12}]}>
                <Text style={[FONTS.fs_16_semibold, styles.userInfoTitle]}>
                  총 결제 금액
                </Text>
                <Text style={[FONTS.fs_18_semibold, styles.roomPriceText]}>
                  {finalPaymentAmount.toLocaleString()}원
                </Text>
              </View>
          </View>

          <View style={styles.devide}/>

          {/* 요청사항 */}
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>요청 사항 (선택)</Text>
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

          <View style={styles.devide}/>

          {/* 약관 동의 */}
          <View style={styles.agreeRowContainer}>
              <TouchableOpacity onPress={toggleAll} style={styles.agreeRowTitle}>
              {agreeAll ?
              <View style={styles.checkedBox}> <Checked width={24} height={24} /> </View> :
              <View style={styles.uncheckedBox}> <Unchecked width={24} height={24} /> </View>}
                  <Text style={FONTS.fs_14_semibold}>전체 동의</Text>
              </TouchableOpacity>

              <View style={styles.agreeRowConent}>
                <View style={styles.agreeRow}>
                  <TouchableOpacity onPress={() => toggleAgreement('terms')}>
                  {agreements.terms ?
                    <View style={styles.checkedBox}> <Checked width={24} height={24} /> </View> :
                    <View style={styles.uncheckedBox}> <Unchecked width={24} height={24} /> </View>}
                  </TouchableOpacity>
                  <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                    <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>[필수]</Text> 숙소 취소/환불 규정에 동의합니다.
                  </Text>
                  <TouchableOpacity style={styles.seeMore} onPress={() => openTermModal('terms')}>
                    <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>보기</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.agreeRow}>
                  <TouchableOpacity onPress={() => toggleAgreement('personalInfo')} style={styles.agreeRow}>
                  {agreements.personalInfo ?
                    <View style={styles.checkedBox}> <Checked width={24} height={24} /> </View> :
                    <View style={styles.uncheckedBox}> <Unchecked width={24} height={24} /> </View>}
                  </TouchableOpacity>
                  <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                    <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>[필수]</Text> 개인정보 수집 및 이용에 동의합니다.
                  </Text>
                  <TouchableOpacity style={styles.seeMore} onPress={() => openTermModal('personalInfo')}>
                    <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>보기</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.agreeRow}>
                  <TouchableOpacity onPress={() => toggleAgreement('thirdParty')} style={styles.agreeRow}>
                  {agreements.thirdParty ?
                    <View style={styles.checkedBox}> <Checked width={24} height={24} /> </View> :
                    <View style={styles.uncheckedBox}> <Unchecked width={24} height={24} /> </View>}
                  </TouchableOpacity>
                  <Text style={[FONTS.fs_14_regular, styles.agreeText]}>
                    <Text style={[FONTS.fs_14_semibold, styles.nessesaryText]}>[필수]</Text> 개인정보 제3자 제공에 동의합니다.
                  </Text>
                  <TouchableOpacity style={styles.seeMore} onPress={() => openTermModal('thirdParty')}>
                    <Text style={[FONTS.fs_12_medium, styles.seeMoreText]}>보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>

        </ScrollView>

        <View style={styles.button}>
          {totalDiscountAmount > 0 ? (
            <View style={styles.discountBanner}>
              <DiscountArrow width={18} height={18} />
              <Text style={[FONTS.fs_14_semibold]}>
                <Text style={styles.discountBannerText}>총 {totalDiscountAmount.toLocaleString()}원</Text> 할인 받았어요
              </Text>
            </View>
          ) : null}
          <ButtonScarlet
            title={`${finalPaymentAmount.toLocaleString()}원 결제하기`}
            onPress={() => setConfirmVisible(true)}
            disabled={!isAllRequiredAgreed || isPointOverBalance}
          />
        </View>

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
          roomSummary={`${isDormitory ? `${roomName}(${guestCount}베드)` : `${roomName}`} / ${nights}박`}
          roomSubSummary={
            isDormitory
              ? `[${roomCapacity}인 도미토리]${genderText && dormitoryGenderType !== 'MIXED' ? `, ${genderText}` : ''}`
              : `[${roomCapacity}인 기준(최대 ${roomMaxCapacity}인)]${femaleOnly ? ', 여성전용' : ''}`
          }
          checkInLabel={formatDateTime(checkIn, checkInTime)}
          checkOutLabel={formatDateTime(checkOut, checkOutTime)}
        />
    </View>
    </KeyboardAvoidingView>
  );
};

export default GuesthouseReservation;
