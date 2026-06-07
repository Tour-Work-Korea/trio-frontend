import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import {useNavigation, useRoute} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import styles from './GuesthouseCheckInGuide.styles';

import XBtn from '@assets/images/x_gray.svg';
import PeopleIcon from '@assets/images/people_gray.svg';

dayjs.locale('ko');

const formatPartyTime = startDateTime => {
  const start = dayjs(startDateTime);

  if (!start.isValid()) {
    return '';
  }

  const meridiem = start.hour() < 12 ? '오전' : '오후';

  return `${start.format('M/D')} 오늘, ${meridiem} ${start.format('h:mm')}`;
};

export default function GuesthouseCheckInGuide() {
  const navigation = useNavigation();
  const route = useRoute();
  const {reservationId} = route.params ?? {};

  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const parties = useMemo(
    () => (Array.isArray(guide?.parties) ? guide.parties : []),
    [guide?.parties],
  );

  const fetchGuide = useCallback(
    async ({refresh = false} = {}) => {
      if (!reservationId) {
        setLoading(false);
        setError('예약 정보를 찾을 수 없습니다.');
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError('');
        const {data} = await reservationPaymentApi.getRoomCheckInGuide(
          reservationId,
        );
        setGuide(data);
      } catch (e) {
        console.warn(
          'getRoomCheckInGuide error',
          e?.response?.data || e?.message,
        );
        setError('체크인 안내를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [reservationId],
  );

  useEffect(() => {
    fetchGuide();
  }, [fetchGuide]);

  const renderParty = party => {
    const partyTime = formatPartyTime(party.startDateTime);

    return (
      <TouchableOpacity
        key={String(party.partyId)}
        activeOpacity={1}
        style={styles.partyCard}
        onPress={() =>
          navigation.navigate('MeetDetail', {partyId: party.partyId})
        }>
        {party.partyImage ? (
          <Image source={{uri: party.partyImage}} style={styles.partyImage} />
        ) : (
          <View style={styles.partyImagePlaceholder}>
            <Text style={[FONTS.fs_12_medium, styles.partyImageText]}>
              파티
            </Text>
          </View>
        )}

        <View style={styles.partyInfo}>
          <View>
            <Text
              style={[FONTS.fs_16_semibold, styles.partyTitle]}
              numberOfLines={2}>
              {party.partyTitle || '게스트하우스 파티'}
            </Text>
            <View style={styles.partyPeopleRow}>
              <PeopleIcon width={14} height={14} />
              <Text style={[FONTS.fs_12_medium, styles.partyPeopleText]}>
                최대인원 {party.maxAttendees ?? 0}명
              </Text>
            </View>
          </View>

          {!!partyTime && (
            <Text style={[FONTS.fs_14_medium, styles.partyTime]}>
              {partyTime}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator color={COLORS.primary_orange} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={[FONTS.fs_14_medium, styles.emptyText]}>{error}</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={[FONTS.fs_16_semibold, styles.title]}>
          체크인 안내문
        </Text>

        <View style={styles.noticeBox}>
          <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
            {guide?.noticeText || '호스트가 등록한 체크인 안내문이 없습니다.'}
          </Text>
        </View>

        {parties.length > 0 && (
          <>
            <Text style={[FONTS.fs_16_medium, styles.partySectionTitle]}>
              놓칠 수 없는{' '}
              <Text style={styles.partySectionTitleAccent}>오늘의 파티 🎉</Text>
            </Text>

            <View style={styles.partyList}>{parties.map(renderParty)}</View>
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.closeButton}
        onPress={() => navigation.goBack()}>
        <XBtn width={24} height={24} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGuide({refresh: true})}
            tintColor={COLORS.primary_orange}
          />
        }>
        {renderBody()}
      </ScrollView>
    </View>
  );
}
