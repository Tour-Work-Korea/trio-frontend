import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './CheckInGuide.styles';
import { FONTS } from '@constants/fonts';

import RightArrow from '@assets/images/chevron_right_black.svg';

const TEMP_ROOMS = [
  {id: 'room-1', name: '동백 (1인실)'},
  {id: 'room-2', name: '벚꽃 (1인실)'},
  {id: 'room-3', name: '남 6인 도미토리'},
];

const CheckInGuide = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <Header title="체크인 안내문"/>
      
      <View style={styles.body}>

        <View>
          <Text style={[FONTS.fs_16_semibold]}>객실 선택</Text>
          <Text style={[FONTS.fs_14_medium, styles.notiText]}>객실마다 다른 체크인 안내문을 설정할 수 있어요.</Text>
        </View>

        <View style={styles.roomList}>
          {TEMP_ROOMS.map((room) => (
            <TouchableOpacity
              key={room.id}
              onPress={() =>
                navigation.navigate('RoomGuideMessageEditor', {
                  roomId: room.id,
                  roomName: room.name,
                })
              }
              style={styles.selectRow}
            >
              <Text style={[FONTS.fs_16_medium, styles.roomNameText]}>{room.name}</Text>
              <RightArrow width={24} height={24} />
            </TouchableOpacity>
          ))}
        </View>
        
      </View>
    </View>
  );
};

export default CheckInGuide;
