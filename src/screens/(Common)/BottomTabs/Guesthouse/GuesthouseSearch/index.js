import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import SearchIcon from '@assets/images/search_gray.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import Person from '@assets/images/person20_gray.svg';
import GuesthouseIcon from '@assets/images/guesthouse_gray.svg';
import AllIcon from '@assets/images/wlogo_blue_left.svg';
import JejuEast from '@assets/images/regions/jeju/jeju_east.svg';
import JejuWest from '@assets/images/regions/jeju/jeju_west.svg';
import JejuSouth from '@assets/images/regions/jeju/jeju_south.svg';
import JejuNorth from '@assets/images/regions/jeju/jeju_north.svg';

import styles from './GuesthouseSearch.styles';
import {FONTS} from '@constants/fonts';
import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import DateGuestModal from '@components/modals/Guesthouse/DateGuestModal';
import {COLORS} from '@constants/colors';
import {regions} from '@data/filter';

// 임시 게하
const mockGuesthouseResults = [
  // '제주 WA 게스트하우스',
  // '제주 WB 게스트하우스',
  // '제주 WC 게스트하우스',
];

const regionIcons = {
  제주전체: AllIcon,
  제주북부: JejuNorth,
  제주동부: JejuEast,
  제주남부: JejuSouth,
  제주서부: JejuWest,
};

const GuesthouseSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // 지역 선택
  const [selectedRegion, setSelectedRegion] = useState(regions[0].name);
  // 검색어 입력
  const [searchTerm, setSearchTerm] = useState(route.params?.searchText || '');
  // 키워드 검색 결과
  const [keywordResults, setKeywordResults] = useState([]); 

  // 선택 날짜, 인원 출력
  const [displayDate, setDisplayDate] = useState('');
  const [adultCount, setAdultCount] = useState(1); // 기본 1명
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

  // 리스트에서 날짜, 인원값 변경해서 뒤로가기
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.displayDate) {
        setDisplayDate(route.params.displayDate);
        setAdultCount(route.params.adultCount);
        setChildCount(route.params.childCount);
      }
    }, [route.params]),
  );

  // 게하 리스트 페이지로 지역 선택해서 이동
  const goToGuesthouseList = (regionIds, regionName) => {
    navigation.navigate('GuesthouseList', {
      displayDate,
      adultCount,
      childCount,
      regionIds,
      searchText: regionName,
    });
  };

  // 검색어 검색 (지역 키워드 호출)
  const handleSearch = async () => {
    try {
      const response = await userGuesthouseApi.searchGuesthouseByKeyword(
        searchTerm.trim(),
      );
      setKeywordResults(response.data);
    } catch (e) {
      console.warn('키워드 검색 실패', e);
    }
  };

  // 큰 지역 전환
  const handleRegionPress = regionName => {
    setSelectedRegion(regionName);
  };

  // 큰 지역
  const renderRegionItem = region => (
    <TouchableOpacity
      key={region.name}
      style={[
        styles.regionItem,
        selectedRegion === region.name && styles.regionItemSelected,
      ]}
      onPress={() => handleRegionPress(region.name)}>
      <Text
        style={[
          FONTS.fs_14_medium,
          styles.regionText,
          selectedRegion === region.name && styles.regionTextSelected,
        ]}>
        {region.name}
      </Text>
    </TouchableOpacity>
  );

  // 세부 지역
  const renderSubRegionItem = subRegion => {
    const IconComponent = regionIcons[subRegion.name];
    const isAll = subRegion.name === '제주전체';

    return(
      <TouchableOpacity
        key={subRegion.name}
        style={styles.subRegionItem}
        onPress={() => goToGuesthouseList(subRegion.regionIds, subRegion.name)}>
        {isAll ? (
          <View style={styles.imagePlaceholder}>
            <AllIcon width={36} height={36} />
          </View>
        ) : (
          <View style={styles.regionImgPlaceholder}>
            <IconComponent width={50} height={50} />
          </View>
        )}
        <Text style={[FONTS.fs_14_medium, styles.subRegionText]}>
          {subRegion.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentSubRegions =
    regions.find(r => r.name === selectedRegion)?.subRegions || [];

  // 검색어 입력시
  const renderSearchResults = () => (
    <View style={styles.searchResultContainer}>
      {mockGuesthouseResults.length > 0 && (
        <View style={styles.searchResultSection}>
          {mockGuesthouseResults.map((name, idx) => (
            <TouchableOpacity key={idx} style={styles.searchResultRow}>
              <View style={styles.resultIconBox}>
                <GuesthouseIcon width={24} height={24} />
              </View>
              <Text style={[FONTS.fs_14_medium]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {mockGuesthouseResults.length > 0 && (
        <View style={styles.searchResultDivider} />
      )}

      <View style={styles.searchResultSection}>
        {keywordResults.map(({ id, keyword }) => (
          <TouchableOpacity
            key={id}
            style={styles.searchResultRow}
            onPress={() =>
              navigation.navigate('GuesthouseList', {
                displayDate,
                adultCount,
                childCount,
                keyword: { id, keyword },
                searchText: keyword,
              })
            }>
            <View style={styles.resultIconBox}>
              <SearchIcon width={24} height={24} />
            </View>
            <Text style={[FONTS.fs_14_medium]}>{keyword}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={[FONTS.fs_20_semibold, styles.headerText]}>
          게스트 하우스
        </Text>

        {/* 검색하면 2개 api 호출 키워드 검색, 지역 검색 */}
        <View style={styles.searchBar}>
          <SearchIcon width={24} height={24} />
          <TextInput
            style={styles.searchInput}
            // placeholder="찾는 숙소가 있으신가요?"
            placeholder="찾는 지역이 있으신가요?"
            placeholderTextColor={COLORS.grayscale_600}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        <View style={styles.selectRow}>
          <TouchableOpacity
            style={styles.dateContainer}
            onPress={() => setDateGuestModalVisible(true)}>
            <CalendarIcon width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.dateText]}>
              {displayDate}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.personRoomContainer}
            onPress={() => setDateGuestModalVisible(true)}>
            <Person width={20} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.personText]}>
              {childCount > 0
                ? `성인 ${adultCount}, 아동 ${childCount}`
                : `인원 ${adultCount}`}
            </Text>
          </TouchableOpacity>
        </View>

        {searchTerm.trim() === '' ? (
          // 지역 선택
          // 지역 누르면 지역 번호로 바로 이동
          <View style={styles.regionContainer}>
            <View style={styles.leftRegionList}>
              {regions.map(renderRegionItem)}
            </View>
            <View style={styles.rightSubRegionGrid}>
              {currentSubRegions.map(renderSubRegionItem)}
            </View>
          </View>
        ) : (
          // 검색어 입력 후
          renderSearchResults()
        )}

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
          initCheckInDate={dayjs().format('YYYY-MM-DD')}
          initCheckOutDate={dayjs().add(1, 'day').format('YYYY-MM-DD')}
          initAdultGuestCount={adultCount}
          initChildGuestCount={childCount}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default GuesthouseSearch;
