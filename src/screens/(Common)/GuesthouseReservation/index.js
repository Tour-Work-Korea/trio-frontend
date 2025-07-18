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
import TermsModal from '@components/modals/TermsModal';

import Checked from '@assets/images/check_orange.svg';
import Unchecked from '@assets/images/check_gray.svg';

import Config from 'react-native-config'; // ✅ 환경변수 import

const formatPhoneNumber = (phone) => {
  if (!phone || phone.length !== 11) return phone;
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

  // ✅ 환경변수 확인용 Alert (TestFlight에서 앱 꺼짐 방지용 안전 처리)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        Alert.alert('PORTONE 채널키', Config.PORTONE_CHANNEL_KEY || '값 없음');
      } catch (e) {
        console.warn('Alert 실패:', e);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '시간 없음';
    const date = dayjs(timeStr);
    return date.isValid() ? date.format('HH:mm') : timeStr.slice(0, 5);
  };
  const formatDateWithDay = (dateStr) => {
    const date = dayjs(dateStr);
    return `${date.format('YY.MM.DD')} (${date.format('dd')})`;
  };

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

  const handleReservation = async () => {
    try {
      const res = await userGuesthouseApi.reserveRoom(roomId, {
        checkIn,
        checkOut,
        guestCount,
        amount: roomPrice,
        request: requestMessage,
      });
      const reservationId = res.data;

      console.log('예약이 완료되었습니다.');

      navigation.navigate('GuesthousePayment', {
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <Header title="예약" />

          {/* ✅ PORTONE 채널키 화면 표시 */}
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: 'grey' }}>
              🔍 채널 키: {Config.PORTONE_CHANNEL_KEY || '값 없음'}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[FONTS.fs_20_semibold, styles.title]}>{guesthouseName}</Text>

            {/* 나머지 UI 그대로 유지 */}
            {/* 생략된 부분은 동일 */}

            {/* 버튼 */}
            <View style={styles.button}>
              <ButtonScarlet
                title="요청하기"
                onPress={handleReservation}
                disabled={!isAllRequiredAgreed}
              />
            </View>

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
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GuesthouseReservation;
