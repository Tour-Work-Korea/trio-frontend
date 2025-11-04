import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import styles from './MyMeetAdd.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostMeetApi from '@utils/api/hostMeetApi';

import MeetIntroModal from '@components/modals/HostMy/Meet/AddMeet/MeetIntroModal';
import MeetLocationModal from '@components/modals/HostMy/Meet/AddMeet/MeetLocationModal';
import MeetDateModal from '@components/modals/HostMy/Meet/AddMeet/MeetDateModal';
import MeetPriceModal from '@components/modals/HostMy/Meet/AddMeet/MeetPriceModal';
import MeetInfoModal from '@components/modals/HostMy/Meet/AddMeet/MeetInfoModal';
import MeetEventModal from '@components/modals/HostMy/Meet/AddMeet/MeetEventModal';
import MeetPhotoModal from '@components/modals/HostMy/Meet/AddMeet/MeetPhotoModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

const MyMeetAdd = () => {
  const navigation = useNavigation();

  const [party, setParty] = useState({
    partyTitle: '',
    description: '',
    guesthouseId: null,
    recruitStartDate: '',          // YYYY-MM-DD
    recruitEndDate: '',            // YYYY-MM-DD
    partyStartTime: '19:00:00',    // HH:mm:ss
    partyEndTime: '22:00:00',      // HH:mm:ss
    isRecurring: false,
    repeatDays: [],                // ["MONDAY", ...]
    minAttendees: null,
    maxAttendees: null,
    isGuest: false,
    amount: null,                  // 숙박 남
    femaleAmount: null,            // 숙박 여
    maleNonAmount: null,           // 비숙 남
    femaleNonAmount: null,         // 비숙 여
    partyFacilities: [],           // [{id:1},...]
    partyInfo: '',
    partyEvents: [],               // [{eventName:""}...]
    partyImages: [],               // [{imageUrl,isThumbnail}]
  });

  // 모임 제목
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
    setParty(p => ({ ...p, partyTitle: next }));
    Toast.show({
      type: 'success',
      text1: '제목이 저장되었습니다.',
      position: 'top',
      visibilityTime: 1200,
    });
  };
  // 모임 배너사진(대표사진) 및 소개요약 모달
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introModalReset, setIntroModalReset] = useState(true);
  // 모임 장소 모달(게하 선택)
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationModalReset, setLocationModalReset] = useState(true); 
  // 모임 날짜 모달
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateModalReset, setDateModalReset] = useState(true);
  // 모임 인원 및 금액 모달
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceModalReset, setPriceModalReset] = useState(true);
  // 모임 정보 모달
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalReset, setInfoModalReset] = useState(true);
  // 모임 이벤트 모달
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventModalReset, setEventModalReset] = useState(true);
  // 모임 사진 모달
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalReset, setPhotoModalReset] = useState(true);

  // 유효성 체크
  const isNonEmpty = (v) =>
    !(v === null || v === undefined || (typeof v === 'string' && v.trim() === ''));

  const countThumbnails = (arr = []) => arr.filter((x) => x?.isThumbnail === true).length;
  const exactlyOneThumbnail = (arr = []) => countThumbnails(arr) === 1;
  const hasThumbnail = (arr = []) => countThumbnails(arr) >= 1;
  const enforceSingleThumbnail = (arr = []) => {
    // 첫 번째 썸네일만 유지하고 나머지는 false로 강제
    let seenThumb = false;
    return arr.map((img) => {
      if (img?.isThumbnail && !seenThumb) {
        seenThumb = true;
        return img;
      }
      // 나머지는 전부 false
      return { ...img, isThumbnail: false };
    });
  };
  const stripDuplicatesByUrl = (arr = []) => {
    const seen = new Set();
    return arr.filter((x) => {
      if (!x?.imageUrl) return false;
      if (seen.has(x.imageUrl)) return false;
      seen.add(x.imageUrl);
      return true;
    });
  };

  // ================= 모달 onSelect 핸들러 =================
  // 모달 onSelect 계약:
  // Title:      ({ partyTitle })
  // Intro:      ({ description, thumbnailUrl })  // 썸네일 1장 (isThumbnail:true)
  // Location:   ({ guesthouseId })
  // Date:       ({ isRecurring, repeatDays, recruitStartDate, recruitEndDate, partyStartTime, partyEndTime })
  // Price:      ({ minAttendees, maxAttendees, isGuest, amount, femaleAmount, maleNonAmount, femaleNonAmount })
  // Info:       ({ partyInfo, partyFacilities }) // facilities는 [{id}] 배열
  // Event:      ({ partyEvents })               // [{eventName}]
  // Photo:      ({ imageUrls })                 // string[] (썸네일 false로 들어감)

  // 모임 배너사진 및 소개요약 모달에서 "적용" 눌렀을 때
  const onSelectIntro = ({ description, thumbnailUrl }) => {
    if (!thumbnailUrl) {
      Toast.show({ type: 'error', text1: '대표 사진을 1장 선택해주세요.' });
      return;
    }
    setParty((p) => {
      // 기존 모든 썸네일 제거 -> 새 썸네일 1장만 세팅
      const others = (p.partyImages || []).filter((img) => !img.isThumbnail);
      const next = [{ imageUrl: thumbnailUrl, isThumbnail: true }, ...others];
      return {
        ...p,
        description: description ?? p.description,
        partyImages: enforceSingleThumbnail(stripDuplicatesByUrl(next)),
      };
    });
    setIntroModalReset(false); // 닫아도 초기화 안 함
    setIntroModalVisible(false);
  };

  // 모임 장소 모달에서 "적용" 눌렀을 때
  const onSelectLocation = ({ guesthouseId }) => {
    setParty((p) => ({ ...p, guesthouseId }));
    setLocationModalReset(false); // 닫아도 초기화 안 함
    setLocationModalVisible(false);
  };

  // 모임 날짜 모달에서 "적용" 눌렀을 때
  const onSelectDate = (payload) => {
    const {
      isRecurring,
      repeatDays,
      recruitStartDate,
      recruitEndDate,
      partyStartTime,
      partyEndTime,
    } = payload || {};
    setParty((p) => ({
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

  // 모임 인원 및 금액 모달에서 "적용" 눌렀을 때
  const onSelectPrice = (payload) => {
    const {
      minAttendees,
      maxAttendees,
      isGuest,
      amount,
      femaleAmount,
      maleNonAmount,
      femaleNonAmount,
    } = payload || {};
    setParty((p) => ({
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

  // 모임 정보 모달에서 "적용" 눌렀을 때
  const onSelectInfo = ({ partyInfo, partyFacilities }) => {
    setParty((p) => ({
      ...p,
      partyInfo: partyInfo ?? p.partyInfo,
      partyFacilities: Array.isArray(partyFacilities) ? partyFacilities : p.partyFacilities,
    }));
    setInfoModalReset(false); // 닫아도 초기화 안 함
    setInfoModalVisible(false);
  };

  // 모임 이벤트 모달에서 "적용" 눌렀을 때
  const onSelectEvent = ({ partyEvents }) => {
    // 문자열 배열/객체 배열 모두 허용
    const normalized =
      Array.isArray(partyEvents)
        ? partyEvents.map((e) =>
            typeof e === 'string' ? { eventName: e } : { eventName: e?.eventName ?? '' }
          ).filter((e) => e.eventName.trim() !== '')
        : [];
    setParty((p) => ({ ...p, partyEvents: normalized }));
    setEventModalReset(false); // 닫아도 초기화 안 함
    setEventModalVisible(false);
  };

  // 모임 사진 모달에서 "적용" 눌렀을 때
  const onSelectPhoto = ({ imageUrls }) => {
    setParty((p) => {
      const thumbs = (p.partyImages || []).filter((img) => img.isThumbnail); // 기존 썸네일 유지
      const others = (Array.isArray(imageUrls) ? imageUrls : [])
        .map((u) => ({ imageUrl: u, isThumbnail: false }));
      // 혹시 상태 상 썸네일이 중복으로 존재할 때 강제 1장만
      const merged = enforceSingleThumbnail(stripDuplicatesByUrl([...thumbs, ...others]));
      return { ...p, partyImages: merged };
    });
    setPhotoModalReset(false); // 닫아도 초기화 안 함
    setPhotoModalVisible(false);
  };

  // // ================= 섹션 완료 플래그 =================
  // const isTitleDone = isNonEmpty(party.partyTitle);
  const isIntroDone =
  isNonEmpty(party.description) && exactlyOneThumbnail(party.partyImages);
  const isLocationDone = typeof party.guesthouseId === 'number' && party.guesthouseId > 0;
  const isDateDone =
    isNonEmpty(party.recruitStartDate) &&
    isNonEmpty(party.recruitEndDate) &&
    isNonEmpty(party.partyStartTime) &&
    isNonEmpty(party.partyEndTime) &&
    (!party.isRecurring || (party.isRecurring && party.repeatDays.length > 0));
  const isPriceDone =
    Number.isFinite(Number(party.minAttendees)) &&
    Number.isFinite(Number(party.maxAttendees)) &&
    Number(party.minAttendees) > 0 &&
    Number(party.maxAttendees) >= Number(party.minAttendees) &&
    [party.amount, party.femaleAmount, party.maleNonAmount, party.femaleNonAmount].every(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 0
    );
  const isInfoDone = isNonEmpty(party.partyInfo);
  const isEventDone = Array.isArray(party.partyEvents) && party.partyEvents.length > 0;
  const isPhotoDone =
    Array.isArray(party.partyImages) &&
    party.partyImages.length >= 1 &&
    exactlyOneThumbnail(party.partyImages);

  const isSubmitReady =
    // isTitleDone &&
    isIntroDone &&
    isLocationDone &&
    isDateDone &&
    isPriceDone &&
    isInfoDone &&
    isEventDone &&
    isPhotoDone;
  
  const renderRightIcon = (done) =>
    done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;

  // 등록
  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Toast.show({ type: 'error', text1: '입력이 완료되지 않았어요.' });
      return;
    }

    // 전송 페이로드 (필요 시 정제)
    const payload = {
      partyTitle: party.partyTitle.trim(),
      description: party.description.trim(),
      guesthouseId: Number(party.guesthouseId),
      recruitStartDate: party.recruitStartDate,
      recruitEndDate: party.recruitEndDate,
      partyStartTime: party.partyStartTime,
      partyEndTime: party.partyEndTime,
      isRecurring: !!party.isRecurring,
      repeatDays: party.repeatDays,
      minAttendees: Number(party.minAttendees),
      maxAttendees: Number(party.maxAttendees),
      isGuest: !!party.isGuest,
      amount: Number(party.amount),
      femaleAmount: Number(party.femaleAmount),
      maleNonAmount: Number(party.maleNonAmount),
      femaleNonAmount: Number(party.femaleNonAmount),
      partyFacilities: party.partyFacilities.map((f) => ({ id: Number(f.id) })),
      partyInfo: party.partyInfo,
      partyEvents: party.partyEvents.map((e) => ({ eventName: e.eventName })),
      partyImages: party.partyImages.map((img) => ({
        imageUrl: img.imageUrl,
        isThumbnail: !!img.isThumbnail,
      })),
    };

    try {
      await hostMeetApi.createParty(payload);
      Toast.show({
        type: 'success',
        text1: '모임이 등록되었습니다!',
        position: 'top',
        visibilityTime: 1200,
      });      
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        // text1: '등록에 실패했어요',
        text1: err?.response?.data?.message || err.message,
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // 디버그: 현재 입력값으로 전송될 payload 콘솔 출력
const logPayload = () => {
  const payload = {
    partyTitle: (party.partyTitle ?? '').trim(),
    description: (party.description ?? '').trim(),
    guesthouseId: Number(party.guesthouseId),
    recruitStartDate: party.recruitStartDate,
    recruitEndDate: party.recruitEndDate,
    partyStartTime: party.partyStartTime,
    partyEndTime: party.partyEndTime,
    isRecurring: !!party.isRecurring,
    repeatDays: party.repeatDays,
    minAttendees: Number(party.minAttendees),
    maxAttendees: Number(party.maxAttendees),
    isGuest: !!party.isGuest,
    amount: Number(party.amount),
    femaleAmount: Number(party.femaleAmount),
    maleNonAmount: Number(party.maleNonAmount),
    femaleNonAmount: Number(party.femaleNonAmount),
    partyFacilities: (party.partyFacilities || []).map(f => ({ id: Number(f.id) })),
    partyInfo: party.partyInfo,
    partyEvents: (party.partyEvents || []).map(e => ({ eventName: e.eventName })),
    partyImages: (party.partyImages || []).map(img => ({
      imageUrl: img.imageUrl,
      isThumbnail: !!img.isThumbnail,
    })),
  };

  console.log('[MyMeetAdd] ▶ API payload\n', JSON.stringify(payload, null, 2));
};

  return (
    <View style={styles.container}>
      <Header title="모임 등록" />

      <View style={styles.bodyContainer}>
        {/* 모임 제목 */}
        <View style={[styles.section, {flexDirection: 'column'}]}>
          {/* 헤더 */}
          <TouchableOpacity style={styles.sectionHeaderRow} onPress={toggleTitleOpen}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>
              모임 제목
            </Text>
            {isTitleOpen ? <ChevronUp width={24} height={24} /> : <ChevronDown width={24} height={24} />}
          </TouchableOpacity>

          {/* 펼침 패널 */}
          {isTitleOpen && (
            <View style={styles.inlinePanel}>
              <TextInput
                value={tempTitle}
                onChangeText={setTempTitle}
                onEndEditing={commitTitle}
                onSubmitEditing={commitTitle}
                placeholder="모임 제목을 입력해 주세요."
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_14_medium, styles.titleInput]}
                maxLength={50}
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        {/* 모임 배너사진(대표사진) 및 소개요약 조회 */}
        <TouchableOpacity style={styles.section} onPress={() => setIntroModalVisible(true)}>
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 배너사진 및 소개요약</Text>
          {renderRightIcon(isIntroDone)}
        </TouchableOpacity>

        {/* 모임 장소 정보 */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setLocationModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 장소</Text>
          {renderRightIcon(isLocationDone)}
        </TouchableOpacity>

        {/* 모임 날짜 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setDateModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 날짜</Text>
          {renderRightIcon(isDateDone)}
        </TouchableOpacity>

        {/* 모임 인원 및 금액 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setPriceModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 인원 및 금액</Text>
          {renderRightIcon(isPriceDone)}
        </TouchableOpacity>

        {/* 모임 정보 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setInfoModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 정보</Text>
          {renderRightIcon(isInfoDone)}
        </TouchableOpacity>

        {/* 모임 이벤트 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setEventModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 이벤트</Text>
          {renderRightIcon(isEventDone)}
        </TouchableOpacity>

        {/* 모임 사진 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setPhotoModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>모임 사진</Text>
          {renderRightIcon(isPhotoDone)}
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          모든 항목을 입력하셔야 등록이 완료됩니다.
        </Text>

        <TouchableOpacity onPress={logPayload}>
          <Text>데이터 보기</Text>
        </TouchableOpacity>
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
          onPress={handleSubmit}
        >
          <Text 
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}
          >
            등록하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24}/>
          ) : (
            <CheckBlack width={24} height={24}/>
          )}
        </TouchableOpacity>
      </View>

      {/* 모임 배너사진 및 소개요약 모달 */}
      <MeetIntroModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        onSelect={onSelectIntro}
      />

      {/* 모임 장소 모달 */}
      <MeetLocationModal
        visible={locationModalVisible}
        shouldResetOnClose={locationModalReset}
        onClose={() => setLocationModalVisible(false)}
        onSelect={onSelectLocation}
      />
      
      {/* 모임 날짜 모달 */}
      <MeetDateModal
        visible={dateModalVisible}
        shouldResetOnClose={dateModalReset}
        onClose={() => setDateModalVisible(false)}
        onSelect={onSelectDate}
      />

      {/* 모임 인원 및 금액 모달 */}
      <MeetPriceModal
        visible={priceModalVisible}
        shouldResetOnClose={priceModalReset}
        onClose={() => setPriceModalVisible(false)}
        onSelect={onSelectPrice}
      />

      {/* 모임 정보 모달 */}
      <MeetInfoModal
        visible={infoModalVisible}
        shouldResetOnClose={infoModalReset}
        onClose={() => setInfoModalVisible(false)}
        onSelect={onSelectInfo}
      />

      {/* 모임 이벤트 모달 */}
      <MeetEventModal
        visible={eventModalVisible}
        shouldResetOnClose={eventModalReset}
        onClose={() => setEventModalVisible(false)}
        onSelect={onSelectEvent}
      />

      {/* 모임 사진 모달 */}
      <MeetPhotoModal
        visible={photoModalVisible}
        shouldResetOnClose={photoModalReset}
        onClose={() => setPhotoModalVisible(false)}
        onSelect={onSelectPhoto}
      />
    </View>
  );
};

export default MyMeetAdd;