import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import styles from './Home.styles';
import Banner from './Banner';
import Guesthouses from './Guesthouses';
import Employ from './Employs';
import TodayGuesthouses from './TodayGuesthouses';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import userEmployApi from '@utils/api/userEmployApi';
import adminApi from '@utils/api/adminApi';
import useUserStore from '@stores/userStore';
import {COLORS} from '@constants/colors';
import Meets from './Meets';
import userMeetApi from '@utils/api/userMeetApi';
import {FONTS} from '@constants/fonts';
import Loading from '@components/Loading';
import Header from '@components/Header';
import { trimJejuPrefix } from '@utils/formatAddress';

import SearchIcon from '@assets/images/search_gray.svg';
import GuesthouseIcon from '@assets/images/guesthouse_gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';

const TABS = [
  {key: 'MEET', label: '콘텐츠'},
  {key: 'STAY', label: '게하'},
  {key: 'EMPLOY', label: '스탭'},
];
const today = {key: 'TODAY', label: '오늘의 게스트하우스'};
const HomeMain = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const [guesthouseList, setGuesthouseList] = useState([]);
  const [employList, setEmployList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [bannerList, setBannerList] = useState([]);

  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);
  const [isBannerLoading, setIsBannerLoading] = useState(true);
  const [isMeetLoading, setIsMeetLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchedGuesthouses, setSearchedGuesthouses] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const userRole = useUserStore.getState()?.userRole;

  const scrollRef = useRef(null);
  const stayYRef = useRef(0);
  const employYRef = useRef(0);
  const meetYRef = useRef(0);
  const searchDebounceRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      tryFetchEmploys();
      tryFetchGuesthouses();
      tryFetchBanners();
      tryFetchMeets();
    }, []),
  );

  const tryFetchBanners = useCallback(async () => {
    try {
      const {data} = await adminApi.getAdminBanners();
      setBannerList(data || []);
    } catch (e) {
      console.warn('배너 조회 실패', e);
      setBannerList([]);
    } finally {
      setIsBannerLoading(false);
    }
  }, []);

  const tryFetchGuesthouses = useCallback(async () => {
    try {
      const {data} = await userGuesthouseApi.getPopularGuesthouses();
      setGuesthouseList(data.content || []);
    } catch (error) {
      console.warn('게스트하우스 조회 실패', error);
      setGuesthouseList([]);
    } finally {
      setIsGHLoading(false);
    }
  }, []);

  const tryFetchEmploys = useCallback(async () => {
    try {
      const response = await userEmployApi.getRecruits(
        {page: 0, size: 3},
        // userRole === 'USER',
      );
      setEmployList(response.data.content || []);
    } catch (error) {
      console.warn('공고 조회 실패', error);
      setEmployList([]);
    } finally {
      setIsEmLoading(false);
    }
  }, []);

  const tryFetchMeets = useCallback(async () => {
    try {
      const {data} = await userMeetApi.getPopularParties();
      const list = Array.isArray(data)
        ? data
        : data?.content || (data ? [data] : []);
      setEventList(list);
    } catch (error) {
      console.warn('이벤트 조회 실패', error);
      setEventList([]);
    } finally {
      setIsMeetLoading(false);
    }
  }, []);

  useEffect(() => {
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsSearchFocused(false);
    });

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      hideSub.remove();
    };
  }, []);

  const fetchGuesthouseByName = useCallback(async guesthouseName => {
    const trimmedName = guesthouseName.trim();
    if (!trimmedName) {
      setSearchedGuesthouses([]);
      return;
    }

    const requestId = Date.now();
    searchRequestIdRef.current = requestId;

    try {
      const {data} = await userGuesthouseApi.searchGuesthouseByName(trimmedName);
      const nextList = Array.isArray(data)
        ? data
        : data?.guesthouses ||
          data?.content ||
          data?.data ||
          (data ? [data] : []);

      if (searchRequestIdRef.current === requestId) {
        setSearchedGuesthouses(nextList);
      }
    } catch (error) {
      if (searchRequestIdRef.current === requestId) {
        setSearchedGuesthouses([]);
      }
      console.warn('게스트하우스 이름 검색 실패', error);
    }
  }, []);

  const handleChangeSearchKeyword = text => {
    setSearchKeyword(text);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!text.trim()) {
      setSearchedGuesthouses([]);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchGuesthouseByName(text);
    }, 300);
  };

  const scrollToY = y => {
    scrollRef.current?.scrollTo({y, animated: true});
  };

  const handleTabPress = tabKey => {
    if (tabKey === 'TODAY') {
      setActiveTab('TODAY');
      requestAnimationFrame(() => scrollToY(0));
      return;
    }

    setActiveTab(tabKey);

    requestAnimationFrame(() => {
      if (tabKey === 'MEET') scrollToY(meetYRef.current);
      if (tabKey === 'STAY') scrollToY(stayYRef.current);
      if (tabKey === 'EMPLOY') scrollToY(employYRef.current);
    });
  };

  const isSearchDropdownVisible = isSearchFocused && searchKeyword.trim().length > 0;

  const StickyHeader = (
    <View
      style={{
        backgroundColor: COLORS.grayscale_0,
        position: 'relative',
        zIndex: 30,
        elevation: 30,
      }}>
      <Header />

      <View style={styles.searchArea}>
        <View
          style={[
            styles.searchBox,
            isSearchDropdownVisible && styles.searchBoxConnected,
          ]}>
          <SearchIcon width={20} height={20} />
          <TextInput
            value={searchKeyword}
            onChangeText={handleChangeSearchKeyword}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="찾는 게하가 있으신가요?"
            placeholderTextColor={COLORS.grayscale_600}
            style={[FONTS.fs_14_regular, styles.searchInput]}
          />
        </View>

        {isSearchDropdownVisible && (
          <View style={styles.searchResultDropdown}>
            {searchedGuesthouses.length > 0 ? (
              <ScrollView
                nestedScrollEnabled
                style={styles.searchResultList}
                keyboardShouldPersistTaps="handled">
                {searchedGuesthouses.map((guesthouse, idx) => {
                  const name = guesthouse?.name || '';
                  const address = guesthouse?.address || '';
                  const key = guesthouse?.id || `guesthouse-${idx}`;

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.8}
                      onPress={() => {
                        const guesthouseId =
                          guesthouse?.id || guesthouse?.guesthouseId;
                        if (!guesthouseId) return;

                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        const formatDate = date =>
                          `${date.getFullYear()}-${String(
                            date.getMonth() + 1,
                          ).padStart(2, '0')}-${String(date.getDate()).padStart(
                            2,
                            '0',
                          )}`;

                        navigation.navigate('GuesthouseDetail', {
                          id: guesthouseId,
                          checkIn: formatDate(today),
                          checkOut: formatDate(tomorrow),
                          guestCount: 1,
                        });
                      }}
                      style={[
                        styles.searchResultItem,
                        idx === searchedGuesthouses.length - 1 &&
                          styles.searchResultItemLast,
                      ]}>
                      <View style={styles.searchResultLeftIcon}>
                        <GuesthouseIcon width={18} height={18} />
                      </View>
                      <View style={styles.searchResultContent}>
                        <Text
                          numberOfLines={1}
                          style={[FONTS.fs_14_semibold, styles.searchResultText]}>
                          {name}
                        </Text>
                        {!!address && (
                          <Text
                            numberOfLines={1}
                            style={[
                              FONTS.fs_12_medium,
                              styles.searchResultSubText,
                            ]}>
                            {trimJejuPrefix(address)}
                          </Text>
                        )}
                      </View>
                      <ChevronRight width={14} height={14}/>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={[FONTS.fs_14_regular, styles.searchResultEmptyText]}>
                일치하는 게스트하우스가 없어요.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 탭바 */}
      <View style={headerStyles.tabBar}>
        <View style={headerStyles.tabBarLeft}>
          {TABS.map(t => {
            const isActive = activeTab === t.key;

            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => handleTabPress(t.key)}
                activeOpacity={0.8}
                style={[headerStyles.tabBtn, isActive && headerStyles.tabBtnActive]}>
                <Text
                  style={[
                    headerStyles.tabText,
                    isActive && headerStyles.tabTextActive,
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          key={today.key}
          onPress={() => handleTabPress(today.key)}
          activeOpacity={0.8}
          style={[
            headerStyles.tabBtn,
            activeTab === today.key && headerStyles.tabBtnActive,
          ]}>
          <Text
            style={[
              headerStyles.tabText,
              activeTab === today.key && headerStyles.tabTextActive,
            ]}>
            {today.label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isBannerLoading || isEmLoading || isMeetLoading || isGHLoading) {
    return <Loading />;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {StickyHeader}
        {activeTab === 'TODAY' ? (
          <View style={styles.boxContainer}>
            <TodayGuesthouses />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.container}
            showsVerticalScrollIndicator={false}>
            <>
              {/* 이벤트(콘텐츠) 섹션 */}
              <View
                onLayout={e => {
                  meetYRef.current = e.nativeEvent.layout.y;
                }}
                style={styles.boxContainer}>
                <Meets events={eventList} setEventList={setEventList} />
              </View>

              {/* 배너 */}
              <View style={styles.boxContainer}>
                <Banner banners={bannerList} />
              </View>

              {/* 숙박 섹션 */}
              <View
                onLayout={e => {
                  stayYRef.current = e.nativeEvent.layout.y;
                }}
                style={styles.boxContainer}>
                <Guesthouses guesthouses={guesthouseList} />
              </View>

              {/* 채용 섹션 */}
              <View
                onLayout={e => {
                  employYRef.current = e.nativeEvent.layout.y;
                }}
                style={styles.boxContainer}>
                <Employ jobs={employList} setEmployList={setEmployList} />
              </View>
            </>
          </ScrollView>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeMain;

const headerStyles = {
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    paddingHorizontal: 20,
    gap: 20,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  tabBarLeft: {
    flexDirection: 'row',
    gap: 20,
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary_orange,
  },
  tabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
};
