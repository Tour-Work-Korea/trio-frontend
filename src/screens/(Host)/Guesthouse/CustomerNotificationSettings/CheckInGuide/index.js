import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './CheckInGuide.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import RightArrow from '@assets/images/chevron_right_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';

// TODO: 사장님 프로필 변경되면 게하 id값 받아서 해야함

const CheckInGuide = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [selectedGuesthouseId, setSelectedGuesthouseId] = useState(null);
  const [isGuesthouseOpen, setIsGuesthouseOpen] = useState(false);
  const [rooms, setRooms] = useState([]);

  const selectedGuesthouse = useMemo(
    () => guesthouses.find((item) => String(item.guesthouseId) === String(selectedGuesthouseId)) ?? null,
    [guesthouses, selectedGuesthouseId],
  );

  useEffect(() => {
    const fetchGuesthousesWithRooms = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload = response?.data?.data ?? response?.data ?? [];
        const safeList = Array.isArray(payload) ? payload : [];
        setGuesthouses(safeList);
        setSelectedGuesthouseId((prev) => {
          if (prev && safeList.some((item) => String(item?.guesthouseId) === String(prev))) {
            return prev;
          }
          return safeList[0]?.guesthouseId ?? null;
        });
      } catch (error) {
        setGuesthouses([]);
        setSelectedGuesthouseId(null);
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
        {isGuesthouseOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.backdrop}
            onPress={() => setIsGuesthouseOpen(false)}
          />
        ) : null}

        <View>
          <Text style={[FONTS.fs_16_semibold]}>객실 선택</Text>
          <Text style={[FONTS.fs_14_medium, styles.notiText]}>객실마다 다른 체크인 안내문을 설정할 수 있어요.</Text>
        </View>

        <View style={styles.guesthouseSelectContainer}>
          <TouchableOpacity
            style={styles.guesthouseSelectBox}
            onPress={() => setIsGuesthouseOpen((prev) => !prev)}
          >
            <Text style={[FONTS.fs_14_regular, styles.guesthouseSelectText]}>
              {selectedGuesthouse?.guesthouseName ?? '게스트하우스를 선택해 주세요'}
            </Text>
            {isGuesthouseOpen ? (
              <ChevronUp width={12} height={12} />
            ) : (
              <ChevronDown width={12} height={12} />
            )}
          </TouchableOpacity>

          {isGuesthouseOpen ? (
            <View style={styles.guesthouseDropdown}>
              {guesthouses.length === 0 ? (
                <View style={styles.guesthouseOption}>
                  <Text style={[FONTS.fs_14_regular, styles.guesthouseOptionText]}>
                    등록된 게스트하우스가 없습니다
                  </Text>
                </View>
              ) : (
                guesthouses.map((item) => (
                  <TouchableOpacity
                    key={String(item?.guesthouseId)}
                    style={styles.guesthouseOption}
                    onPress={() => {
                      setSelectedGuesthouseId(item?.guesthouseId);
                      setIsGuesthouseOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        FONTS.fs_14_regular,
                        styles.guesthouseOptionText,
                        String(selectedGuesthouseId) === String(item?.guesthouseId)
                          ? { color: COLORS.primary_orange }
                          : null,
                      ]}
                    >
                      {item?.guesthouseName ?? '이름 없음'}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : null}
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
