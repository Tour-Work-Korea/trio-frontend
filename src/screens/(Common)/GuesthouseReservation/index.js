import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './GuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';

import Checked from '@assets/images/Scarlet_CheckCircle.svg';
import Unchecked from '@assets/images/CheckCircle.svg';

const GuesthouseReservation = ({ route }) => {
  const { roomId, roomName, roomPrice, guesthouseName, checkIn, checkOut } = route.params || {};
  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';
  const [agreeAll, setAgreeAll] = useState(false);
  const navigation = useNavigation();
  const [agreements, setAgreements] = useState({
    terms: false,
    personalInfo: false,
    thirdParty: false,
  });

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

  // 예약 호출
  const handleReservation = async () => {
    // 동의 체크 등 유효성 검사 추가 예정 
    try {
      const res = await userGuesthouseApi.reserveRoom(roomId, {
        checkIn: '2025-09-07T15:00:00',
        checkOut: '2025-09-08T11:00:00',
        guestCount: 1,
        amount: 85000,
        request: '요청사항',
      });
      const reservationId = res.data;

      Alert.alert('예약이 완료되었습니다.');

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
    <View style={styles.container}>
        <Header title="방 상세보기" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
                <Text style={[FONTS.fs_h1_bold, styles.title]}>{guesthouseName}</Text>
                <View style={styles.dateBoxContainer}>
                    <View style={styles.dateBoxCheckIn}>
                        <Text style={[FONTS.fs_body_bold, styles.dateLabel]}>체크인</Text>
                        <Text style={FONTS.fs_body}>25.04.15 (화)</Text>
                        <Text style={FONTS.fs_body}>{formatTime(checkIn)}</Text>
                    </View>
                        <View style={styles.dateBoxCheckOut}>
                        <Text style={[FONTS.fs_body_bold, styles.dateLabel]}>체크아웃</Text>
                        <Text style={FONTS.fs_body}>25.04.16 (수)</Text>
                        <Text style={FONTS.fs_body}>{formatTime(checkOut)}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>예약자 정보</Text>
                <View style={styles.row}>
                    <Text style={FONTS.fs_body_bold}>김서현</Text>
                    <Text style={FONTS.fs_body_bold}>010-8888-8888</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>결제정보</Text>
                <View style={styles.paymentRow}>
                    <Text style={FONTS.fs_body_bold}>토스페이</Text>
                    <Text style={FONTS.fs_body_bold}>무통장입금</Text>
                    <Text style={FONTS.fs_body_bold}>카카오페이</Text>
                </View>
            </View>

            <View style={styles.agreeRowContainer}>
                <TouchableOpacity onPress={toggleAll} style={styles.agreeRowTitle}>
                {agreeAll ? <Checked width={20} height={20} /> : <Unchecked width={20} height={20} />}
                    <Text style={[FONTS.fs_h2_bold, styles.agreeText]}>전체 동의</Text>
                </TouchableOpacity>

                <View style={styles.agreeRowConent}>
                    <TouchableOpacity onPress={() => toggleAgreement('terms')} style={styles.agreeRow}>
                    {agreements.terms ? <Checked width={20} height={20} /> : <Unchecked width={20} height={20} />}
                        <Text style={FONTS.fs_body}>[필수] 숙소 취소/환불 규정에 동의합니다.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleAgreement('personalInfo')} style={styles.agreeRow}>
                    {agreements.personalInfo ? <Checked width={20} height={20} /> : <Unchecked width={20} height={20} />}
                        <Text style={FONTS.fs_body}>[필수] 개인정보 수집 및 이용에 동의합니다.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleAgreement('thirdParty')} style={styles.agreeRow}>
                    {agreements.thirdParty ? <Checked width={20} height={20} /> : <Unchecked width={20} height={20} />}
                        <Text style={FONTS.fs_body}>[필수] 개인정보 제3자 제공에 동의합니다.</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>

        
        <View style={styles.button}>
            <ButtonScarlet
            title="예약 확정하기"
            marginHorizontal="0"
            onPress={handleReservation}
            />
        </View>
    </View>
  );
};

export default GuesthouseReservation;
