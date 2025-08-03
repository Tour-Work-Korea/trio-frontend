import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import Header from '@components/Header';
import styles from './UserReservationCheck.styles';
import { FONTS } from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import { formatDate } from '@utils/formatDate';

import fixedImage from '@assets/images/exphoto.jpeg'; // 임시 이미지

const UserReservationCheck = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservationList();
  }, []);

  const fetchReservationList = async () => {
    try {
      const res = await userMyApi.getMyReservations();
      setReservations(res.data);
    } catch (error) {
      Alert.alert('예약 목록 불러오기 실패');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={fixedImage} style={styles.image} />
      <View style={styles.content}>
        <Text style={FONTS.fs_h2_bold}>{item.guesthouseName}</Text>
        <Text style={FONTS.fs_body}>{item.reservationStatus}</Text>
        <Text style={FONTS.fs_body}>체크인: {formatDate(item.checkIn)}</Text>
        <Text style={FONTS.fs_body}>체크아웃: {formatDate(item.checkOut)}</Text>
        <Text style={FONTS.fs_body}>결제금액: ₩ {item.amount.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="예약내역" />
      <FlatList
        data={reservations}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>예약 내역이 없습니다.</Text>}
      />
    </View>
  );
};

export default UserReservationCheck;
