import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './RoomDetail.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';

import LeftArrow from '@assets/images/chevron_left_white.svg';

const RoomDetail = ({ route }) => {
  const navigation = useNavigation();
  const { roomId, roomName, roomPrice, roomDesc, guesthouseName, checkIn, checkOut } = route.params;
  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';

  return (
    <View style={styles.container}>
        <ScrollView>
            <View style={styles.imageContainer}>
                <Image
                source={require('@assets/images/exphoto.jpeg')}
                style={styles.image}
                />
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <LeftArrow width={28} height={28}/>
                </TouchableOpacity>
            </View>

            <View style={styles.contentWrapper}>
                <View style={styles.roomInfo}>
                    <Text style={[FONTS.fs_20_semibold, styles.roomType]}>{roomName}</Text>
                    <Text style={[FONTS.fs_14_regular, styles.description]}>
                        {roomDesc}
                    </Text>
                    <Text style={[FONTS.fs_20_bold, styles.price]}>
                    {roomPrice.toLocaleString()}원
                    </Text>
                </View>

                <Text style={[FONTS.fs_16_medium, styles.dateTitle]}>선택 날짜</Text>
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
            </View>
        </ScrollView>

        <View style={styles.button}>
            <ButtonScarlet
                title="숙박 예약"
                marginHorizontal="20"
                onPress={() =>
                    navigation.navigate('GuesthouseReservation', {
                    roomId,
                    roomName,
                    roomPrice,
                    guesthouseName,
                    checkIn,
                    checkOut,
                    })
                }
                />
        </View>
    </View>
  );
};

export default RoomDetail;
