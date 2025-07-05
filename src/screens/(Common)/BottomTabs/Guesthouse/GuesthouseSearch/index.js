import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import SearchIcon from '@assets/images/search_gray.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import Person from '@assets/images/person20_gray.svg';
import AllIcon from '@assets/images/wlogo_blue_left.svg';

import styles from './GuesthouseSearch.styles';
import { FONTS } from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import DateGuestModal from '@components/modals/DateGuestModal';

const regions = [
  {
    name: '제주',
    subRegions: ['제주전체', '제주북부', '제주동부', '제주남부', '제주서부'],
  },
  {
    name: '부산',
    subRegions: ['해운대', '광안리', '서면', '남포동'],
  },
  // 지역 확정되면 나중에 데이터 파일로 빼기
];

const GuesthouseSearch = () => {
  const navigation = useNavigation();

  // 지역 선택
  const [selectedRegion, setSelectedRegion] = useState(regions[0].name);
  // 검색어 입력
  const [searchTerm, setSearchTerm] = useState('');

  // 선택 날짜, 인원 출력
  const [displayDate, setDisplayDate] = useState('');
  const [adultCount, setAdultCount] = useState(1);  // 기본 1명
  const [childCount, setChildCount] = useState(0);
  // 인원, 날짜 선택 모달
  const [dateGuestModalVisible, setDateGuestModalVisible] = useState(false);

  // 날짜는 초기에 오늘~내일 날짜로 설정
  useEffect(() => {
    const today = dayjs();
    const tomorrow = today.add(1, 'day');
    const formattedToday = today.format('M.D dd');
    const formattedTomorrow = tomorrow.format('M.D dd');
    setDisplayDate(`${formattedToday} - ${formattedTomorrow}`);
  }, []);

  // 게하 리스트 페이지 지역 선택으로 이동
  const goToGuesthouseList = (keywordList) => {
    navigation.navigate('GuesthouseList', {
        displayDate,
        guestCount: adultCount + childCount,
        keywordList,
    });
  };

  // 검색어로 이동
  const handleSearch = async () => {
    try {
      const response = await userGuesthouseApi.searchGuesthouseByKeyword(searchTerm.trim());
      const keywordList = response.data.map(item => item.keyword);
      navigation.navigate('GuesthouseList', {
        displayDate,
        guestCount: adultCount + childCount,
        keywordList,
      });
    } catch (e) {
      console.warn('키워드 검색 실패', e);
    }
  };

  // 큰 지역
  const renderRegionItem = (region) => (
    <TouchableOpacity
      key={region.name}
      style={[
        styles.regionItem,
        selectedRegion === region.name && styles.regionItemSelected,
      ]}
      onPress={() => handleRegionPress(region.name)}
    >
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.regionText,
          selectedRegion === region.name && styles.regionTextSelected,
        ]}
      >
        {region.name}
      </Text>
    </TouchableOpacity>
  );

  // 세부 지역
  const renderSubRegionItem = (subRegion) => (
    <TouchableOpacity
      key={subRegion}
      style={styles.subRegionItem}
      onPress={() => goToGuesthouseList(subRegion)}
    >
      {/* 이미지 대신 회색 박스 */}
      {subRegion === '제주전체' ? (
        <View style={styles.imagePlaceholder}>
          <AllIcon width={36} height={36} />
        </View>
      ) : (
        <View style={styles.EXimagePlaceholder} />
      )}
      <Text style={[FONTS.fs_14_medium, styles.subRegionText]}>{subRegion}</Text>
    </TouchableOpacity>
  );

  const currentSubRegions = regions.find(r => r.name === selectedRegion)?.subRegions || [];

  return (
    <View style={styles.container}>
      <Text style={[FONTS.fs_20_semibold, styles.headerText]}>게스트 하우스</Text>
      
      <View style={styles.searchBar}>
        <SearchIcon width={24} height={24} />
        <TextInput
            style={styles.searchInput}
            placeholder="찾는 숙소가 있으신가요?"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
        />
      </View>

      <View style={styles.selectRow}>
        <TouchableOpacity 
          style={styles.dateContainer}
          onPress={() => setDateGuestModalVisible(true)}
        >
          <CalendarIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.dateText]}>
            {displayDate}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personRoomContainer}
          onPress={() => setDateGuestModalVisible(true)}
        >
          <Person width={20} height={20} />
          <Text style={[FONTS.fs_14_medium, styles.personText]}>
            {childCount > 0
              ? `성인 ${adultCount}, 아동 ${childCount}`
              : `인원 ${adultCount}`
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* 지역 선택 */}
      <View style={styles.regionContainer}>
        <View style={styles.leftRegionList}>
            {regions.map(renderRegionItem)}
        </View>
        <View style={styles.rightSubRegionGrid}>
            {currentSubRegions.map(renderSubRegionItem)}
        </View>
      </View>

      {/* 인원, 날짜 선택 모달 */}
      <DateGuestModal
        visible={dateGuestModalVisible}
        onClose={() => setDateGuestModalVisible(false)}
        onApply={(checkIn, checkOut, adults, children) => {
          setAdultCount(adults);
          setChildCount(children);

          const formattedCheckIn = dayjs(checkIn).format('M.D dd');
          const formattedCheckOut = dayjs(checkOut).format('M.D dd');
          setDisplayDate(`${formattedCheckIn} - ${formattedCheckOut}`);

          setDateGuestModalVisible(false);
        }}
        initCheckInDate={dayjs().format("YYYY-MM-DD")}
        initCheckOutDate={dayjs().add(1,"day").format("YYYY-MM-DD")}
        initAdultGuestCount={adultCount}
        initChildGuestCount={childCount}
      />
    </View>
  );
};

export default GuesthouseSearch;
