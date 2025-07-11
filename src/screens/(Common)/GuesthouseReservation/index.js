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
import useUserStore from '@stores/userStore';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';
import DownArrow from '@assets/images/chevron_down_gray.svg';

// 번화번호 사이에 '-' 집어넣기
const formatPhoneNumber = (phone) => {
  if (!phone || phone.length !== 11) return phone; // 예외 처리
  return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
};

const GuesthouseReservation = ({ route }) => {
  const { roomId, roomName, roomPrice, guesthouseName, checkIn, checkOut, guestCount } = route.params || {};
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

  // 예약 호출
  const handleReservation = async () => { 
    try {
      const res = await userGuesthouseApi.reserveRoom(roomId, {
        checkIn: checkIn,
        checkOut: checkOut,
        guestCount: guestCount,
        amount: roomPrice,
        request: requestMessage,
      });
      const reservationId = res.data;

      console.log('예약이 완료되었습니다.');

      // 예약 성공 후 결제 페이지로 이동
      navigation.navigate( 'GuesthousePayment' , {
        reservationId,
        amount: roomPrice,
      });
      
    } catch (err) {
      Alert.alert('예약 실패', '오류가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // 필요 시 값 조정
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1 }}>
        <Header title="예약" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                  <TouchableOpacity style={styles.seeMore}>
                    <DownArrow width={24} height={24}/>
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
                  <TouchableOpacity style={styles.seeMore}>
                    <DownArrow width={24} height={24}/>
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
                  <TouchableOpacity style={styles.seeMore}>
                    <DownArrow width={24} height={24}/>
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
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GuesthouseReservation;
