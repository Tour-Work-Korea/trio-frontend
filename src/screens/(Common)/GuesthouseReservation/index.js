import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './GuesthouseReservation.styles';
import { FONTS } from '@constants/fonts';
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
  const { roomId, roomName, roomPrice, guesthouseName, checkIn, checkOut } = route.params || {};
  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';
  const [agreeAll, setAgreeAll] = useState(false);
  const navigation = useNavigation();
  const [agreements, setAgreements] = useState({
    terms: false,
    personalInfo: false,
    thirdParty: false,
  });
  const name = useUserStore(state => state.userProfile.name);
  const phone = useUserStore(state => state.userProfile.phone);

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
        checkIn: '2025-09-08T15:00:00',
        checkOut: '2025-09-09T11:00:00',
        guestCount: 1,
        amount: roomPrice,
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
        <Header title="예약" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[FONTS.fs_20_semibold, styles.title]}>{guesthouseName}</Text>
          <View style={styles.dateBoxContainer}>
              <View style={styles.dateBoxCheckIn}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크인</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>25.04.15 (화)</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkIn)}</Text>
              </View>
              <View style={styles.dateBoxCheckOut}>
                  <Text style={[FONTS.fs_14_semibold, styles.dateLabel]}>체크아웃</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>25.04.16 (수)</Text>
                  <Text style={[FONTS.fs_16_regular, styles.dateText]}>{formatTime(checkOut)}</Text>
              </View>
          </View>

          <View style={styles.devide}/>

          <View style={styles.section}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>예약자 정보</Text>
              <View style={styles.row}>
                  <Text style={FONTS.fs_14_medium}>{name}</Text>
                  <Text style={FONTS.fs_14_medium}>{formatPhoneNumber(phone)}</Text>
              </View>
          </View>

          <View style={styles.devide}/>

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
            marginHorizontal="20"
            onPress={handleReservation}
            />
        </View>
    </View>
  );
};

export default GuesthouseReservation;
