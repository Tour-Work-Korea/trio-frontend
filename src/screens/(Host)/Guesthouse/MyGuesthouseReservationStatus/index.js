import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseReservationStatus.styles';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import ReservationList from './ReservationList';

import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';

const MyGuesthouseReservationStatus = () => {
  const [guesthouses, setGuesthouses] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selected, setSelected] = useState(null); // { id, guesthouseName }

  // 사장님 게하 리스트
  const fetchGuesthouses = async () => {
    try {
      const res = await hostGuesthouseApi.getMyGuesthouses();
      const data = (res?.data || []).map(g => ({
        id: g.id,
        guesthouseName: g.guesthouseName,
      }));
      setGuesthouses(data);
    } catch (error) {
      console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGuesthouses();
    }, [])
  );

  const handleSelect = (item) => {
    setSelected(item);
    setDropdownVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <Header title="게스트하우스 예약현황" />
      
      <View style={styles.body}>
        {/* 게하 고르기 */}
        <View style={styles.selectContainer}>
          {/* 셀렉트 박스 */}
          <TouchableOpacity
            onPress={() => setDropdownVisible(v => !v)}
            style={styles.dropdownBox}
          >
            <Text
              style={[
                FONTS.fs_16_medium,
                { color: selected ? COLORS.grayscale_800 : COLORS.grayscale_500 },
              ]}
              numberOfLines={1}
            >
              {selected ? selected.guesthouseName : '게스트하우스를 골라주세요'}
            </Text>
            {dropdownVisible ? <ChevronUp width={24} height={24}/> : <ChevronDown width={24} height={24}/>}
          </TouchableOpacity>

          {/* 드롭다운 */}
          {dropdownVisible && (
            <>
              <View
                style={{
                  maxHeight: 240,
                }}
              >
                <FlatList
                  data={guesthouses}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => {
                    const isSelected = selected?.id === item.id;
                    return (
                      <>
                      <View style={styles.devide}/>
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        style={styles.dropdownBox}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            FONTS.fs_16_medium,
                            {
                              color: isSelected ? COLORS.primary_blue : COLORS.grayscale_500,
                            },
                          ]}
                        >
                          {item.guesthouseName}
                        </Text>
                      </TouchableOpacity>
                      </>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={{ paddingTop: 12 }}>
                      <Text style={[FONTS.fs_16_medium, { color: COLORS.grayscale_400 }]}>
                        등록된 게스트하우스가 없습니다
                      </Text>
                    </View>
                  }
                />
              </View>
            </>
          )}
        </View>

        {/* 선택된 게하의 예약 현황을 같은 화면에 표시 */}
        {selected?.id ? (
          <View style={{ flex: 1 }}>
            <ReservationList
              guesthouseId={selected.id}
              key={selected.id} // 게하 바뀔 때 깔끔히 리셋
            />
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
    </View>
  );
};

export default MyGuesthouseReservationStatus;
