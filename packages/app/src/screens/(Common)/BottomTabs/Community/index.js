import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Modal from '@components/modals/AdaptiveModal';
import AdaptiveText from '@components/AdaptiveText';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {useGuesthouseRegionStore} from '@screens/(Common)/BottomTabs/Guesthouse/regions/store';
import {useStaffRegionStore} from './Staff/regions';
import {ChatEntry} from '../../../../features/companion/screens';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import Home from '@assets/images/staff_recruit_info_gray.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import {replaceWebPath} from '@web/navigation';
import {WEB_ROUTES} from '@web/routes';
import Staff from './Staff';
import CompanionFeed from './CompanionFeed';
import styles from './Community.styles';

const sortChips = [
  {code: 'LATEST', labelKey: 'community.latest'},
  {code: 'OLDEST', labelKey: 'community.registrationOrder'},
];
const modeFor = tab =>
  tab === 'COMPANION'
    ? 'COMPANION'
    : ['STAFF', 'RECRUIT'].includes(tab)
    ? 'STAFF'
    : 'ALL';
export default function Community() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const requestedTab =
    route.params?.tab ??
    (Platform.OS === 'web' && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('tab')
      : null);
  const mode = modeFor(requestedTab);
  const selectMode = useCallback(
    tab => {
      navigation.setParams({tab});
      if (Platform.OS === 'web')
        {replaceWebPath(
          `${WEB_ROUTES.COMMUNITY}${tab === 'ALL' ? '' : `?tab=${tab}`}`,
          {
            __trioNavigation: true,
            route: {
              name: 'MainTabs',
              params: {screen: '커뮤니티', params: {tab}},
            },
          },
        );}
    },
    [navigation],
  );
  useFocusEffect(
    useCallback(() => {
      if (mode === 'ALL') {return;}
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          selectMode('ALL');
          return true;
        },
      );
      return () => subscription.remove();
    }, [mode, selectMode]),
  );
  const sortButtonRef = useRef(null);
  const [selectedSort, setSelectedSort] = useState(
    route.params?.selectedSort ?? 'LATEST',
  );
  const [sortVisible, setSortVisible] = useState(false);
  const [sortMenuPosition, setSortMenuPosition] = useState({
    top: 116,
    left: 16,
  });
  const region = useStaffRegionStore(state => state.region);
  const setRegion = useStaffRegionStore(state => state.setRegion);
  const regions = useGuesthouseRegionStore(state => state.regions);
  const loadRegions = useGuesthouseRegionStore(state => state.loadRegions);
  useEffect(() => {
    loadRegions();
  }, [loadRegions]);
  const handleSelectSort = sort => {
    setSelectedSort(sort);
    setSortVisible(false);
  };

  const handleToggleSortMenu = useCallback(() => {
    if (sortVisible) {
      setSortVisible(false);
      return;
    }

    sortButtonRef.current?.measureInWindow?.((x, y, width, height) => {
      setSortMenuPosition({
        top: y + height + 6,
        left: x,
      });
    });
    setSortVisible(true);
  }, [sortVisible]);

  const handlePressWrite = () => {
    const role = useUserStore.getState().userRole;

    if (role !== 'USER') {
      showErrorModal({
        message: t('community.pleaseWriteAfterLoggingIn'),
        buttonText2: t('common.cancel'),
        buttonText: t('common.logIn'),
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    navigation.navigate('CompanionWrite');
  };

  const section = (type, more = false, showBack = false) => (
    <View style={local.section}>
      {showBack && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('employ.goBack')}
          hitSlop={10}
          onPress={() => selectMode('ALL')}>
          <ChevronLeft width={20} height={20} />
        </TouchableOpacity>
      )}
      <AdaptiveText style={[FONTS.fs_16_semibold, local.heading]}>
        {t(
          type === 'COMPANION'
            ? 'community.feed.companions'
            : 'community.feed.staff',
        )}
      </AdaptiveText>
      <View style={[local.badge, type === 'STAFF' && local.recruitBadge]}>
        <AdaptiveText
          style={[
            FONTS.fs_12_medium,
            {
              color:
                type === 'STAFF'
                  ? COLORS.semantic_green
                  : COLORS.primary_orange,
            },
          ]}>
          {t(
            type === 'COMPANION'
              ? 'community.feed.hot'
              : 'community.feed.recruiting',
          )}
        </AdaptiveText>
      </View>
      {more && (
        <TouchableOpacity style={local.more} onPress={() => selectMode(type)}>
          <AdaptiveText style={[FONTS.fs_14_regular, local.secondary]}>
            {t('community.feed.more')}
          </AdaptiveText>
          <ChevronRight width={16} height={16} />
        </TouchableOpacity>
      )}
    </View>
  );
  const renderStaffHeader = main => (
    <View>
      {main && (
        <>
          {section('COMPANION', true)}
          <CompanionFeed preview region={region} sort={selectedSort} />
        </>
      )}
      {section('STAFF', main, !main)}
      <View style={local.partner}>
        <Home width={16} height={16} />
        <AdaptiveText style={[FONTS.fs_14_regular, local.partnerText]}>
          {t('community.feed.partnerDescription')}
        </AdaptiveText>
        <AdaptiveText
          accessibilityRole="link"
          onPress={() => Linking.openURL('https://host.ddakji.kr')}
          style={[FONTS.fs_12_medium, local.partnerLink]}>
          {t('community.feed.partnerLink')}
        </AdaptiveText>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[FONTS.fs_20_semibold, styles.title]}>
          {t('common.community')}
        </Text>
        <View style={local.chat}>
          <ChatEntry navigation={navigation} />
        </View>
        <View style={[styles.filterRow, {marginBottom: 8}]}>
          <TouchableOpacity
            ref={sortButtonRef}
            style={[styles.sortChip, {marginRight: 8}]}
            onPress={handleToggleSortMenu}>
            <Text style={[FONTS.fs_14_medium, styles.sortChipText]}>
              {t(sortChips.find(item => item.code === selectedSort).labelKey)}
            </Text>
            {sortVisible ? (
              <ChevronUp width={16} height={16} />
            ) : (
              <ChevronDown width={16} height={16} />
            )}
          </TouchableOpacity>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipContainer}>
            {regions.map(item => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.chip,
                  region === item.code && styles.selectedChip,
                ]}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: region === item.code,
                  selected: region === item.code,
                }}
                onPress={() => setRegion(item.code)}>
                <AdaptiveText
                  style={[
                    FONTS.fs_14_medium,
                    styles.chipText,
                    region === item.code && FONTS.fs_14_semibold,
                    region === item.code && styles.selectedChipText,
                  ]}>
                  {item.code === 'ALL' ? t('common.all') : item.displayName}
                </AdaptiveText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <View style={[{flex: 1}, mode !== 'ALL' && {display: 'none'}]}>
        <Staff
          isActive={mode === 'ALL'}
          hideRegionTabs
          selectedRegion={region}
          listHeader={renderStaffHeader(true)}
          selectedSort={selectedSort}
        />
      </View>
      {mode === 'COMPANION' && (
        <>
          {section('COMPANION', false, true)}
          <CompanionFeed region={region} sort={selectedSort} />
        </>
      )}
      {mode === 'STAFF' && (
        <Staff
          isActive
          hideRegionTabs
          selectedRegion={region}
          listHeader={renderStaffHeader(false)}
          selectedSort={selectedSort}
        />
      )}
      {mode !== 'STAFF' && (
        <TouchableOpacity style={styles.writeButton} onPress={handlePressWrite}>
          <PlusIcon width={20} height={20} />
          <AdaptiveText style={[FONTS.fs_14_medium, styles.writeButtonText]}>
            {t('community.feed.write')}
          </AdaptiveText>
        </TouchableOpacity>
      )}
      <Modal
        visible={sortVisible}
        transparent
        animationType="none"
        onRequestClose={() => setSortVisible(false)}>
        <View style={styles.sortOverlay}>
          <Pressable
            style={styles.sortOverlayBackdrop}
            onPress={() => setSortVisible(false)}
          />
          <View style={[styles.floatingSortMenu, sortMenuPosition]}>
            {sortChips.map(sort => (
              <TouchableOpacity
                key={sort.code}
                style={styles.sortMenuItem}
                onPress={() => handleSelectSort(sort.code)}>
                <Text
                  style={[
                    FONTS.fs_16_medium,
                    styles.sortMenuText,
                    selectedSort === sort.code && styles.selectedSortMenuText,
                  ]}>
                  {t(sort.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const local = StyleSheet.create({
  chat: {position: 'absolute', right: 14, top: 12},
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 14,
  },
  heading: {color: COLORS.grayscale_900, flexShrink: 1},
  badge: {
    backgroundColor: COLORS.secondary_orange,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recruitBadge: {backgroundColor: COLORS.secondary_green},
  more: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondary: {color: COLORS.grayscale_500, fontSize: 12},
  partner: {
    marginHorizontal: 16,
    marginBottom: 28,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORS.grayscale_100,
  },
  partnerText: {flex: 1, color: COLORS.grayscale_500, fontSize: 10},
  partnerLink: {color: COLORS.primary_orange, flexShrink: 1, fontSize: 11},
});
