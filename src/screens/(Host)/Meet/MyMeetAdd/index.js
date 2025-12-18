import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, Alert, TouchableOpacity, TextInput} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';

import styles from './MyMeetAdd.styles';
import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import hostMeetApi from '@utils/api/hostMeetApi';

import MeetEventModal from '@components/modals/HostMy/Meet/AddMeet/MeetEventModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

const MyMeetAdd = () => {
  const navigation = useNavigation();

  const [party, setParty] = useState({
    // 공고 제목
    partyTitle: '',
    // 기본 정보
    description: '',
    tags: '', // 사용자가 직접 작성
    guesthouseId: null,
    recruitStartDate: '',
    recruitEndDate: '',
    partyStartTime: '19:00:00',
    partyEndTime: '22:00:00',
    isRecurring: false,
    repeatDays: [], // ["FRIDAY","SATURDAY"]
    minAttendees: null,
    maxAttendees: null,
    isGuest: false,
    amount: null,
    femaleAmount: null,
    maleNonAmount: null,
    femaleNonAmount: null,
    partyImages: [], // [{ imageUrl, isThumbnail }]

    // 이벤트 소개글(모달)
    partyEvents: [], // [{ eventName, eventDescription, partyEventImageUrls:[] }]

    // 상세 안내(페이지)
    detailSchedule: '',
    snackTagList: [], // ["PARTY_SNACK", ...]
    snacks: '',
    rules: [], // [{title, content}]

    // 오시는 길(페이지)
    meetingPlace: '',
    trafficInfo: [], // [{title, content}]
    parkingInfo: [], // [{title, content}]
    parkingTag: [], // ["PARTY_PARKING", ...]
  });

  // 이벤트 제목
  const [isTitleOpen, setIsTitleOpen] = useState(false);
  const toggleTitleOpen = () => {
    setIsTitleOpen(v => {
      const nv = !v;
      if (nv) setTempTitle(party.partyTitle);
      return nv;
    });
  };
  // 타이핑 중 보관
  const [tempTitle, setTempTitle] = useState(party.partyTitle);
  // 입력 완료 시 party에 저장
  const commitTitle = () => {
    const next = (tempTitle ?? '').trim();
    if (next === party.partyTitle) return;
    if (!next) return;
    setParty(p => ({...p, partyTitle: next}));
    Toast.show({
      type: 'success',
      text1: '제목이 저장되었습니다.',
      position: 'top',
      visibilityTime: 1200,
    });
  };

  // 이벤트 소개글 모달 상태
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventModalReset] = useState(false);

  const isNonEmpty = v =>
    !(v === null || v === undefined || (typeof v === 'string' && v.trim() === ''));

  const countThumbnails = (arr = []) => arr.filter(x => x?.isThumbnail === true).length;
  const exactlyOneThumbnail = (arr = []) => countThumbnails(arr) === 1;

  const enforceSingleThumbnail = (arr = []) => {
    let seen = false;
    return arr.map(img => {
      if (img?.isThumbnail && !seen) {
        seen = true;
        return img;
      }
      return {...img, isThumbnail: false};
    });
  };

  const stripDuplicatesByUrl = (arr = []) => {
    const seen = new Set();
    return arr.filter(x => {
      if (!x?.imageUrl) return false;
      if (seen.has(x.imageUrl)) return false;
      seen.add(x.imageUrl);
      return true;
    });
  };

  // 기본 정보 페이지에서 돌아올 때
  // payload 예시:
  // {
  //   description, tags, guesthouseId, recruitStartDate, recruitEndDate,
  //   partyStartTime, partyEndTime, isRecurring, repeatDays,
  //   minAttendees, maxAttendees, isGuest, amount, femaleAmount, maleNonAmount, femaleNonAmount,
  //   partyImages: [{imageUrl,isThumbnail}] 또는 imageUrls + thumbnailUrl
  // }
  const onSelectBasic = payload => {
    if (!payload) return;

    setParty(prev => {
      let nextImages = prev.partyImages;

      // partyImages 직접 내려오면 그대로 정규화
      if (Array.isArray(payload.partyImages)) {
        nextImages = enforceSingleThumbnail(stripDuplicatesByUrl(payload.partyImages));
      } else {
        // thumbnailUrl + imageUrls 형태로 올 수 있음
        const {thumbnailUrl, imageUrls} = payload;
        const thumbs = thumbnailUrl ? [{imageUrl: thumbnailUrl, isThumbnail: true}] : [];
        const others = (Array.isArray(imageUrls) ? imageUrls : []).map(u => ({imageUrl: u, isThumbnail: false}));
        nextImages = enforceSingleThumbnail(stripDuplicatesByUrl([...thumbs, ...others]));
      }

      return {
        ...prev,
        description: payload.description ?? prev.description,
        tags: payload.tags ?? prev.tags,
        guesthouseId: payload.guesthouseId ?? prev.guesthouseId,
        recruitStartDate: payload.recruitStartDate ?? prev.recruitStartDate,
        recruitEndDate: payload.recruitEndDate ?? prev.recruitEndDate,
        partyStartTime: payload.partyStartTime ?? prev.partyStartTime,
        partyEndTime: payload.partyEndTime ?? prev.partyEndTime,
        isRecurring: !!payload.isRecurring,
        repeatDays: Array.isArray(payload.repeatDays) ? payload.repeatDays : [],
        minAttendees: payload.minAttendees ?? prev.minAttendees,
        maxAttendees: payload.maxAttendees ?? prev.maxAttendees,
        isGuest: payload.isGuest ?? prev.isGuest,
        amount: payload.amount ?? prev.amount,
        femaleAmount: payload.femaleAmount ?? prev.femaleAmount,
        maleNonAmount: payload.maleNonAmount ?? prev.maleNonAmount,
        femaleNonAmount: payload.femaleNonAmount ?? prev.femaleNonAmount,
        partyImages: nextImages,
      };
    });
  };

  // 상세 안내 페이지에서 돌아올 때
  // payload: { detailSchedule, snackTagList, snacks, rules }
  const onSelectDetail = payload => {
    if (!payload) return;
    setParty(prev => ({
      ...prev,
      detailSchedule: payload.detailSchedule ?? prev.detailSchedule,
      snackTagList: Array.isArray(payload.snackTagList) ? payload.snackTagList : prev.snackTagList,
      snacks: payload.snacks ?? prev.snacks,
      rules: Array.isArray(payload.rules) ? payload.rules : prev.rules,
    }));
  };

  // 오시는 길 페이지에서 돌아올 때
  // payload: { meetingPlace, trafficInfo, parkingInfo, parkingTag }
  const onSelectWay = payload => {
    if (!payload) return;
    setParty(prev => ({
      ...prev,
      meetingPlace: payload.meetingPlace ?? prev.meetingPlace,
      trafficInfo: Array.isArray(payload.trafficInfo) ? payload.trafficInfo : prev.trafficInfo,
      parkingInfo: Array.isArray(payload.parkingInfo) ? payload.parkingInfo : prev.parkingInfo,
      parkingTag: Array.isArray(payload.parkingTag) ? payload.parkingTag : prev.parkingTag,
    }));
  };

  // 이벤트 소개글 모달에서 "적용"
  // payload: { partyEvents: [{eventName, eventDescription, partyEventImageUrls: string[]}|string] }
  const onSelectEvent = ({partyEvents}) => {
    const normalized = Array.isArray(partyEvents)
      ? partyEvents
          .map(e => {
            if (typeof e === 'string') {
              return {eventName: e, eventDescription: '', partyEventImageUrls: []};
            }
            return {
              eventName: e?.eventName ?? '',
              eventDescription: e?.eventDescription ?? '',
              partyEventImageUrls: Array.isArray(e?.partyEventImageUrls) ? e.partyEventImageUrls : [],
            };
          })
          .filter(e => e.eventName.trim() !== '')
      : [];
    setParty(p => ({...p, partyEvents: normalized}));
    setEventModalVisible(false);
  };

  const isTitleDone = isNonEmpty(party.partyTitle);
  const isBasicDone =
    isNonEmpty(party.description) &&
    typeof party.guesthouseId === 'number' &&
    party.guesthouseId > 0 &&
    isNonEmpty(party.recruitStartDate) &&
    isNonEmpty(party.recruitEndDate) &&
    isNonEmpty(party.partyStartTime) &&
    isNonEmpty(party.partyEndTime) &&
    Number(party.minAttendees) > 0 &&
    Number(party.maxAttendees) >= Number(party.minAttendees) &&
    Array.isArray(party.partyImages) &&
    party.partyImages.length >= 1 &&
    exactlyOneThumbnail(party.partyImages);
  const isEventDone = Array.isArray(party.partyEvents) && party.partyEvents.length > 0;
  const isDetailDone =
    isNonEmpty(party.detailSchedule) ||
    (Array.isArray(party.rules) && party.rules.length > 0) ||
    isNonEmpty(party.snacks);
  const isWayDone =
    isNonEmpty(party.meetingPlace) ||
    (Array.isArray(party.trafficInfo) && party.trafficInfo.length > 0) ||
    (Array.isArray(party.parkingInfo) && party.parkingInfo.length > 0);
  // 제출 가능(필수 최소값만)
  const isSubmitReady = isTitleDone && isBasicDone;

  const buildPayload = () => {
    const base = {
      // 공고 제목
      partyTitle: (party.partyTitle ?? '').trim(),

      // 기본 정보
      description: (party.description ?? '').trim(),
      tags: isNonEmpty(party.tags) ? String(party.tags) : undefined,
      guesthouseId: Number(party.guesthouseId),
      recruitStartDate: party.recruitStartDate,
      recruitEndDate: party.recruitEndDate,
      partyStartTime: party.partyStartTime,
      partyEndTime: party.partyEndTime,
      isRecurring: !!party.isRecurring,
      repeatDays: Array.isArray(party.repeatDays) ? party.repeatDays : [],
      minAttendees: Number(party.minAttendees),
      maxAttendees: Number(party.maxAttendees),
      isGuest: !!party.isGuest,
      amount: party.amount !== null && party.amount !== undefined ? Number(party.amount) : undefined,
      femaleAmount: party.femaleAmount !== null && party.femaleAmount !== undefined ? Number(party.femaleAmount) : undefined,
      maleNonAmount: party.maleNonAmount !== null && party.maleNonAmount !== undefined ? Number(party.maleNonAmount) : undefined,
      femaleNonAmount: party.femaleNonAmount !== null && party.femaleNonAmount !== undefined ? Number(party.femaleNonAmount) : undefined,
      partyImages: (party.partyImages || []).map(img => ({ imageUrl: img.imageUrl, isThumbnail: !!img.isThumbnail })),

      // 이벤트 소개글(모달)
      partyEvents:
        (party.partyEvents || []).map(e => ({
          eventName: e.eventName,
          eventDescription: e.eventDescription,
          partyEventImageUrls: Array.isArray(e.partyEventImageUrls) ? e.partyEventImageUrls : [],
        })),

      // 상세 안내(페이지)
      detailSchedule: isNonEmpty(party.detailSchedule) ? party.detailSchedule : undefined,
      snackTagList: Array.isArray(party.snackTagList) && party.snackTagList.length ? party.snackTagList : undefined,
      snacks: isNonEmpty(party.snacks) ? party.snacks : undefined,
      rules: Array.isArray(party.rules) && party.rules.length ? party.rules : undefined,

      // 오시는 길(페이지)
      meetingPlace: isNonEmpty(party.meetingPlace) ? party.meetingPlace : undefined,
      trafficInfo: Array.isArray(party.trafficInfo) && party.trafficInfo.length ? party.trafficInfo : undefined,
      parkingInfo: Array.isArray(party.parkingInfo) && party.parkingInfo.length ? party.parkingInfo : undefined,
      parkingTag: Array.isArray(party.parkingTag) && party.parkingTag.length ? party.parkingTag : undefined,
    };

    // undefined/null/빈문자열/빈배열 제거
    const pruned = {};
    Object.entries(base).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (Array.isArray(v) && v.length === 0) return;
      pruned[k] = v;
    });

    return pruned;
  };

  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Toast.show({type: 'error', text1: '필수 항목을 채워주세요.', position: 'top'});
      return;
    }
    const payload = buildPayload();

    try {
      await hostMeetApi.createParty(payload);
      Toast.show({type: 'success', text1: '이벤트가 등록되었습니다!', position: 'top', visibilityTime: 1200});
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || err.message,
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const logPayload = () => {
    console.log('[MyMeetAdd] ▶ API payload\n', JSON.stringify(buildPayload(), null, 2));
  };

  const renderRightIcon = (done) =>
  done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;

  return (
    <View style={styles.container}>
      <Header title="이벤트 등록" />

      <View style={styles.bodyContainer}>
        {/* 이벤트 제목 */}
        <View style={[styles.section, {flexDirection: 'column'}]}>
          {/* 헤더 */}
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={toggleTitleOpen}>
            <View style={styles.titleRow}>
              <Text style={[FONTS.fs_16_semibold, styles.title]}>이벤트 제목</Text>
              <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
            </View>
            {isTitleOpen ? (
              <ChevronUp width={24} height={24} />
            ) : (
              <ChevronDown width={24} height={24} />
            )}
          </TouchableOpacity>

          {/* 펼침 패널 */}
          {isTitleOpen && (
            <View style={styles.inlinePanel}>
              <TextInput
                value={tempTitle}
                onChangeText={setTempTitle}
                onEndEditing={commitTitle}
                onSubmitEditing={commitTitle}
                placeholder="이벤트 제목을 입력해 주세요."
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_14_medium, styles.titleInput]}
                maxLength={50}
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        {/* 기본 정보 (페이지로 이동하여 값 주고받기) */}
        <TouchableOpacity
          style={styles.section}
          onPress={() =>
            navigation.navigate('MeetBasics', {
              initialValues: {
                description: party.description,
                tags: party.tags,
                guesthouseId: party.guesthouseId,
                recruitStartDate: party.recruitStartDate,
                recruitEndDate: party.recruitEndDate,
                partyStartTime: party.partyStartTime,
                partyEndTime: party.partyEndTime,
                isRecurring: party.isRecurring,
                repeatDays: party.repeatDays,
                minAttendees: party.minAttendees,
                maxAttendees: party.maxAttendees,
                isGuest: party.isGuest,
                amount: party.amount,
                femaleAmount: party.femaleAmount,
                maleNonAmount: party.maleNonAmount,
                femaleNonAmount: party.femaleNonAmount,
                partyImages: party.partyImages,
              },
              onSelect: onSelectBasic,
            })
          }
        >
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={[FONTS.fs_16_semibold, styles.title]}>기본 정보</Text>
              <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
            </View>
            <Text style={[FONTS.fs_14_medium, styles.subTitle]}>
              소개 요약·시간 및 날짜·참여 인원·금액 등
            </Text>
          </View>
          {renderRightIcon(isBasicDone)}
        </TouchableOpacity>

        {/* 이벤트 소개글 (모달) */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setEventModalVisible(true)}
        >
          <View style={styles.titleSection}>
            <Text style={[FONTS.fs_16_semibold, styles.title]}>
              이벤트 소개글
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.subTitle]}>
              사진과 함께 자유롭게 작성해 보세요
            </Text>
          </View>
          {renderRightIcon(isEventDone)}
        </TouchableOpacity>

        {/* 상세 안내 (페이지) */}
        <TouchableOpacity
          style={styles.section}
          onPress={() =>
            navigation.navigate('MeetDetails', {
              initialValues: {
                detailSchedule: party.detailSchedule,
                snackTagList: party.snackTagList,
                snacks: party.snacks,
                rules: party.rules,
              },
              onSelect: onSelectDetail,
            })
          }
        >
          <View style={styles.titleSection}>
            <Text style={[FONTS.fs_16_semibold, styles.title]}>
              상세 안내
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.subTitle]}>
              상세 일정·음식 제공 여부·이용 규칙
            </Text>
          </View>
          {renderRightIcon(isDetailDone)}
        </TouchableOpacity>

        {/* 오시는 길 (페이지) */}
        <TouchableOpacity
          style={styles.section}
          onPress={() =>
            navigation.navigate('MeetDirections', {
              initialValues: {
                meetingPlace: party.meetingPlace,
                trafficInfo: party.trafficInfo,
                parkingInfo: party.parkingInfo,
                parkingTag: party.parkingTag,
              },
              onSelect: onSelectWay,
            })
          }
        >
          <View style={styles.titleSection}>
            <Text style={[FONTS.fs_16_semibold, styles.title]}>
              오시는 길
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.subTitle]}>
              집합 장소·교통 정보·주차 안내
            </Text>
          </View>
          {renderRightIcon(isWayDone)}
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          필수 항목을 입력하셔야 등록이 완료됩니다.
        </Text>

        {/* <TouchableOpacity onPress={logPayload}>
          <Text>데이터 보기</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.submitButton, !isSubmitReady && styles.submitButtonDisabled]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}>
            등록하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24} />
          ) : (
            <CheckBlack width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 이벤트 소개글 모달 */}
      <MeetEventModal
        visible={eventModalVisible}
        shouldResetOnClose={eventModalReset}
        onClose={() => setEventModalVisible(false)}
        onSelect={onSelectEvent}
      />
    </View>
  );
};

export default MyMeetAdd;
