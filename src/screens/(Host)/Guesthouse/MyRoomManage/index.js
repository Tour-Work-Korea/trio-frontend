import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PanResponder, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import styles from './MyRoomManage.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import AlertModal from '@components/modals/AlertModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

// 손가락을 이 정도(px) 이상 좌/우로 이동했을 때만 스와이프로 인정
// 너무 작은 값이면 탭/스크롤이 오작동할 수 있어서 임계값을 둠
const SWIPE_THRESHOLD = 60;

// 객실 기본 정보 응답을 화면 공통 포맷으로 정규화
const normalizeRoom = (room = {}) => ({
  ...room,
  id: room?.roomId ?? room?.id,
  roomId: room?.roomId ?? room?.id,
  name: room?.roomName ?? room?.name ?? '이름 없음',
  isClosed: Boolean(room?.isClosed),
  displayBeds: Number(room?.roomCapacity ?? 0),
  availableBeds: Number(room?.roomCapacity ?? 0),
});

// 날짜별 재고/운영 상태 응답을 화면 공통 포맷으로 정규화
const normalizeInventory = (inventory = {}, fallbackRoom = {}) => ({
  ...inventory,
  roomId: inventory?.roomId ?? fallbackRoom?.roomId,
  roomName: inventory?.roomName ?? fallbackRoom?.roomName ?? '이름 없음',
  name: inventory?.roomName ?? fallbackRoom?.roomName ?? '이름 없음',
  roomType: inventory?.roomType ?? fallbackRoom?.roomType,
  isClosed: inventory?.isClosed != null ? Boolean(inventory?.isClosed) : Boolean(fallbackRoom?.isClosed),
  reservedBeds: Number(inventory?.reservedBeds ?? 0),
  availableBeds: Number(inventory?.availableBeds ?? fallbackRoom?.roomCapacity ?? 0),
  sellableCapacity: Number(inventory?.sellableCapacity ?? fallbackRoom?.roomCapacity ?? 0),
  displayBeds: Number(
    inventory?.availableBeds ?? fallbackRoom?.roomCapacity ?? 0,
  ),
  roomMaxCapacity: Number(inventory?.roomMaxCapacity ?? fallbackRoom?.roomMaxCapacity ?? 0),
});

// 변경 감지를 위해 방별 초기 상태(isClosed, displayBeds) 맵 생성
const buildRoomStateMap = (rooms = []) =>
  rooms.reduce((acc, room) => {
    const roomId = room?.roomId;
    if (roomId == null) return acc;

    acc[String(roomId)] = {
      isClosed: Boolean(room?.isClosed),
      displayBeds: Number(room?.displayBeds ?? 0),
    };
    return acc;
  }, {});

// TODO: 사장님 프로필 변경되면 게하 id값 받아서 해야함
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
  const [guesthouses, setGuesthouses] = useState([]);
  const [selectedGuesthouseId, setSelectedGuesthouseId] = useState(null);
  const [isGuesthouseOpen, setIsGuesthouseOpen] = useState(false);
  const [isGuesthousesLoading, setIsGuesthousesLoading] = useState(true);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [dormitoryRooms, setDormitoryRooms] = useState([]);
  const [normalRooms, setNormalRooms] = useState([]);
  const [initialRoomStates, setInitialRoomStates] = useState({});
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const [limitModal, setLimitModal] = useState({
    visible: false,
    message: '',
  });

  const selectedGuesthouse = useMemo(
    () => guesthouses.find((item) => String(item.guesthouseId) === String(selectedGuesthouseId)) ?? null,
    [guesthouses, selectedGuesthouseId],
  );

  useEffect(() => {
    const fetchGuesthousesWithRooms = async () => {
      setIsGuesthousesLoading(true);
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
      } finally {
        setIsGuesthousesLoading(false);
      }
    };

    fetchGuesthousesWithRooms();
  }, []);

  // 선택된 게하/날짜 기준으로 객실 상태를 다시 조회
  const fetchInventoryBySelectedDate = useCallback(async () => {
    const current = guesthouses.find(
      (item) => String(item?.guesthouseId) === String(selectedGuesthouseId),
    );
    const rooms = Array.isArray(current?.rooms) ? current.rooms : [];
    const normalizedRooms = rooms.map(normalizeRoom).filter((room) => room.roomId != null);

    if (!selectedGuesthouseId || normalizedRooms.length === 0) {
      setDormitoryRooms([]);
      setNormalRooms([]);
      setInitialRoomStates({});
      setIsInventoryLoading(false);
      return;
    }

    setIsInventoryLoading(true);
    try {
      const inventoryResponses = await Promise.all(
        normalizedRooms.map(async (room) => {
          try {
            const response = await hostGuesthouseApi.getRoomInventoryCalendar(
              selectedGuesthouseId,
              room.roomId,
              selectedDate,
              selectedDate,
            );
            const payload = response?.data?.data ?? response?.data ?? {};
            const list =
              payload?.inventories ??
              payload?.calendar ??
              payload?.content ??
              (Array.isArray(payload) ? payload : null) ??
              [];
            const matched = Array.isArray(list)
              ? list.find((item) => item?.date === selectedDate) ?? list[0]
              : payload;
            return normalizeInventory(matched ?? {}, room);
          } catch (error) {
            return normalizeInventory({}, room);
          }
        }),
      );

      setDormitoryRooms(inventoryResponses.filter((room) => room.roomType === 'DORMITORY'));
      setNormalRooms(inventoryResponses.filter((room) => room.roomType !== 'DORMITORY'));
      setInitialRoomStates(buildRoomStateMap(inventoryResponses));
    } finally {
      setIsInventoryLoading(false);
    }
  }, [guesthouses, selectedGuesthouseId, selectedDate]);

  useEffect(() => {
    fetchInventoryBySelectedDate();
  }, [fetchInventoryBySelectedDate]);

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
      prev.map((room) =>
        room.roomId === roomId ? { ...room, isClosed: !nextValue } : room,
      ),
    );
  };

  const handleToggleNormalRoom = (roomId, nextValue) => {
    setNormalRooms((prev) =>
      prev.map((room) =>
        room.roomId === roomId ? { ...room, isClosed: !nextValue } : room,
      ),
    );
  };

  // 도미토리 예약 가능 베드 수 변경 (0 이하 방지, 최대 수용 인원 제한)
  const handleChangeDormitoryBeds = (roomId, diff) => {
    setDormitoryRooms((prev) =>
      prev.map((room) => {
        if (room.roomId !== roomId) return room;
        const maxCapacity = Number(room?.roomMaxCapacity ?? 0);
        const reservedBeds = Number(room?.reservedBeds ?? 0);
        const maxSellableBeds =
          maxCapacity > 0 ? Math.max(0, maxCapacity - reservedBeds) : Number.MAX_SAFE_INTEGER;
        const nextBeds = Math.min(maxSellableBeds, Math.max(0, room.displayBeds + diff));
        return { ...room, displayBeds: nextBeds };
      }),
    );
  };

  // 변경된 항목만 선별해서 저장 API 호출
  const handleApplyChanges = async () => {
    if (!selectedGuesthouseId || isApplying) return;

    const allRooms = [...dormitoryRooms, ...normalRooms];
    const statusTasks = [];
    const availableBedsTasks = [];

    allRooms.forEach((room) => {
      const roomId = room?.roomId;
      if (roomId == null) return;

      const previous = initialRoomStates[String(roomId)];
      if (!previous) return;

      const nextIsClosed = Boolean(room?.isClosed);
      const prevIsClosed = Boolean(previous?.isClosed);

      if (nextIsClosed !== prevIsClosed) {
        statusTasks.push(
          hostGuesthouseApi.updateRoomStatusByDate(selectedGuesthouseId, roomId, {
            date: selectedDate,
            isClosed: nextIsClosed,
          }),
        );
      }

      if (room?.roomType === 'DORMITORY') {
        const nextDisplayBeds = Number(room?.displayBeds ?? 0);
        const prevDisplayBeds = Number(previous?.displayBeds ?? 0);

        if (nextDisplayBeds !== prevDisplayBeds) {
          availableBedsTasks.push(
            hostGuesthouseApi.updateAvailableBeds(selectedGuesthouseId, roomId, {
              date: selectedDate,
              availableBeds: nextDisplayBeds,
            }),
          );
        }
      }
    });

    const tasks = [...statusTasks, ...availableBedsTasks];
    if (tasks.length === 0) return;

    setIsApplying(true);
    try {
      await Promise.all(tasks);
      setInitialRoomStates(buildRoomStateMap(allRooms));
      Toast.show({
        type: 'success',
        text1: '변경 내용이 저장되었어요.',
        position: 'top',
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ?? '변경 내용을 저장하지 못했습니다. 다시 시도해 주세요.';
      setErrorModal({
        visible: true,
        message,
      });
    } finally {
      setIsApplying(false);
    }
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
        {isCalendarOpen || isGuesthouseOpen ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.searchFilterBackdrop}
            onPress={() => {
              setIsCalendarOpen(false);
              setIsGuesthouseOpen(false);
            }}
          />
        ) : null}

        {/* 임시 게하 선택 */}
        <View style={styles.guesthouseSelectContainer}>
          <TouchableOpacity
            style={styles.guesthouseSelectBox}
            onPress={() => {
              setIsGuesthouseOpen((prev) => !prev);
              setIsCalendarOpen(false);
            }}
            disabled={isGuesthousesLoading}
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
                          ? styles.selectedGuesthouseText
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
          {isInventoryLoading ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>객실 정보를 불러오는 중입니다</Text>
          ) : dormitoryRooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>도미토리 객실이 없습니다</Text>
          ) : (
            dormitoryRooms.map((room) => {
              const isExposed = !Boolean(room?.isClosed);
              const roomMaxCapacity = Number(room?.roomMaxCapacity ?? 0);
              const reservedBeds = Number(room?.reservedBeds ?? 0);
              const hasCapacityLimit = roomMaxCapacity > 0;
              const maxAvailableBeds = hasCapacityLimit
                ? Math.max(0, roomMaxCapacity - reservedBeds)
                : Number.MAX_SAFE_INTEGER;
              const canIncreaseBeds =
                !hasCapacityLimit ||
                Number(room?.displayBeds ?? 0) < maxAvailableBeds;

              return (
                <View key={String(room.roomId)} style={styles.roomCard}>
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
                          isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                        ]}
                      >
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                          ]}
                        >
                          {isExposed ? '노출중' : '미노출'}
                        </Text>
                      </View>
                      <Switch
                        value={isExposed}
                        onValueChange={(nextValue) =>
                          handleToggleDormitoryRoom(room.roomId, nextValue)
                        }
                        trackColor={{
                          false: COLORS.grayscale_300,
                          true: COLORS.primary_orange,
                        }}
                        thumbColor={COLORS.grayscale_0}
                      />
                    </View>
                  </View>

                  <View style={styles.bedControlRow}>
                    <Text style={[FONTS.fs_12_medium, styles.bedControlLabel]}>현재 예약 가능 베드 수</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.bedControlButton}
                      onPress={() => handleChangeDormitoryBeds(room.roomId, -1)}
                    >
                      <MinusIcon width={12} height={12} />
                    </TouchableOpacity>
                    <Text style={[FONTS.fs_12_medium, styles.bedCountText]}>{room.displayBeds}</Text>
                    <TouchableOpacity
                      activeOpacity={canIncreaseBeds ? 0.8 : 1}
                      style={[
                        styles.bedControlButton,
                        !canIncreaseBeds ? { opacity: 0.35 } : null,
                      ]}
                      onPress={() => {
                        if (canIncreaseBeds) {
                          handleChangeDormitoryBeds(room.roomId, 1);
                          return;
                        }

                        if (reservedBeds === 0) {
                          setLimitModal({
                            visible: true,
                            message: `해당 객실의 최대 베드 수는 ${roomMaxCapacity}개입니다.\n${roomMaxCapacity} 이하로 설정해 주세요.`,
                          });
                          return;
                        }

                        setLimitModal({
                          visible: true,
                          message: `현재 ${reservedBeds}개의 예약이 존재합니다.\n예약 가능 베드 수는 최대 ${maxAvailableBeds}개까지 설정할 수 있습니다.`,
                        });
                      }}
                    >
                      <PlusIcon width={12} height={12} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* 일반객실 */}
        <Text style={[FONTS.fs_16_semibold, styles.sectionTitle, styles.normalSectionTitle]}>일반 객실</Text>
        <View style={styles.roomList}>
          {isInventoryLoading ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>객실 정보를 불러오는 중입니다</Text>
          ) : normalRooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>일반 객실이 없습니다</Text>
          ) : (
            normalRooms.map((room) => {
              const isExposed = !Boolean(room?.isClosed);

              return (
                <View key={String(room.roomId)} style={styles.roomCard}>
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
                          isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                        ]}
                      >
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                          ]}
                        >
                          {isExposed ? '노출중' : '미노출'}
                        </Text>
                      </View>
                      <Switch
                        value={isExposed}
                        onValueChange={(nextValue) => handleToggleNormalRoom(room.roomId, nextValue)}
                        trackColor={{
                          false: COLORS.grayscale_300,
                          true: COLORS.primary_orange,
                        }}
                        thumbColor={COLORS.grayscale_0}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, isApplying ? { opacity: 0.6 } : null]}
        onPress={handleApplyChanges}
        disabled={isApplying || isInventoryLoading || !selectedGuesthouseId}
      >
        <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>적용하기</Text>
      </TouchableOpacity>

      <AlertModal
        visible={errorModal.visible}
        message={errorModal.message}
        buttonText="확인"
        onPress={async () => {
          setErrorModal({ visible: false, message: '' });
          await fetchInventoryBySelectedDate();
        }}
      />

      <AlertModal
        visible={limitModal.visible}
        message={limitModal.message}
        buttonText="확인"
        onPress={() => {
          setLimitModal({ visible: false, message: '' });
        }}
      />
    </View>
  );
};

export default MyRoomManage;
