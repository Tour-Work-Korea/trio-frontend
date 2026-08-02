import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  InteractionManager,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  // TextInput,
  // TouchableWithoutFeedback,
  // Keyboard,
  // Pressable,
  Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';

import styles from './Home.styles';
import Banner from './Banner';
import Guesthouses from './Guesthouses';
// 오늘의 게하 관련: 나중에 홈 탭 복구할 때 다시 사용
// import TodayGuesthouses from './TodayGuesthouses';
import RecentGuesthouses from './RecentGuesthouses';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';
import adminApi from '@utils/api/adminApi';
import {COLORS} from '@constants/colors';
import Meets from './Meets';
import userMeetApi from '@utils/api/userMeetApi';
import {getRecentGuesthouses} from '@utils/recentGuesthouses';
import {getDefaultGuesthouseListParams} from '@constants/guesthouseDefaults';
import {FONTS} from '@constants/fonts';
import Header from '@components/Header';
import AppInstallPromptModal from '@components/modals/AppInstallPromptModal';
import {prefetchImageUrls} from '@components/AppImage';
import {getStoreUrlForWebDevice} from '@utils/webOpenApp';
import useUserStore from '@stores/userStore';
import notificationApi from '@utils/api/notificationApi';
import {isUserNotification} from '@utils/notifications';
// import {trimJejuPrefix} from '@utils/formatAddress';

import SearchIcon from '@assets/images/search_gray.svg';
import LogoOrange from '@assets/images/logo_orange.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import CategoryFood from '@assets/images/category_food.svg';
import CategoryReading from '@assets/images/category_reading.svg';
import CategoryDinnerParty from '@assets/images/category_dinner_party.svg';
import CategoryProgram from '@assets/images/category_program.svg';
import CategoryRelax from '@assets/images/category_relax.svg';
import JejuAirplane from '@assets/images/jeju_airplane.svg';
// import GuesthouseIcon from '@assets/images/guesthouse_gray.svg';
// import ChevronRight from '@assets/images/chevron_right_gray.svg';

// 홈 탭 관련: 나중에 탭 UI 복구할 때 다시 사용
// const TABS = [
//   // {key: 'MEET', label: '콘텐츠'},
//   // {key: 'STAY', label: '게하'},
//   // 임시
//   {key: 'STAY', label: '게하'},
//   {key: 'MEET', label: '콘텐츠'},
// ];

// 오늘의 게하 관련: 나중에 홈 탭 복구할 때 다시 사용
// const today = {key: 'TODAY', label: '오늘의 게스트하우스'};
const GUESTHOUSE_CATEGORIES = [
  {key: 'food', label: '포틀럭', Icon: CategoryFood},
  {key: 'reading', label: '독서', Icon: CategoryReading},
  {key: 'dinnerParty', label: '디너파티', Icon: CategoryDinnerParty},
  {key: 'program', label: '프로그램', Icon: CategoryProgram},
  {key: 'relax', label: '쉼', Icon: CategoryRelax},
];
const mainPageBannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-6098454400067335/4619471702',
      android: 'ca-app-pub-6098454400067335/5920208998',
      web: 'ca-pub-6098454400067335/4250943648',
    });
const HOME_AGREEMENT_LINKS = [
  {id: 'TERMS_OF_SERVICE', label: '서비스 이용약관'},
  {id: 'PRIVACY_POLICY', label: '개인정보 처리방침'},
];
const HOME_DATA_CACHE_TTL_MS = 60 * 1000;
const HOME_TAB_BAR_STYLE = Platform.OS === 'android'
  ? {
      position: 'relative',
      backgroundColor: COLORS.grayscale_0,
      height: 64,
      paddingTop: 6,
      paddingBottom: 6,
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.grayscale_200,
    }
  : {
      position: 'relative',
      backgroundColor: COLORS.grayscale_0,
      height: 84,
      paddingTop: 6,
      paddingBottom: 18,
      paddingHorizontal: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: COLORS.grayscale_200,
    };
const BUSINESS_INFO = [
  '상호명 : 워커웨이',
  '사업자등록번호: 888-25-02003',
  '연락처: 010-4123-0075',
  '통신판매번호: 2025-서울양천-0825',
  '주소: 제주시 연동 263-13 레지던스이타스3',
  '대표자 : 이하늘, 정재원',
];

const getBannerImageUrl = item =>
  item?.url
  ?? item?.adminImageUrl
  ?? item?.imageUrl
  ?? item?.bannerImageUrl
  ?? item?.thumbnailUrl;

const extractNotificationItems = data =>
  Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

const HomeMain = () => {
  const navigation = useNavigation();
  const accessToken = useUserStore(state => state.accessToken);
  // 홈 탭 관련: 나중에 탭 UI 복구할 때 다시 사용
  // const [activeTab, setActiveTab] = useState(TABS[0].key);

  const [guesthouseList, setGuesthouseList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [bannerList, setBannerList] = useState([]);
  const [recentGuesthouseList, setRecentGuesthouseList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isBannerLoading, setIsBannerLoading] = useState(true);
  const [isMeetLoading, setIsMeetLoading] = useState(true);
  const [shouldRenderAdBanner, setShouldRenderAdBanner] = useState(false);
  const [isAppInstallPromptVisible, setIsAppInstallPromptVisible] =
    useState(false);
  // const [searchKeyword, setSearchKeyword] = useState('');
  // const [searchedGuesthouses, setSearchedGuesthouses] = useState([]);
  // const [isSearchFocused, setIsSearchFocused] = useState(false);

  const scrollRef = useRef(null);
  const stayYRef = useRef(0);
  const meetYRef = useRef(0);
  const isFetchingHomeDataRef = useRef(false);
  const lastHomeDataFetchAtRef = useRef(0);
  // const searchDebounceRef = useRef(null);
  // const searchRequestIdRef = useRef(0);

  // const dismissSearchUI = useCallback(() => {
  //   Keyboard.dismiss();
  //   setIsSearchFocused(false);
  // }, []);

  const tryFetchBanners = useCallback(async () => {
    try {
      const {data} = await adminApi.getAdminBanners();
      const list = data || [];
      setBannerList(list);
      prefetchImageUrls(list.map(getBannerImageUrl), {limit: 3});
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
      const list = data.content || [];
      setGuesthouseList(list);
      prefetchImageUrls(list.map(item => item.thumbnailUrl), {limit: 6});
    } catch (error) {
      console.warn('게스트하우스 조회 실패', error);
      setGuesthouseList([]);
    } finally {
      setIsGHLoading(false);
    }
  }, []);

  const tryFetchMeets = useCallback(async () => {
    try {
      const {data} = await userMeetApi.getPopularParties();
      const list = Array.isArray(data)
        ? data
        : data?.content || (data ? [data] : []);
      setEventList(list);
      prefetchImageUrls(list.map(item => item.partyImageUrl), {limit: 4});
    } catch (error) {
      console.warn('콘텐츠 조회 실패', error);
      setEventList([]);
    } finally {
      setIsMeetLoading(false);
    }
  }, []);

  const tryLoadRecentGuesthouses = useCallback(async () => {
    try {
      const list = await getRecentGuesthouses();
      setRecentGuesthouseList(list);
      prefetchImageUrls(list.map(item => item.thumbnailUrl), {limit: 6});
    } catch (error) {
      console.warn('최근 본 게하 조회 실패', error);
      setRecentGuesthouseList([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({tabBarStyle: HOME_TAB_BAR_STYLE});

      const now = Date.now();
      const hasFreshHomeData =
        lastHomeDataFetchAtRef.current > 0 &&
        now - lastHomeDataFetchAtRef.current < HOME_DATA_CACHE_TTL_MS;

      if (!hasFreshHomeData && !isFetchingHomeDataRef.current) {
        isFetchingHomeDataRef.current = true;
        lastHomeDataFetchAtRef.current = now;

        Promise.allSettled([
          tryFetchGuesthouses(),
          tryFetchBanners(),
          tryFetchMeets(),
        ]).finally(() => {
          isFetchingHomeDataRef.current = false;
        });
      }

      tryLoadRecentGuesthouses();
    }, [
      navigation,
      tryFetchBanners,
      tryFetchGuesthouses,
      tryFetchMeets,
      tryLoadRecentGuesthouses,
    ]),
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!accessToken) {
        setUnreadCount(0);
        return () => {
          isActive = false;
        };
      }

      const fetchUnreadCount = async () => {
        try {
          const {data} = await notificationApi.getMyNotifications(0, 100);

          if (isActive) {
            setUnreadCount(
              extractNotificationItems(data).filter(
                item => isUserNotification(item) && !item?.isRead,
              ).length,
            );
          }
        } catch (error) {
          if (isActive) {
            console.warn('홈 알림 조회 실패:', error);
            setUnreadCount(0);
          }
        }
      };

      fetchUnreadCount();

      return () => {
        isActive = false;
      };
    }, [accessToken]),
  );

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setShouldRenderAdBanner(true);
    });

    return () => {
      handle.cancel?.();
    };
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (searchDebounceRef.current) {
  //       clearTimeout(searchDebounceRef.current);
  //     }
  //   };
  // }, []);

  // const fetchGuesthouseByName = useCallback(async guesthouseName => {
  //   const trimmedName = guesthouseName.trim();
  //   if (!trimmedName) {
  //     setSearchedGuesthouses([]);
  //     return;
  //   }

  //   const requestId = Date.now();
  //   searchRequestIdRef.current = requestId;

  //   try {
  //     const {data} = await userGuesthouseApi.searchGuesthouseByName(trimmedName);
  //     const nextList = Array.isArray(data)
  //       ? data
  //       : data?.guesthouses ||
  //         data?.content ||
  //         data?.data ||
  //         (data ? [data] : []);

  //     if (searchRequestIdRef.current === requestId) {
  //       setSearchedGuesthouses(nextList);
  //     }
  //   } catch (error) {
  //     if (searchRequestIdRef.current === requestId) {
  //       setSearchedGuesthouses([]);
  //     }
  //     console.warn('게스트하우스 이름 검색 실패', error);
  //   }
  // }, []);

  // const handleChangeSearchKeyword = text => {
  //   setSearchKeyword(text);

  //   if (searchDebounceRef.current) {
  //     clearTimeout(searchDebounceRef.current);
  //   }

  //   if (!text.trim()) {
  //     setSearchedGuesthouses([]);
  //     return;
  //   }

  //   searchDebounceRef.current = setTimeout(() => {
  //     fetchGuesthouseByName(text);
  //   }, 300);
  // };

  const handlePressSearchBox = () => {
    navigation.navigate('지도', {
      screen: 'GuesthouseList',
      params: {
        ...getDefaultGuesthouseListParams(),
        initialMapView: false,
      },
    });
  };

  const handlePressCategory = category => {
    navigation.navigate('지도', {
      screen: 'GuesthouseList',
      params: {
        ...getDefaultGuesthouseListParams(),
        initialMapView: false,
        categoryTags: [category.label],
        fromHomeCategory: true,
      },
    });
  };

  const handlePressAgreement = agreement => {
    navigation.navigate('AgreeDetail', {
      id: agreement.id,
      who: 'USER',
      headerTitle: agreement.label,
    });
  };

  const handlePressStaffNoticeBanner = () => {
    navigation.navigate('커뮤니티', {tab: 'STAFF'});
  };

  const handlePressAppDownload = () => {
    const storeUrl = getStoreUrlForWebDevice();

    if (storeUrl) {
      window.location.assign(storeUrl);
      return;
    }

    setIsAppInstallPromptVisible(true);
  };

  // 홈 탭 관련: 나중에 탭 UI 복구할 때 다시 사용
  // const scrollToY = y => {
  //   scrollRef.current?.scrollTo({y, animated: true});
  // };

  // 홈 탭/오늘의 게하 관련: 나중에 탭 UI 복구할 때 다시 사용
  // const handleTabPress = tabKey => {
  //   if (tabKey === 'TODAY') {
  //     setActiveTab('TODAY');
  //     requestAnimationFrame(() => scrollToY(0));
  //     return;
  //   }

  //   setActiveTab(tabKey);

  //   requestAnimationFrame(() => {
  //     if (tabKey === 'MEET') scrollToY(meetYRef.current);
  //     if (tabKey === 'STAY') scrollToY(stayYRef.current);
  //   });
  // };

  // const isSearchDropdownVisible = isSearchFocused && searchKeyword.trim().length > 0;

  const StickyHeader = (
    <View
      style={{
        backgroundColor: COLORS.grayscale_0,
        position: 'relative',
        zIndex: 30,
        elevation: Platform.OS === 'android' ? 0 : 30,
      }}>
      {Platform.OS === 'web' ? (
        <View style={webDownloadStyles.container}>
          <View style={webDownloadStyles.appIcon}>
            <LogoOrange width={36} height={36} />
          </View>
          <View style={webDownloadStyles.textContainer}>
            <Text
              numberOfLines={1}
              style={[FONTS.fs_14_semibold, webDownloadStyles.title]}>
              게딱지(게스트하우스 딱, 지금!)
            </Text>
            <Text
              numberOfLines={1}
              style={[FONTS.fs_12_medium, webDownloadStyles.description]}>
              지금 회원가입 시 20% 할인 쿠폰 제공
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePressAppDownload}
            style={webDownloadStyles.button}>
            <Text style={[FONTS.fs_14_semibold, webDownloadStyles.buttonText]}>
              다운로드
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <Header
        rightComponent={
          accessToken ? (
            <TouchableOpacity
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="알림함"
              style={styles.notificationButton}
              onPress={() => navigation.navigate('NotificationCenter')}>
              <BellIcon width={18} height={18} />
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.searchArea}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePressSearchBox}
          style={[
            styles.searchBox,
            Platform.OS === 'android' && styles.searchBoxAndroid,
            // isSearchDropdownVisible && styles.searchBoxConnected,
          ]}>
          <SearchIcon width={20} height={20} />
          {/* <TextInput
            value={searchKeyword}
            onChangeText={handleChangeSearchKeyword}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="찾는 게하가 있으신가요?"
            placeholderTextColor={COLORS.grayscale_600}
            style={[
              FONTS.fs_14_regular,
              styles.searchInput,
              Platform.OS === 'android' && styles.searchInputAndroid,
            ]}
            returnKeyType="search"
          /> */}
          <Text
            style={[
              FONTS.fs_14_regular,
              styles.searchInput,
              styles.searchPlaceholder,
              Platform.OS === 'android' && styles.searchInputAndroid,
            ]}>
            찾는 게하가 있으신가요?
          </Text>
        </TouchableOpacity>

        {/* {isSearchDropdownVisible && (
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
                      activeOpacity={1}
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
        )} */}
      </View>

      {/* 홈 탭/오늘의 게하 관련: 나중에 탭 UI 복구할 때 다시 사용 */}
      {/* <View style={headerStyles.tabBar}>
          <View style={headerStyles.tabBarLeft}>
            {TABS.map(t => {
              const isActive = activeTab === t.key;

              return (
                <TouchableOpacity
                  activeOpacity={1}
                  key={t.key}
                  onPress={() => handleTabPress(t.key)}
                  style={[
                    headerStyles.tabBtn,
                    isActive && headerStyles.tabBtnActive,
                  ]}>
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
            activeOpacity={1}
            key={today.key}
            onPress={() => handleTabPress(today.key)}
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
        </View> */}
    </View>
  );

  return (
    // <TouchableWithoutFeedback onPress={dismissSearchUI} accessible={false}>
    <View style={styles.container}>
      {StickyHeader}
      {/* 오늘의 게하 관련: 나중에 홈 탭 복구할 때 다시 사용 */}
      {/* {activeTab === 'TODAY' ? (
          // <Pressable style={styles.todayContainer} onPress={dismissSearchUI}>
          <View style={styles.todayContainer}>
            <TodayGuesthouses />
          </View>
        ) : ( */}
      <ScrollView
        ref={scrollRef}
        style={[styles.container, styles.verticalScroll]}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled
        nestedScrollEnabled
        alwaysBounceHorizontal={false}
        overScrollMode="never"
        decelerationRate="normal"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // onScrollBeginDrag={dismissSearchUI}
      >
        <>
          <View style={styles.categoryContainer}>
            {GUESTHOUSE_CATEGORIES.map(category => {
              const {Icon} = category;

              return (
                <TouchableOpacity
                  key={category.key}
                  activeOpacity={0.8}
                  onPress={() => handlePressCategory(category)}
                  style={styles.categoryButton}>
                  <View style={styles.categoryImageBox}>
                    <Icon width={30} height={30} />
                  </View>
                  <Text style={[FONTS.fs_12_medium, styles.categoryText]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 배너 */}
          {!isBannerLoading && (
            <View style={styles.boxContainer}>
              <Banner banners={bannerList} />
            </View>
          )}

          {/* 임시 */}
          {!isGHLoading && (
            <View
              onLayout={e => {
                stayYRef.current = e.nativeEvent.layout.y;
              }}
              style={styles.boxContainer}>
              <Guesthouses guesthouses={guesthouseList} />
            </View>
          )}
          {/* 콘텐츠 섹션 */}
          {/* <View
                onLayout={e => {
                  meetYRef.current = e.nativeEvent.layout.y;
                }}
                style={styles.boxContainer}>
                <Meets events={eventList} setEventList={setEventList} />
              </View> */}

          {/* 제주 한달살기 공고 배너 시작: 필요 없을 때 이 블록과 관련 스타일을 삭제해주세요. */}
          <View style={styles.boxContainer}>
            <View style={styles.staffNoticeBanner}>
              <View style={styles.staffNoticeBannerLeft}>
                <JejuAirplane width={14} height={14} />
                <Text
                  style={[FONTS.fs_14_semibold, styles.staffNoticeTitle]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}>
                  제주 <Text style={styles.staffNoticeHighlight}>한달살기</Text>{' '}
                  어때?
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.staffNoticeButton}
                onPress={handlePressStaffNoticeBanner}>
                <Text style={styles.staffNoticeButtonText}>
                  모집 중인 스탭 공고 보러가기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* 제주 한달살기 공고 배너 끝 */}

          <View style={styles.boxContainer}>
            <RecentGuesthouses guesthouses={recentGuesthouseList} />
          </View>

          {/* 숙박 섹션 */}
          {/* <View
                onLayout={e => {
                  stayYRef.current = e.nativeEvent.layout.y;
                }}
                style={styles.boxContainer}>
                <Guesthouses guesthouses={guesthouseList} />
              </View> */}

          {/* 임시 */}
          {!isMeetLoading && (
            <View
              onLayout={e => {
                meetYRef.current = e.nativeEvent.layout.y;
              }}
              style={styles.boxContainer}>
              <Meets events={eventList} setEventList={setEventList} />
            </View>
          )}

          {shouldRenderAdBanner && mainPageBannerAdUnitId && (
            <View style={styles.adBannerContainer}>
              <BannerAd
                unitId={mainPageBannerAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              />
            </View>
          )}

          <View style={styles.footerContainer}>
            <View style={styles.businessInfoContainer}>
              {BUSINESS_INFO.map(info => (
                <Text key={info} style={styles.businessInfoText}>
                  {info}
                </Text>
              ))}
            </View>

            <View style={styles.agreementLinkRow}>
              {HOME_AGREEMENT_LINKS.map((agreement, index) => (
                <React.Fragment key={agreement.id}>
                  {index > 0 && <View style={styles.agreementDivider} />}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePressAgreement(agreement)}>
                    <Text style={styles.agreementLinkText}>
                      {agreement.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        </>
      </ScrollView>
      {Platform.OS === 'web' ? (
        <AppInstallPromptModal
          visible={isAppInstallPromptVisible}
          onClose={() => setIsAppInstallPromptVisible(false)}
          title="게딱지 앱 다운로드"
          message="스토어 QR 코드를 휴대폰으로 스캔해 주세요."
          buttonText="다운로드"
        />
      ) : null}
      {/* )} */}
    </View>
    // </TouchableWithoutFeedback>
  );
};

export default HomeMain;

const webDownloadStyles = StyleSheet.create({
  container: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: COLORS.grayscale_900,
    lineHeight: 20,
  },
  description: {
    marginTop: 2,
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary_orange,
  },
  buttonText: {
    color: COLORS.grayscale_0,
  },
});

// 홈 탭/오늘의 게하 관련: 나중에 탭 UI 복구할 때 다시 사용
// const headerStyles = {
//   tabBar: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.grayscale_200,
//     paddingHorizontal: 20,
//     gap: 20,
//     justifyContent: 'space-between',
//     position: 'relative',
//     zIndex: 1,
//     elevation: Platform.OS === 'android' ? 0 : 1,
//   },
//   tabBarLeft: {
//     flexDirection: 'row',
//     gap: 20,
//   },
//   tabBtn: {
//     alignItems: 'center',
//     paddingVertical: 12,
//     position: 'relative',
//     borderBottomWidth: 2,
//     borderBottomColor: 'transparent',
//   },
//   tabBtnActive: {
//     borderBottomColor: COLORS.primary_orange,
//   },
//   tabText: {
//     ...FONTS.fs_14_semibold,
//     color: COLORS.grayscale_500,
//   },
//   tabTextActive: {
//     color: COLORS.primary_orange,
//   },
// };
