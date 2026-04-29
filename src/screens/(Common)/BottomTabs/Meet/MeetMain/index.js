import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import styles from './MeetMain.styles';
import MeetFilterModal from '@components/modals/Meet/MeetFilterModal';
import MeetSortModal from '@components/modals/Meet/MeetSortModal';
import userMeetApi from '@utils/api/userMeetApi';
import {toggleFavorite} from '@utils/toggleFavorite';

import SearchIcon from '@assets/images/search_gray.svg';
import FilterIcon from '@assets/images/filter_gray.svg';
import SortIcon from '@assets/images/sort_toggle_gray.svg';
import ChevronRightBlue from '@assets/images/chevron_right_blue.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import PeopleIcon from '@assets/images/people_gray.svg';

import {meetScales, stayTypes} from '@constants/meetOptions';

const MeetMain = () => {
  const navigation = useNavigation();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('RECOMMEND');

  const [scaleId, setScaleId] = useState(null);
  const [stayId, setStayId] = useState(null);

  const isBigById = useMemo(
    () => Object.fromEntries(meetScales.map(s => [s.id, s.isBigParty])),
    [],
  );
  const isGuestById = useMemo(
    () => Object.fromEntries(stayTypes.map(s => [s.id, s.isGuest])),
    [],
  );

  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true);

      const params = {sortBy: sortOption};
      if (scaleId) {
        params.isBigParty = isBigById[scaleId];
      }
      if (stayId) {
        params.isGuest = isGuestById[stayId];
      }

      const {data} = await userMeetApi.getRecentParties(params);
      const list = Array.isArray(data) ? data : [];
      setMeets(list);
    } catch (e) {
      console.warn('getRecentParties error', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }, [sortOption, scaleId, stayId, isBigById, isGuestById]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const groupedGuesthouses = useMemo(() => {
    const sorted = [...meets].sort(
      (a, b) => dayjs(a.partyStartDateTime).valueOf() - dayjs(b.partyStartDateTime).valueOf(),
    );
    const grouped = sorted.reduce((acc, party) => {
      const guesthouseName = party.guesthouseName || '게스트하우스';
      const guesthouseId = party.guesthouseId ?? party.guesthouse?.id ?? null;
      const key = guesthouseId ? `${guesthouseId}` : guesthouseName;
      if (!acc[key]) {
        acc[key] = {
          guesthouseId,
          guesthouseName,
          parties: [],
        };
      }
      acc[key].parties.push(party);
      return acc;
    }, {});
    return Object.values(grouped);
  }, [meets]);

  function formatWhenTime(isoStr) {
    const d = dayjs(isoStr);
    return `${d.format('M/D')}, ${d.hour() < 12 ? '오전' : '오후'} ${d.format('h:mm')}`;
  }

  const handleToggleFavorite = async item => {
    try {
      await toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setMeets,
      });
    } catch (error) {
      console.warn('파티 즐겨찾기 토글 실패', error?.response?.data?.message);
    }
  };

  // 파티 카드
  const renderPartyItem = item => {
    const isFav = !!item.isLiked;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        key={String(item.partyId)}
        style={styles.partyCard}
        onPress={() =>
          navigation.navigate('MeetDetail', {partyId: item.partyId})
        }>
        <Image source={{uri: item.partyImageUrl}} style={styles.partyThumb} />
        <View style={styles.partyInfo}>
          <View style={styles.partyTopInfo}>
            <View style={styles.partyTitleRow}>
              <Text
                style={[FONTS.fs_16_semibold, styles.partyTitle]}
                numberOfLines={1}>
                {item.partyTitle}
              </Text>
              <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
                {isFav ? (
                  <HeartFilled width={20} height={20} />
                ) : (
                  <HeartEmpty width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.partyPeopleRow}>
              <PeopleIcon width={16} height={16} />
              <Text style={[FONTS.fs_12_medium, styles.partyPeople]}>
                최대인원 {item.maxAttendance}명
              </Text>
            </View>
          </View>
          <Text style={[FONTS.fs_14_medium, styles.partyTime]}>
            {formatWhenTime(item.partyStartDateTime)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 게하 카드
  const renderGuesthouseItem = ({item}) => {
    const handleMoveGuesthouse = () => {
      if (!item.guesthouseId) {
        return;
      }
      navigation.navigate('GuesthouseDetail', {
        id: item.guesthouseId,
        checkIn: dayjs().format('YYYY-MM-DD'),
        checkOut: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        guestCount: 1,
      });
    };

    return (
      <View style={styles.guesthouseSection}>
        <View style={styles.guesthouseTitleRow}>
          <Text style={[FONTS.fs_16_semibold, styles.guesthouseName]}>
            {item.guesthouseName}
          </Text>
          <TouchableOpacity
            style={styles.moveGuesthouseButton}
            activeOpacity={0.7}
            onPress={handleMoveGuesthouse}>
            <Text style={[FONTS.fs_12_medium, styles.moveGuesthouseText]}>
              게하 보러가기
            </Text>
            <ChevronRightBlue width={12} height={12} />
          </TouchableOpacity>
        </View>

        {/* <View style={styles.chipRow}>
          <View style={[styles.countChip, styles.partyCountChip]}>
            <Text style={[FONTS.fs_12_medium, styles.partyCountText]}>
              게하 파티 {item.parties.length}
            </Text>
          </View>
          <View style={styles.countChip}>
            <Text style={[FONTS.fs_12_medium, styles.eventCountText]}>이벤트 0</Text>
          </View>
        </View> */}

        <View style={styles.partyList}>{item.parties.map(renderPartyItem)}</View>
      </View>
    );
  };

  const quickTags = ['제주 전체', '동반지원', '파티'];

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={[FONTS.fs_20_semibold, styles.contentTitle]}>콘텐츠</Text>
        <Text style={[FONTS.fs_16_medium, styles.contentSubTitle]}>
          콘텐츠가 있는 게스트하우스를 찾아보세요
        </Text>
        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MeetSearch')}>
          <SearchIcon width={20} height={20} />
          <Text style={[FONTS.fs_14_regular, styles.searchPlaceholder]}>
            언제 어디로 떠나시나요?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <FlatList
          data={groupedGuesthouses}
          keyExtractor={(item, index) =>
            item.guesthouseId ? String(item.guesthouseId) : `${item.guesthouseName}-${index}`
          }
          renderItem={renderGuesthouseItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* 검색 필터 */}
              <View style={styles.filterHeader}>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}>
                    <FilterIcon width={18} height={18} />
                    <Text style={[FONTS.fs_16_medium, styles.filterText]}>필터</Text>
                  </TouchableOpacity>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickTagScroll}>
                    {quickTags.map(tag => (
                      <View key={tag} style={styles.quickTagChip}>
                        <Text style={[FONTS.fs_14_medium, styles.quickTagText]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortModalVisible(true)}>
                  <SortIcon width={20} height={20} />
                  <Text style={[FONTS.fs_16_medium, styles.sortText]}>정렬</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={[FONTS.fs_16_regular, styles.emptyText]}>
                  표시할 콘텐츠가 없어요.
                </Text>
              )}
            </View>
          }
        />
      </View>

      <MeetFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={next => {
          setScaleId(next.selectedScale ?? null);
          setStayId(next.selectedStay ?? null);
          setFilterModalVisible(false);
        }}
      />

      <MeetSortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selected={sortOption}
        onSelect={value => {
          setSortOption(value);
          setSortModalVisible(false);
        }}
      />
    </View>
  );
};

export default MeetMain;
