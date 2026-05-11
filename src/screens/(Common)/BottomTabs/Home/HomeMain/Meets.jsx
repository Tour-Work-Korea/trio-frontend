import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './Home.styles';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';
import PeopleIcon from '@assets/images/people_gray.svg';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {toggleFavorite} from '@utils/toggleFavorite';

export default function Meets({events = [], setEventList}) {
  const navigation = useNavigation();
  const [selectedChip, setSelectedChip] = useState('guesthouseParty');
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const moveToDetail = partyId => {
    navigation.navigate('MeetDetail', {partyId});
  };

  const handleToggleFavorite = async item => {
    try {
      await toggleFavorite({
        type: 'party',
        id: item.partyId,
        isLiked: item.isLiked,
        setList: setEventList,
      });
    } catch (error) {
      console.warn(
        '홈 인기 이벤트 즐겨찾기 토글 실패',
        error?.response?.data?.message,
      );
    }
  };

  const handleHorizontalScroll = useCallback(event => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  }, []);

  const stopHorizontalMomentum = useCallback(event => {
    const offset = event.nativeEvent.contentOffset.x;
    scrollOffsetRef.current = offset;
    listRef.current?.scrollToOffset({offset, animated: false});
  }, []);

  const renderEvents = item => {
    const isFav = !!item.isLiked;

    return (
      <TouchableOpacity
        activeOpacity={1}
        style={localStyles.cardButton}
        onPress={() => moveToDetail(item.partyId)}>
        <View style={localStyles.card}>
          <View style={localStyles.imageWrapper}>
            <Image source={{uri: item.partyImageUrl}} style={localStyles.image} />

            {/* 하트 아이콘 (이미지 내부 오른쪽 상단) */}
            <View style={localStyles.heartWrapper}>
              <TouchableOpacity
                style={localStyles.heartButton}
                activeOpacity={1}
                onPress={e => {
                  e.stopPropagation(); // 카드 onPress로 이벤트 전파 막기
                  handleToggleFavorite(item);
                }}>
                {isFav ? (
                  <HeartFilled width={24} height={24} />
                ) : (
                  <HeartEmpty width={24} height={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 아래 정보 영역 */}
          <View style={localStyles.infoWrapper}>
            <Text
              style={[FONTS.fs_12_medium, localStyles.guesthouseName]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.guesthouseName}
            </Text>
            <Text
              style={[FONTS.fs_14_semibold, localStyles.title]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.partyTitle}
            </Text>
            <View style={localStyles.capacityRow}>
              <PeopleIcon width={16} height={16} />
              <Text style={[FONTS.fs_12_medium, localStyles.capacityText]}>
                최대인원 {item.maxAttendance}명
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const guesthousePartyEvents = events;
  const visibleEvents =
    selectedChip === 'guesthouseParty' ? guesthousePartyEvents.slice(0, 3) : [];

  return (
    <View style={styles.jobContainer}>
      <View style={localStyles.meetTopRow}>
        <View style={[styles.titleSection]}>
          <Text style={styles.sectionTitle}>인기 게하 콘텐츠</Text>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.seeMoreButton}
            onPress={() => {
              navigation.navigate('PopularMeetList');
            }}
          >
            <Text style={styles.seeMoreText}>더보기</Text>
            <Chevron_right_gray width={24} height={24} />
          </TouchableOpacity>
        </View>
        {/* <View style={localStyles.meetChipRow}>
          <TouchableOpacity
            style={[
              localStyles.meetChip,
              selectedChip === 'guesthouseParty' && localStyles.meetChipActive,
            ]}
            activeOpacity={1}
            onPress={() => setSelectedChip('guesthouseParty')}>
            <Text
              style={[
                localStyles.meetChipText,
                selectedChip === 'guesthouseParty' &&
                  localStyles.meetChipTextActive,
              ]}>
              게하 파티
            </Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            style={[
              localStyles.meetChip,
              selectedChip === 'event' && localStyles.meetChipActive,
            ]}
            activeOpacity={1}
            onPress={() => setSelectedChip('event')}>
            <Text
              style={[
                localStyles.meetChipText,
                selectedChip === 'event' && localStyles.meetChipTextActive,
              ]}>
              이벤트
            </Text>
          </TouchableOpacity> */}
          {/* 임시 */}
          {/* <View
            style={[
              localStyles.meetChip,
              selectedChip === 'event' && localStyles.meetChipActive,
            ]}
            activeOpacity={1}
            onPress={() => setSelectedChip('event')}>
            <Text
              style={[
                localStyles.meetChipText,
                selectedChip === 'event' && localStyles.meetChipTextActive,
              ]}>
              이벤트
            </Text>
          </View>
        </View> */}
      </View>

      <FlatList
        ref={listRef}
        data={visibleEvents}
        horizontal
        directionalLockEnabled
        nestedScrollEnabled={false}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleHorizontalScroll}
        onScrollEndDrag={stopHorizontalMomentum}
        keyExtractor={item => String(item.partyId)}
        renderItem={({item}) => renderEvents(item)}
        ItemSeparatorComponent={() => <View style={{width: 12}} />}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardButton: {
    borderWidth: 0,
  },
  card: {
    width: 160,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_0,
  },
  imageWrapper: {
    width: 160,
    position: 'relative',
  },
  image: {
    borderRadius: 12,
    width: 160,
    height: 240,
  },
  heartWrapper: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  heartButton: {
    padding: 4,
  },
  infoWrapper: {
    marginTop: 8,
    gap: 4,
    width: 160,
  },
  guesthouseName: {
    color: COLORS.grayscale_500,
    width: '100%',
  },
  title: {
    color: COLORS.grayscale_900,
    width: '100%',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    color: COLORS.grayscale_400,
  },

  meetTopRow: {
    marginBottom: 10,
    gap: 8,
  },
  meetChipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meetChip: {
    backgroundColor: COLORS.grayscale_200,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  meetChipActive: {
    backgroundColor: COLORS.grayscale_900,
  },
  meetChipText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_900,
  },
  meetChipTextActive: {
    color: COLORS.grayscale_0,
  },
});
