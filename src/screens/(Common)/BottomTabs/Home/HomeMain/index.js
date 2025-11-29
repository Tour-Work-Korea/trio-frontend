import React, {useCallback, useRef, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

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

const TABS = [
  {key: 'STAY', label: '게하'},
  {key: 'MEET', label: '이벤트'},
  {key: 'EMPLOY', label: '스탭'},
  {key: 'TODAY', label: '오늘의 게스트하우스'},
];

const HomeMain = () => {
  const [activeTab, setActiveTab] = useState('TODAY');

  const [guesthouseList, setGuesthouseList] = useState([]);
  const [employList, setEmployList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [bannerList, setBannerList] = useState([]);

  const [isGHLoading, setIsGHLoading] = useState(true);
  const [isEmLoading, setIsEmLoading] = useState(true);
  const [isBannerLoading, setIsBannerLoading] = useState(true);
  const [isMeetLoading, setIsMeetLoading] = useState(true);

  const userRole = useUserStore.getState()?.userRole;

  const scrollRef = useRef(null);
  const stayYRef = useRef(0);
  const employYRef = useRef(0);
  const meetYRef = useRef(0);

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
      setGuesthouseList(data || []);
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
        userRole === 'USER',
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
      const response = await userMeetApi.searchParties({
        page: 0,
        size: 3,
        sortBy: 'RECOMMEND',
      });
      setEventList(response.data.content || []);
    } catch (error) {
      console.warn('이벤트 조회 실패', error);
      setEventList([]);
    } finally {
      setIsMeetLoading(false);
    }
  }, []);

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
      if (tabKey === 'STAY') scrollToY(stayYRef.current);
      if (tabKey === 'EMPLOY') scrollToY(employYRef.current);
      if (tabKey === 'MEET') scrollToY(meetYRef.current);
    });
  };

  const StickyHeader = (
    <View style={{backgroundColor: COLORS.grayscale_0}}>
      {/* 배너 */}
      <View style={styles.boxContainer}>
        <Banner banners={bannerList} />
      </View>

      {/* 탭바 */}
      <View style={headerStyles.tabBar}>
        {TABS.map(t => {
          const isActive = activeTab === t.key;

          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => handleTabPress(t.key)}
              activeOpacity={0.8}
              style={headerStyles.tabBtn}>
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
    </View>
  );

  if (isBannerLoading || isEmLoading || isMeetLoading || isGHLoading) {
    return <Loading />;
  }
  return (
    <View style={styles.container}>
      {StickyHeader}{' '}
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

            {/* 이벤트(이벤트) 섹션 */}
            <View
              onLayout={e => {
                meetYRef.current = e.nativeEvent.layout.y;
              }}
              style={styles.boxContainer}>
              <Meets events={eventList} setEventList={setEventList} />
            </View>
          </>
        </ScrollView>
      )}
    </View>
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
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.grayscale_900,
  },
};
