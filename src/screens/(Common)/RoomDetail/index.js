import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from './RoomDetail.styles';
import { FONTS } from '@constants/fonts';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';

const RoomDetail = ({ route }) => {
  const navigation = useNavigation();
  const { roomId, roomName, roomPrice, roomDesc, guesthouseName, checkIn, checkOut } = route.params;
  const formatTime = (timeStr) => timeStr ? timeStr.slice(0, 5) : '';

  return (
    <View style={styles.container}>
        <Header title="게스트하우스 상세보기" />
        <ScrollView>
            <Image
            source={require('@assets/images/exphoto.jpeg')}
            style={styles.image}
            />

            <View style={styles.contentWrapper}>
                <View style={styles.roomInfo}>
                    <Text style={[FONTS.fs_h1_bold, styles.roomType]}>{roomName}</Text>
                    <Text style={[FONTS.fs_body, styles.description]}>
                        {roomDesc}
                    </Text>
                    <Text style={[FONTS.fs_h1_bold, styles.price]}>
                    {roomPrice.toLocaleString()}원
                    </Text>
                </View>

                <Text style={[FONTS.fs_h2_bold, styles.dateTitle]}>선택 날짜</Text>
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
        </ScrollView>

        <View style={styles.button}>
            <ButtonScarlet
                title="숙박 예약"
                marginHorizontal="0"
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
