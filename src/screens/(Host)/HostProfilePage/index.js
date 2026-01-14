import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './HostProfilePage.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header';

import HostProfileEvents from './HostProfileEvents';
import HostProfileStaff from './HostProfileStaff';
import HostProfileReviews from './HostProfileReviews';

import MapIcon from '@assets/images/map_blue';
import BackBtn from '@assets/images/chevron_left_white';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

const TAB = {
  EVENTS: '이벤트 목록',
  STAFF: '스탭 공고',
  REVIEWS: '리뷰',
};

const HostProfilePage = () => {
  const navigation = useNavigation();

  const [selectedTab, setSelectedTab] = useState(TAB.EVENTS);

  // ✅ 임시 데이터 (나중에 API 붙이면 여기만 교체하면 됨)
  const host = useMemo(
    () => ({
      name: '이상한밤 게스트하우스',
      intro:
        '잔잔하고 따뜻한 소규모 게스트하우스 ‘이상한밤’ 입니다.\n처음 만난 사람들과도 나눌 수 있는 또 다른 즐거움,\n이야깃거리가 되는 소소한 이벤트들을 통해 서로가 조금 더 편해지는 새로운 공간을 만들어가고 있습니다.',
      address: '제주시 흥운길 25-7 1층',
      photoUrl: null,
    }),
    [],
  );
  const hasHeaderImage = Boolean(host?.photoUrl);

  const renderHeaderContent = () => (
    <>
      {hasHeaderImage && <View style={styles.headerOverlay} />}

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <BackBtn width={28} height={28}/>
      </TouchableOpacity>

      {/* 프로필 영역 */}
      <View style={styles.profileWrap}>
        <Text style={[FONTS.fs_20_bold, styles.guesthouseNameText]}>
          이상한밤 게스트하우스
        </Text>

        <View style={styles.profileImageWrap}>
          {host.photoUrl ? (
            <Image
              source={{uri: host.photoUrl}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage}>
              <EmptyImage width={32} height={32} />
            </View>
          )}
        </View>

        <Text style={[FONTS.fs_16_semibold, styles.hostNameText]}>
          호스트 이름
        </Text>
      </View>
    </>
  );

  const handlePressReservation = () => {
    // 예: navigation.navigate('GuesthouseReservation', { guesthouseId: ... })
    // navigation.navigate('GuesthouseReservation');
  };

  const renderTabContent = () => {
    return (
      <View style={styles.tabContentWrapper}>
        {selectedTab === TAB.EVENTS && <HostProfileEvents />}
        {selectedTab === TAB.STAFF && <HostProfileStaff />}
        {selectedTab === TAB.REVIEWS && <HostProfileReviews />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 상단 배경 */}
        {hasHeaderImage ? (
          <ImageBackground
            source={{uri: host.photoUrl}}
            style={styles.headerBg}
            resizeMode="cover">
            {renderHeaderContent()}
          </ImageBackground>
        ) : (
          <View style={[styles.headerBg, styles.headerBgFallback]}>
            {renderHeaderContent()}
          </View>
        )}

        {/* 소개/주소 */}
        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>소개</Text>
            <Text style={[FONTS.fs_14_semibold, styles.introText]}>
              {host.intro}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <MapIcon width={20} height={20}/>
            <Text style={[FONTS.fs_14_regular, styles.addressText]}>
              {host.address}
            </Text>
          </View>

          <ButtonWhite
            title='숙소 예약하러 가기'
            onPress={handlePressReservation}
            backgroundColor={COLORS.primary_blue}
            textColor={COLORS.grayscale_0}
          />
        </View>

        {/* 탭 바 */}
        <View style={styles.tabBar}>
          {Object.values(TAB).map(tab => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                style={[
                  styles.tabItem,
                  isActive && styles.tabItemActive,
                ]}
                onPress={() => setSelectedTab(tab)}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}>
                  {tab}
                </Text>
                {isActive ? <View style={styles.tabIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 탭 내용 */}
        <View>{renderTabContent()}</View>
      </ScrollView>
    </View>
  );
};

export default HostProfilePage;
