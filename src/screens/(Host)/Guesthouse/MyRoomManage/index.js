import React, { useMemo, useState } from 'react';
import { PanResponder, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import Header from '@components/Header';
import styles from './MyRoomManage.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';

// 손가락을 이 정도(px) 이상 좌/우로 이동했을 때만 스와이프로 인정
// 너무 작은 값이면 탭/스크롤이 오작동할 수 있어서 임계값을 둠
const SWIPE_THRESHOLD = 60;
const TEMP_DORMITORY_ROOMS = [
  { id: 'dorm-1', name: '여 6인 도미토리', isExposed: false, availableBeds: 6 },
  { id: 'dorm-2', name: '남성 2인실', isExposed: false, availableBeds: 2 },
  { id: 'dorm-3', name: '남 6인 도미토리', isExposed: true, availableBeds: 2 },
  { id: 'dorm-4', name: '남 6인 도미토리', isExposed: true, availableBeds: 2 },
];

const TEMP_NORMAL_ROOMS = [
  { id: 'room-1', name: '동백 (1인실)', isExposed: false },
  { id: 'room-2', name: '벚꽃 (1인실)', isExposed: true },
];

const MyRoomManage = () => {
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const shiftDate = (baseDate, diffDays) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + diffDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dormitoryRooms, setDormitoryRooms] = useState(TEMP_DORMITORY_ROOMS);
  const [normalRooms, setNormalRooms] = useState(TEMP_NORMAL_ROOMS);

  // 화면 전체 좌우 스와이프를 감지해서 날짜를 하루씩 이동시키는 제스처 핸들러
  // useMemo로 한 번만 생성해서, 렌더마다 새 PanResponder가 만들어지지 않도록 유지
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // 사용자가 손가락을 움직일 때, 이 터치를 PanResponder가 가져올지 결정하는 단계
        // 세로 스크롤/드래그보다 "가로 이동"이 더 큰 경우에만 스와이프로 처리
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // dx: 가로 이동량, dy: 세로 이동량
          const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          // 가로 이동이 우세 + 최소 이동량(12px) 이상일 때만 true
          // => 미세한 손떨림/탭을 스와이프로 잘못 인식하는 것 방지
          return isHorizontalSwipe && Math.abs(gestureState.dx) > 12;
        },

        // 손가락을 뗐을 때 최종 이동량을 보고 실제 동작(날짜 변경)을 실행
        onPanResponderRelease: (_, gestureState) => {
          // 왼쪽으로 크게 스와이프(음수 방향)한 경우: 다음 날짜로 이동
          // UX 기준: "왼쪽으로 넘기면 다음 페이지/다음 날짜" 패턴
          if (gestureState.dx <= -SWIPE_THRESHOLD) {
            setSelectedDate((prev) => shiftDate(prev, 1));
            // 날짜가 바뀌면 캘린더 팝업은 닫아 화면 상태를 단순화
            setIsCalendarOpen(false);
            return;
          }

          // 오른쪽으로 크게 스와이프(양수 방향)한 경우: 이전 날짜로 이동
          if (gestureState.dx >= SWIPE_THRESHOLD) {
            setSelectedDate((prev) => shiftDate(prev, -1));
            setIsCalendarOpen(false);
          }
          // 임계값보다 작은 이동은 스와이프로 간주하지 않고 아무 동작도 하지 않음
        },
      }),
    [],
  );

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };

  const handleToggleDormitoryRoom = (roomId, nextValue) => {
    setDormitoryRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, isExposed: nextValue } : room)),
    );
  };

  const handleToggleNormalRoom = (roomId, nextValue) => {
    setNormalRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, isExposed: nextValue } : room)),
    );
  };

  const handleChangeDormitoryBeds = (roomId, diff) => {
    setDormitoryRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const nextBeds = Math.max(0, room.availableBeds + diff);
        return { ...room, availableBeds: nextBeds };
      }),
    );
  };
  
  return (
    <View style={styles.container}>
      <Header title="방 관리"/>
      
      {/* body 전체에 panHandlers를 연결해서 화면 어디서든 좌우 스와이프로 날짜 이동 가능 */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        {isCalendarOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.searchFilterBackdrop}
            onPress={() => {
              setIsCalendarOpen(false);
            }}
          />
        ) : null}

        {/* 날짜 선택 */}
        <View style={styles.dateSelectContainer}>
          <View style={styles.dateSelectBox}>
          <TouchableOpacity
            onPress={() => {
              setSelectedDate((prev) => shiftDate(prev, -1));
              setIsCalendarOpen(false);
            }}
          >
            <ChevronLeft width={24} height={24}/>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsCalendarOpen((prev) => !prev);
            }}
          >
            <Text style={[FONTS.fs_16_medium]}>
              {formatLocalDateToDotWithDay(selectedDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedDate((prev) => shiftDate(prev, 1));
              setIsCalendarOpen(false);
            }}
          >
            <ChevronRight width={24} height={24}/>
          </TouchableOpacity>
          </View>

          {isCalendarOpen ? (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                {...CALENDAR_COMMON_PROPS}
                markedDates={markedDates}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setIsCalendarOpen(false);
                }}
                theme={CALENDAR_THEME}
              />
            </View>
          ) : null}
        </View>

        {/* 도미토리 */}
        <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>도미토리</Text>
        <View style={styles.roomList}>
          {dormitoryRooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomTopRow}>
                <Text
                  style={[FONTS.fs_14_medium, styles.roomName]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {room.name}
                </Text>
                <View style={styles.roomRightBox}>
                  <View
                    style={[
                      styles.exposureBadge,
                      room.isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                    ]}
                  >
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        room.isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                      ]}
                    >
                      {room.isExposed ? '노출중' : '미노출'}
                    </Text>
                  </View>
                  <Switch
                    value={room.isExposed}
                    onValueChange={(nextValue) => handleToggleDormitoryRoom(room.id, nextValue)}
                    trackColor={{
                      false: COLORS.grayscale_300,
                      true: COLORS.primary_orange,
                    }}
                    thumbColor={COLORS.grayscale_0}
                  />
                </View>
              </View>

              <View style={styles.bedControlRow}>
                <Text style={[FONTS.fs_12_medium, styles.bedControlLabel]}>예약 가능 베드 수</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.bedControlButton}
                  onPress={() => handleChangeDormitoryBeds(room.id, -1)}
                >
                  <MinusIcon width={12} height={12} />
                </TouchableOpacity>
                <Text style={[FONTS.fs_12_medium, styles.bedCountText]}>{room.availableBeds}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.bedControlButton}
                  onPress={() => handleChangeDormitoryBeds(room.id, 1)}
                >
                  <PlusIcon width={12} height={12} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 일반객실 */}
        <Text style={[FONTS.fs_16_semibold, styles.sectionTitle, styles.normalSectionTitle]}>일반 객실</Text>
        <View style={styles.roomList}>
          {normalRooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.roomTopRow}>
                <Text
                  style={[FONTS.fs_14_medium, styles.roomName]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {room.name}
                </Text>
                <View style={styles.roomRightBox}>
                  <View
                    style={[
                      styles.exposureBadge,
                      room.isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                    ]}
                  >
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        room.isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                      ]}
                    >
                      {room.isExposed ? '노출중' : '미노출'}
                    </Text>
                  </View>
                  <Switch
                    value={room.isExposed}
                    onValueChange={(nextValue) => handleToggleNormalRoom(room.id, nextValue)}
                    trackColor={{
                      false: COLORS.grayscale_300,
                      true: COLORS.primary_orange,
                    }}
                    thumbColor={COLORS.grayscale_0}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyRoomManage;
