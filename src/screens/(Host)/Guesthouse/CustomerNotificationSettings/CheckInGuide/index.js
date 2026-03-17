import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './CheckInGuide.styles';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import useUserStore from '@stores/userStore';

import RightArrow from '@assets/images/chevron_right_black.svg';

const CheckInGuide = () => {
  const navigation = useNavigation();
  const selectedGuesthouseId = useUserStore(state => state.selectedHostGuesthouseId);
  const [guesthouses, setGuesthouses] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchGuesthousesWithRooms = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload = response?.data?.data ?? response?.data ?? [];
        const safeList = Array.isArray(payload) ? payload : [];
        setGuesthouses(safeList);
      } catch (error) {
        setGuesthouses([]);
      }
    };

    fetchGuesthousesWithRooms();
  }, []);

  useEffect(() => {
    const current = guesthouses.find(
      (item) => String(item?.guesthouseId) === String(selectedGuesthouseId),
    );
    const roomList = Array.isArray(current?.rooms) ? current.rooms : [];
    setRooms(roomList);
  }, [guesthouses, selectedGuesthouseId]);

  return (
    <View style={styles.container}>
      <Header title="체크인 안내문"/>
      
      <View style={styles.body}>
        <View>
          <Text style={[FONTS.fs_16_semibold]}>객실 선택</Text>
          <Text style={[FONTS.fs_14_medium, styles.notiText]}>객실마다 다른 체크인 안내문을 설정할 수 있어요.</Text>
        </View>

        <View style={styles.roomList}>
          {rooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>객실이 없습니다</Text>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={String(room?.roomId)}
                onPress={() =>
                  navigation.navigate('RoomGuideMessageEditor', {
                    guesthouseId: selectedGuesthouseId,
                    roomId: room?.roomId,
                    roomName: room?.roomName ?? '이름 없음',
                  })
                }
                style={styles.selectRow}
              >
                <Text style={[FONTS.fs_16_medium, styles.roomNameText]}>
                  {room?.roomName ?? '이름 없음'}
                </Text>
                <RightArrow width={24} height={24} />
              </TouchableOpacity>
            ))
          )}
        </View>
        
      </View>
    </View>
  );
};

export default CheckInGuide;
