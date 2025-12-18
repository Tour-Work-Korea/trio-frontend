import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import MeetIntroModal from '@components/modals/HostMy/Meet/AddMeet/MeetIntroModal';
import MeetLocationModal from '@components/modals/HostMy/Meet/AddMeet/MeetLocationModal';
import MeetDateModal from '@components/modals/HostMy/Meet/AddMeet/MeetDateModal';
import MeetPriceModal from '@components/modals/HostMy/Meet/AddMeet/MeetPriceModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

import styles from './MeetBasics.styles';

const stripDuplicatesByUrl = (arr = []) => {
  const seen = new Set();
  return arr.filter(it => {
    const key = it?.imageUrl || '';
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const enforceSingleThumbnail = (arr = []) => {
  // 첫 번째 isThumbnail만 true로, 나머지는 false
  let found = false;
  return arr.map(it => {
    if (it?.isThumbnail && !found) {
      found = true;
      return {...it, isThumbnail: true};
    }
    return {...it, isThumbnail: false};
  });
};

// initialValues를 안전하게 파싱/정규화
const normalizeInitial = (v = {}) => {
  const base = {
    description: '',
    tags: '',
    partyImages: [],
    guesthouseId: null,
    isRecurring: false,
    repeatDays: [],
    recruitStartDate: '',
    recruitEndDate: '',
    partyStartTime: '',
    partyEndTime: '',
    minAttendees: null,
    maxAttendees: null,
    isGuest: true,
    amount: null,
    femaleAmount: null,
    maleNonAmount: null,
    femaleNonAmount: null,
  };

  const merged = {...base, ...(v || {})};

  // partyImages 정규화 (thumbnailUrl + imageUrls도 허용)
  if (Array.isArray(merged.partyImages) && merged.partyImages.length) {
    merged.partyImages = enforceSingleThumbnail(stripDuplicatesByUrl(merged.partyImages));
  } else if (merged.thumbnailUrl || Array.isArray(merged.imageUrls)) {
    const thumbs = merged.thumbnailUrl ? [{imageUrl: merged.thumbnailUrl, isThumbnail: true}] : [];
    const others = (merged.imageUrls || []).map(u => ({imageUrl: u, isThumbnail: false}));
    merged.partyImages = enforceSingleThumbnail(stripDuplicatesByUrl([...thumbs, ...others]));
  } else {
    merged.partyImages = [];
  }

  return merged;
};

const MeetBasics = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {initialValues, onSelect} = route.params || {};

  const [party, setParty] = useState(normalizeInitial(initialValues));

  // 페이지 재진입 시에도 항상 최신 initialValues 반영
  useEffect(() => {
    setParty(normalizeInitial(initialValues));
  }, [initialValues]);

  // 이벤트 배너사진(대표사진) 및 소개요약 모달
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introModalReset, setIntroModalReset] = useState(true);
  // 이벤트 장소 모달(게하 선택)
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalReset, setLocationModalReset] = useState(true);
  // 이벤트 날짜 모달
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateModalReset, setDateModalReset] = useState(true);
  // 이벤트 인원 및 금액 모달
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceModalReset, setPriceModalReset] = useState(true);

  // 이벤트 배너사진 및 소개요약 모달에서 "적용" 눌렀을 때
  const onSelectIntro = (payload = {}) => {
    const { partyImages, description, tags } = payload;

    setParty(prev => {
      let nextImages = prev.partyImages || [];

      if (Array.isArray(partyImages) && partyImages.length) {
        // 모달이 넘긴 배열 그대로(첫 번째가 썸네일)
        nextImages = enforceSingleThumbnail(stripDuplicatesByUrl(partyImages));
      }
      // thumbnailUrl 없이도 동작. 없으면 기존 이미지 유지.

      return {
        ...prev,
        description: description ?? prev.description,
        tags: typeof tags === 'string' ? tags : (prev.tags ?? ''),
        partyImages: nextImages,
      };
    });

    setIntroModalReset(false);
    setIntroModalVisible(false);
  };

  // 이벤트 장소 모달에서 "적용" 눌렀을 때
  const onSelectLocation = ({guesthouseId}) => {
    setParty(p => ({...p, guesthouseId}));
    setLocationModalReset(false); // 닫아도 초기화 안 함
    setLocationModalVisible(false);
  };

  // 이벤트 날짜 모달에서 "적용" 눌렀을 때
  const onSelectDate = payload => {
    const {
      isRecurring,
      repeatDays,
      recruitStartDate,
      recruitEndDate,
      partyStartTime,
      partyEndTime,
    } = payload || {};
    setParty(p => ({
      ...p,
      isRecurring: !!isRecurring,
      repeatDays: Array.isArray(repeatDays) ? repeatDays : [],
      recruitStartDate: recruitStartDate || '',
      recruitEndDate: recruitEndDate || '',
      partyStartTime: partyStartTime || p.partyStartTime,
      partyEndTime: partyEndTime || p.partyEndTime,
    }));
    setDateModalReset(false); // 닫아도 초기화 안 함
    setDateModalVisible(false);
  };

  // 이벤트 인원 및 금액 모달에서 "적용" 눌렀을 때
  const onSelectPrice = payload => {
    const {
      minAttendees,
      maxAttendees,
      isGuest,
      amount,
      femaleAmount,
      maleNonAmount,
      femaleNonAmount,
    } = payload || {};
    setParty(p => ({
      ...p,
      minAttendees,
      maxAttendees,
      isGuest: !!isGuest,
      amount,
      femaleAmount,
      maleNonAmount,
      femaleNonAmount,
    }));
    setPriceModalReset(false); // 닫아도 초기화 안 함
    setPriceModalVisible(false);
  };

  // 유효성 검사
  const isIntroDone = useMemo(() => {
    const hasThumb = (party.partyImages || []).some(i => i.isThumbnail && i.imageUrl);
    const hasDesc = !!party.description && party.description.trim().length > 0;
    return hasThumb && hasDesc;
  }, [party.partyImages, party.description]);

  const isLocationDone = useMemo(() => !!party.guesthouseId, [party.guesthouseId]);

  const isDateDone = useMemo(() => {
    const hasRange = !!party.recruitStartDate && !!party.recruitEndDate;
    const hasTime = !!party.partyStartTime && !!party.partyEndTime;
    // 반복 여부와 상관없이 위 2개는 필수로 체크
    return hasRange && hasTime;
  }, [
    party.recruitStartDate,
    party.recruitEndDate,
    party.partyStartTime,
    party.partyEndTime,
  ]);

  const isPriceDone = useMemo(() => {
    const hasAttendees =
      Number.isFinite(Number(party.minAttendees)) &&
      Number.isFinite(Number(party.maxAttendees)) &&
      Number(party.maxAttendees) > 0;

    // 금액: 0이면 무료로 허용, null/undefined는 미입력으로 간주
    const isNumberOrZero = v =>
      v === 0 || v === '0' || (v !== null && v !== undefined && !Number.isNaN(Number(v)));

    const hasPrices =
      isNumberOrZero(party.amount) &&
      isNumberOrZero(party.femaleAmount) &&
      isNumberOrZero(party.maleNonAmount) &&
      isNumberOrZero(party.femaleNonAmount);

    return hasAttendees && hasPrices;
  }, [
    party.minAttendees,
    party.maxAttendees,
    party.amount,
    party.femaleAmount,
    party.maleNonAmount,
    party.femaleNonAmount,
  ]);

  const isSubmitReady = isIntroDone && isLocationDone && isDateDone && isPriceDone;

  const renderRightIcon = done =>
    done ? (
      <CheckOrange width={24} height={24} />
    ) : (
      <ChevronRight width={24} height={24} />
    );

  const handleSubmit = () => {
    if (!isSubmitReady) {
      Toast.show({type: 'error', text1: '필수 항목을 모두 입력해주세요.'});
      return;
    }

    try {
      if (typeof onSelect === 'function') {
        onSelect(party); // 부모(MyMeetAdd)에 값 전달
      }
      Toast.show({type: 'success', text1: '기본 정보가 적용되었어요.'});
      navigation.goBack();
    } catch (e) {
      Toast.show({type: 'error', text1: '적용 중 오류가 발생했어요.'});
    }
  };

  return (
    <View style={styles.container}>
      <Header title="기본 정보" />

      <View style={styles.bodyContainer}>

        {/* 이벤트 배너사진(대표사진) 및 소개요약 조회 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setIntroModalVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>
              배너사진 및 소개요약
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
          </View>
          {renderRightIcon(isIntroDone)}
        </TouchableOpacity>

        {/* 이벤트 장소 정보 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setLocationModalVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>장소</Text>
            <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
          </View>
          {renderRightIcon(isLocationDone)}
        </TouchableOpacity>

        {/* 이벤트 날짜 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setDateModalVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>날짜</Text>
            <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
          </View>
          {renderRightIcon(isDateDone)}
        </TouchableOpacity>

        {/* 이벤트 인원 및 금액 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setPriceModalVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>
              인원 및 금액
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
          </View>
          {renderRightIcon(isPriceDone)}
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          필수 항목을 입력하셔야 등록이 완료됩니다.
        </Text>

      </View>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitReady && styles.submitButtonDisabled,
          ]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}>
            적용하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24} />
          ) : (
            <CheckBlack width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 이벤트 배너사진 및 소개요약 모달 */}
      <MeetIntroModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        onSelect={onSelectIntro}
        initialDescription={party.description}
        initialTags={party.tags}
        initialPartyImages={party.partyImages}
      />

      {/* 이벤트 장소 모달 */}
      <MeetLocationModal
        visible={locationModalVisible}
        shouldResetOnClose={locationModalReset}
        onClose={() => setLocationModalVisible(false)}
        onSelect={onSelectLocation}
        initialGuesthouseId={party.guesthouseId}
      />

      {/* 이벤트 날짜 모달 */}
      <MeetDateModal
        visible={dateModalVisible}
        shouldResetOnClose={dateModalReset}
        onClose={() => setDateModalVisible(false)}
        onSelect={onSelectDate}
        initialRecruitStartDate={party.recruitStartDate}
        initialRecruitEndDate={party.recruitEndDate}
        initialPartyStartTime={party.partyStartTime}
        initialPartyEndTime={party.partyEndTime}
        initialIsRecurring={party.isRecurring}
        initialRepeatDays={party.repeatDays}
      />

      {/* 이벤트 인원 및 금액 모달 */}
      <MeetPriceModal
        visible={priceModalVisible}
        shouldResetOnClose={priceModalReset}
        onClose={() => setPriceModalVisible(false)}
        onSelect={onSelectPrice}
        initialMinAttendees={party.minAttendees}
        initialMaxAttendees={party.maxAttendees}
        initialIsGuest={party.isGuest}
        initialAmount={party.amount}
        initialFemaleAmount={party.femaleAmount}
        initialMaleNonAmount={party.maleNonAmount}
        initialFemaleNonAmount={party.femaleNonAmount}
      />
    </View>
  );
};

export default MeetBasics;
