import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import styles from './Home.styles';
import Chevron_right_gray from '@assets/images/chevron_right_gray.svg';
import HeartEmpty from '@assets/images/heart_empty.svg';
import HeartFilled from '@assets/images/heart_filled.svg';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {toggleFavorite} from '@utils/toggleFavorite';

export default function Meets({events = [], setEventList}) {
  const navigation = useNavigation();

  const moveToDetail = partyId => {
    navigation.navigate("MeetDetail", { partyId });
  };

  const formatDateTime = isoStr => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    let hour = d.getHours();
    const minute = d.getMinutes();
    const ampm = hour >= 12 ? '오후' : '오전';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    const mm = String(minute).padStart(2, '0');
    return `${month}월 ${day}일 ${ampm} ${hour}:${mm}`;
  };

  const formatPrice = price => {
    const num = Number(price || 0);
    if (num === 0) return '무료';
    return `${num.toLocaleString('ko-KR')}원`;
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

  const renderEvents = item => {
    const isFav = !!item.isLiked;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={localStyles.cardButton}
        onPress={() => moveToDetail(item.partyId)}>
        <View style={localStyles.card}>
          <Image source={{uri: item.partyImageUrl}} style={localStyles.image} />

          {/* 하트 아이콘 (이미지 위 오른쪽 상단) */}
          <View style={localStyles.heartWrapper}>
            <TouchableOpacity
              style={{padding: 10}}
              activeOpacity={0.8}
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

          {/* 아래 정보 영역 */}
          <View style={localStyles.infoWrapper}>
            {/* 타이틀 */}
            <Text
              style={[FONTS.fs_14_medium, localStyles.title]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.guesthouseName} {item.partyTitle}
            </Text>
            <View>
              {/* 날짜 + 장소 */}
              <Text
                style={[FONTS.fs_12_medium, localStyles.subText]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {formatDateTime(item.partyStartDateTime)} · {item.location}
              </Text>

              {/* 가격 + 인원 */}
              <View style={localStyles.bottomRow}>
                <Text style={[FONTS.fs_12_medium, localStyles.priceText]}>
                  숙박객: {formatPrice(item.amount)} | 비숙박객:{' '}
                  {formatPrice(item.nonGuestAmount)}
                </Text>
                <Text style={[FONTS.fs_12_medium, localStyles.capacityText]}>
                  {item.numOfAttendance}/{item.maxAttendance}명
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!events.length) return null;

  return (
    <View style={styles.jobContainer}>
      <View style={[styles.titleSection, {marginBottom: 10}]}>
        <Text style={styles.sectionTitle}>인기 이벤트</Text>
        <TouchableOpacity
          style={styles.seeMoreButton}
          onPress={() => console.log('★ Meet 더보기 press')}>
          <Text style={styles.seeMoreText}>더보기</Text>
          <Chevron_right_gray width={24} height={24} />
        </TouchableOpacity>
      </View>

      {events.map(item => (
        <View key={item.partyId}>{renderEvents(item)}</View>
      ))}
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardButton: {
    borderWidth: 0,
  },
  card: {
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_0,
    paddingVertical: 5,
  },
  image: {
    borderRadius: 4,
    width: '100%',
    height: 117,
  },
  heartWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  infoWrapper: {
    paddingVertical: 10,
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  subText: {
    color: COLORS.grayscale_500,
  },
  bottomRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    flex: 1,
  },
  capacityText: {
    marginLeft: 8,
    color: COLORS.grayscale_500,
  },
});
