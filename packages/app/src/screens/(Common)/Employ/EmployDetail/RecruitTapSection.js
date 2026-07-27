import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import dayjs from 'dayjs';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ImageModal from '@components/modals/ImageModal';
import AppImage from '@components/AppImage';
import useSwipeTabs from '@hooks/useSwipeTabs';
import {formatLocalDateTimeToDotAndTime} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';
import HomeIcon from '@assets/images/home_white_filled.svg';
import ChevroRight from '@assets/images/chevron_right_blue.svg';

const recruitTabs = ['모집조건', '근무조건', '근무 정보'];
const recruitTabItems = recruitTabs.map(tab => ({key: tab}));

export default function RecruitTapSection({recruit}) {
  const navigation = useNavigation();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(0);
  const [imageSourceRect, setImageSourceRect] = useState(null);
  const imageSourceRefs = useRef(new Map());
  const measureImageSource = useCallback(index => {
    const target = imageSourceRefs.current.get(index);
    if (!target) {
      return;
    }

    if (Platform.OS === 'web' && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      setImageSourceRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      return;
    }

    target.measureInWindow?.((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setImageSourceRect({x, y, width, height});
      }
    });
  }, []);
  const [renderedTabs, setRenderedTabs] = useState(
    () => new Set([recruitTabs[0]]),
  );
  const {
    pagerRef,
    activeIndex,
    isActive,
    onTabPress,
    pageWidth,
    swipeEnabled,
    onPagerLayout,
    onScroll,
    onScrollEndDrag,
    onMomentumScrollEnd,
    webSwipeHandlers,
  } = useSwipeTabs({
    tabs: recruitTabItems,
    initialKey: recruitTabs[0],
  });
  const [tabHeights, setTabHeights] = useState({});
  const activeTabHeight = tabHeights[recruitTabs[activeIndex]];

  useEffect(() => {
    const activeTabName = recruitTabs[activeIndex];

    setRenderedTabs(prev => {
      if (prev.has(activeTabName)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(activeTabName);
      return next;
    });
  }, [activeIndex]);

  const mapCoordinate = useMemo(() => {
    const lat = Number(recruit?.guesthouseLat);
    const lng = Number(recruit?.guesthouseLng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
    };
  }, [recruit?.guesthouseLat, recruit?.guesthouseLng]);

  const mapCamera = useMemo(() => {
    if (!mapCoordinate) {
      return null;
    }

    return {
      ...mapCoordinate,
      zoom: 16,
    };
  }, [mapCoordinate]);

  const handlePressLocationMap = () => {
    if (!mapCoordinate) {
      return;
    }

    navigation.navigate('GuesthouseLocationMap', {
      guesthouseName: recruit?.guesthouseName || '근무지 위치',
      guesthouseAddress: recruit?.location,
      latitude: mapCoordinate.latitude,
      longitude: mapCoordinate.longitude,
    });
  };

  const handlePressGuesthouse = () => {
    const guesthouseId =
      recruit?.guesthouseId ?? recruit?.profileSummary?.guesthouseId;

    if (!guesthouseId) {
      return;
    }

    navigation.navigate('GuesthouseDetail', {
      id: guesthouseId,
      guesthouseId,
      checkIn: dayjs().format('YYYY-MM-DD'),
      checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      guestCount: 1,
    });
  };

  const renderWorkLocationMap = () => {
    if (!mapCoordinate || !mapCamera) {
      return null;
    }

    return (
      <View style={styles.mapContainer}>
        <NaverMapView
          style={styles.map}
          initialCamera={mapCamera}
          onTapMap={handlePressLocationMap}
          isScrollGesturesEnabled={false}
          isZoomGesturesEnabled={false}
          isRotateGesturesEnabled={false}
          isTiltGesturesEnabled={false}>
          <NaverMapMarkerOverlay
            latitude={mapCoordinate.latitude}
            longitude={mapCoordinate.longitude}
            width={44}
            height={56}
            anchor={{x: 0.5, y: 1}}
            onTap={handlePressLocationMap}>
            <View collapsable={false} style={styles.markerContainer}>
              <View style={styles.homeMarker}>
                <HomeIcon width={24} height={24} />
              </View>
              <View style={styles.markerTail} />
            </View>
          </NaverMapMarkerOverlay>
        </NaverMapView>
      </View>
    );
  };

  const renderTabContent = tabName => {
    switch (tabName) {
      case '모집조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집기간</Text>
              <Text style={styles.infoValue}>
                {formatLocalDateTimeToDotAndTime(recruit.recruitStart).date}~{' '}
                {formatLocalDateTimeToDotAndTime(recruit.recruitEnd).date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>모집인원</Text>
              <Text style={styles.infoValue}>
                여 {recruit.recruitNumberFemale}명, 남{' '}
                {recruit.recruitNumberMale}명, 성별무관{' '}
                {recruit.recruitNumberNoGender}명
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>
                {recruit.recruitMinAge} ~ {recruit.recruitMaxAge}세
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>입도날짜</Text>
              <Text style={styles.infoValue}>
                {formatLocalDateTimeToDotAndTime(recruit.entryStartDate).date} ~{' '}
                {formatLocalDateTimeToDotAndTime(recruit.entryEndDate).date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>우대조건</Text>
              <Text style={styles.infoValue}>{recruit.recruitCondition}</Text>
            </View>
          </View>
        );
      case '근무조건':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무형태</Text>
              <Text style={styles.infoValue}>{recruit.workType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주요업무</Text>
              <Text style={styles.infoValue}>{recruit.workPart}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>근무기간</Text>
              <Text style={styles.infoValue}>{recruit.workDuration}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>복지</Text>
              <Text style={styles.infoValue}>{recruit.welfare}</Text>
            </View>
          </View>
        );
      case '근무 정보':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>근무 사진</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}>
              {recruit?.recruitImages?.map((item, idx) => (
                <TouchableOpacity
                  ref={node => {
                    if (node) {
                      imageSourceRefs.current.set(idx, node);
                    } else {
                      imageSourceRefs.current.delete(idx);
                    }
                  }}
                  activeOpacity={1}
                  key={idx}
                  onPress={() => {
                    setSelectedImageId(idx);
                    setImageSourceRect(null);
                    setImageModalVisible(true);
                    requestAnimationFrame(() => measureImageSource(idx));
                  }}>
                  <AppImage
                    uri={item.recruitImageUrl}
                    style={[
                      styles.workplacePhoto,
                      imageModalVisible &&
                        selectedImageId === idx && {opacity: 0},
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>근무지 위치</Text>
            {renderWorkLocationMap()}
            <View style={styles.guesthouseLinkCard}>
              <View style={styles.guesthouseLinkTopRow}>
                <View style={styles.guesthouseLinkTitleBox}>
                  <Text
                    style={styles.guesthouseLinkTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {recruit?.profileSummary?.guesthouseName ||
                      recruit?.guesthouseName}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.guesthouseLinkActionButton}
                  onPress={handlePressGuesthouse}
                  disabled={
                    !(
                      recruit?.guesthouseId ??
                      recruit?.profileSummary?.guesthouseId
                    )
                  }>
                  <Text style={styles.guesthouseLinkAction}>게하 보러가기</Text>
                  <ChevroRight width={14} height={14} />
                </TouchableOpacity>
              </View>
              <Text
                style={styles.guesthouseLinkAddress}
                numberOfLines={1}
                ellipsizeMode="tail">
                {trimJejuPrefix(recruit?.location)}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const handleTabContentLayout = tabName => event => {
    const height = Number(event?.nativeEvent?.layout?.height ?? 0);

    if (height <= 0) {
      return;
    }

    setTabHeights(prev =>
      prev[tabName] === height ? prev : {...prev, [tabName]: height},
    );
  };

  return (
    <>
      {/* 탭 메뉴 */}
      <View style={styles.tabContainer}>
        {recruitTabs.map((tabName, tabIndex) => (
          <TouchableOpacity
            key={tabName}
            activeOpacity={1}
            style={[styles.tab, isActive(tabName) && styles.activeTab]}
            onPress={() => onTabPress(tabIndex)}>
            <Text
              style={[
                styles.tabText,
                isActive(tabName) && styles.activeTabText,
              ]}>
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 탭 내용 */}
      <View
        style={[
          styles.pagerWrapper,
          activeTabHeight ? {height: activeTabHeight} : null,
        ]}
        onLayout={onPagerLayout}>
        <ScrollView
          ref={pagerRef}
          horizontal
          scrollEnabled={swipeEnabled}
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          {...webSwipeHandlers}>
          {recruitTabs.map(tabName => (
            <View
              key={tabName}
              style={[styles.page, pageWidth > 0 && {width: pageWidth}]}>
              <View onLayout={handleTabContentLayout(tabName)}>
                {renderedTabs.has(tabName) ? renderTabContent(tabName) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* 이미지 선택 모달 */}
      <ImageModal
        visible={imageModalVisible}
        images={recruit?.recruitImages?.map((item, idx) => ({
          id: idx,
          imageUrl: item.recruitImageUrl,
        }))}
        selectedImageIndex={selectedImageId}
        sourceRect={imageSourceRect}
        sourceBorderRadius={6}
        onImageIndexChange={index => {
          setSelectedImageId(index);
          measureImageSource(index);
        }}
        onClose={() => setImageModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingBottom: 4,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary_blue,
  },
  tabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_800,
  },
  activeTabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.primary_blue,
  },
  pagerWrapper: {
    width: '100%',
  },
  page: {
    paddingHorizontal: 0,
  },
  //탭 상세 내용
  tabContent: {
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'column',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 40,
  },
  infoLabel: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
    width: 60,
  },
  infoValue: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    flex: 1,
    lineHeight: 20,
  },
  divider: {
    height: 0,
    backgroundColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
  },
  locationText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
    lineHeight: 20,
  },
  guesthouseLinkCard: {
    gap: 6,
    paddingTop: 2,
  },
  guesthouseLinkTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  guesthouseLinkTitleBox: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  guesthouseLinkTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  guesthouseLinkAddress: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_500,
  },
  guesthouseLinkActionButton: {
    width: 112,
    flexShrink: 0,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
  guesthouseLinkAction: {
    ...FONTS.fs_14_medium,
    color: COLORS.primary_blue,
    textAlign: 'right',
  },
  photoScroll: {
    marginBottom: 12,
  },
  workplacePhoto: {
    width: 85,
    height: 85,
    borderRadius: 6,
    marginRight: 4,
  },
  mapContainer: {
    height: 134,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_200,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  homeMarker: {
    width: 44,
    height: 44,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.grayscale_0,
  },
  markerTail: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary_orange,
    marginTop: 4,
  },
});
