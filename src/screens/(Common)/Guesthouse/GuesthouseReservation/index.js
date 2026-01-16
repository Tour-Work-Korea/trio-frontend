import React, { useEffect, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import Header from '@components/Header';
import styles from './GuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import useUserStore from '@stores/userStore';
import TermsModal from '@components/modals/TermsModal';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';

// 번화번호 사이에 '-' 집어넣기
const formatPhoneNumber = (phone) => {
  if (!phone || phone.length !== 11) return phone; // 예외 처리
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const GuesthouseReservation = ({ route }) => {
  const { roomId, roomName, roomPrice, guesthouseName, checkIn, checkOut, guestCount, totalPrice } = route.params || {};
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

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);

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
        amount: totalPrice,
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
          {/* 날짜 */}
          <View style={styles.dateBoxContainer}>
              <View style={styles.dateBoxCheckIn}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크인</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatDateWithDay(checkIn)}</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkIn)}</Text>
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

          {/* 룸이름, 가격 */}
          <View style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약 정보</Text>
              <View style={styles.userInfo}>
                  <Text style={[FONTS.fs_14_semibold, styles.roomNameText]}>{roomName}</Text>
                  <Text style={[FONTS.fs_14_medium, styles.roomPriceText]}>{roomPrice?.toLocaleString()}원</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[FONTS.fs_14_medium, styles.userInfoTitle]}>총 가격</Text>
                <Text style={FONTS.fs_14_medium}>
                  {totalPrice?.toLocaleString()}원
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
            <ButtonScarlet
              title="요청하기"
              onPress={handleReservation}
              disabled={!isAllRequiredAgreed}
            />
        </View>

        {/* 약관동의 모달 */}
        <TermsModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          title={
            selectedTerm === 'terms'
              ? '숙소 취소/환불 규정'
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

export default GuesthouseReservation;
