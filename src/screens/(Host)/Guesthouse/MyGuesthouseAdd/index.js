import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

import styles from './MyGuesthouseAdd.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import GuesthousePostRegisterModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthousePostRegisterModal';
import GuesthouseInfoModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseInfoModal';
import GuesthouseIntroSummaryModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseIntroSummaryModal';
import GuesthouseRoomModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseRoom/GuesthouseRoomModal';
import GuesthouseDetailInfoModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseDetailInfoModal';
import GuesthouseRulesModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseRulesModal';
import GuesthouseAmenitiesModal from '@components/modals/HostMy/Guesthouse/AddGuesthouse/GuesthouseAmenitiesModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

const MyGuesthouseAdd = () => {
  const navigation = useNavigation();

  const [guesthouse, setGuesthouse] = useState({
    guesthouseName: '',
    guesthouseAddress: '',
    guesthousePhone: '',
    guesthouseShortIntro: '',
    guesthouseLongDesc: '',
    checkIn: '15:00:00',
    checkOut: '11:00:00',
    guesthouseImages: [],
    roomInfos: [],
    amenities: [],
    hashtagIds: [],
    rules: '',
    guesthouseDetailAddress: '',
  });

  // 게스트하우스 게시물 등록 모달
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postModalReset, setPostModalReset] = useState(true);
  // 게스트하우스 정보 모달
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalReset, setInfoModalReset] = useState(true);
  // 게스트하우스 소개요약 모달
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [introModalReset, setIntroModalReset] = useState(true);
  // 객실 모달
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [roomModalReset, setRoomModalReset] = useState(true);
  // 상세정보 모달
  const [detailInfoModalVisible, setDetailInfoModalVisible] = useState(false);
  const [detailInfoModalReset, setDetailInfoModalReset] = useState(true);
  // 이용규칙 모달
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [rulesModalReset, setRulesModalReset] = useState(true);
  // 편의시설 모달
  const [amenitiesModalVisible, setAmenitiesModalVisible] = useState(false);
  const [amenitiesModalReset, setAmenitiesModalReset] = useState(true);

  // 선택된 입점 신청서 정보
  const [selectedApplication, setSelectedApplication] = useState(null);

  // 게시물 등록 모달에서 "적용" 눌렀을 때
  const handlePostRegisterSelect = (application) => {
    setSelectedApplication(application); // { id, businessName, address, detailAddress,businessPhone }
    setPostModalReset(false); // 닫아도 초기화 안 함
    setPostModalVisible(false);
  };

  // 게스트하우스 정보 모달에서 "적용" 눌렀을 때
  const handleInfoSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseName: data.name,
      guesthouseAddress: data.address,
      guesthouseDetailAddress: data.addressDetail || '',
      guesthousePhone: data.phone,
      hashtagIds: data.tagIds,
      checkIn: data.checkIn,
      checkOut: data.checkOut
    }));
    setInfoModalReset(false); // 닫아도 초기화 안 함
    setInfoModalVisible(false);
  };

  // 게스트하우스 소개요약 모달에서 "적용" 눌렀을 때
  const handleIntroSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseImages: data.guesthouseImages,
      guesthouseShortIntro: data.shortIntroText,
    }));
    setIntroModalReset(false); // 닫아도 초기화 안 함
    setIntroModalVisible(false);
  };

  // 객실 모달에서 "적용" 눌렀을 때
  const handleRoomSelect = (rooms) => {
    setGuesthouse(prev => ({
      ...prev,
      roomInfos: rooms,
    }));
    setRoomModalReset(false); // 닫아도 유지
    setRoomModalVisible(false);
  };

  // 상세정보 모달에서 "적용" 눌렀을 때
  const handleDetailInfoSelect = (data) => {
    setGuesthouse(prev => ({
      ...prev,
      guesthouseLongDesc: data.guesthouseLongDesc,
    }));
    setDetailInfoModalReset(false); // 닫아도 유지
    setDetailInfoModalVisible(false);
  };

  // 이용규칙 모달에서 "적용" 눌렀을 때
  const handleRulesSelect = (rulesText) => {
    setGuesthouse(prev => ({ ...prev, rules: rulesText }));
    setRulesModalReset(false); // 닫아도 유지
    setRulesModalVisible(false);
  };

  // 선택된 amenities
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  // 편의시설 모달에서 "적용" 눌렀을 때
  const handleAmenitiesSelect = (ids) => {
    setGuesthouse(prev => ({
      ...prev,
      amenities: ids.map(id => ({ amenityId: id, count: 1 })),
    }));
    setSelectedAmenities(ids); // 아이디 배열 저장
    setAmenitiesModalReset(false); 
    setAmenitiesModalVisible(false);
  };

  // 유효성 체크
  const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
  const hasThumb = (arr = []) => Array.isArray(arr) && arr.some(i => i?.isThumbnail === true);
  const isRoomValid = (room) => {
    return (
      isNonEmpty(room?.roomName) &&
      ['MIXED','MALE_ONLY','FEMALE_ONLY'].includes(room?.roomType ?? '') &&
      Number.isFinite(Number(room?.roomCapacity)) &&
      isNonEmpty(room?.roomDesc) &&
      // 가격은 숫자 문자열도 허용 -> 서버에서 BigDecimal로 파싱
      isNonEmpty(room?.roomPrice) && !isNaN(Number(room?.roomPrice)) &&
      Array.isArray(room?.roomImages) && room.roomImages.length > 0 &&
      hasThumb(room.roomImages)
    );
  };

  const isSubmitReady =
    // 기본 정보
    isNonEmpty(guesthouse.guesthouseName) &&
    isNonEmpty(guesthouse.guesthouseAddress) &&
    isNonEmpty(guesthouse.guesthousePhone) &&
    isNonEmpty(guesthouse.guesthouseShortIntro) &&
    isNonEmpty(guesthouse.guesthouseLongDesc) &&
    isNonEmpty(guesthouse.rules) && 
    // 신청서 선택
    !!selectedApplication?.id &&
    // 체크인/체크아웃은 기본값 존재하므로 생략 가능 (원하면 isNonEmpty로 체크)
    // 이미지(숙소)
    Array.isArray(guesthouse.guesthouseImages) &&
    guesthouse.guesthouseImages.length > 0 &&
    hasThumb(guesthouse.guesthouseImages) &&
    // 객실
    Array.isArray(guesthouse.roomInfos) &&
    guesthouse.roomInfos.length > 0 &&
    guesthouse.roomInfos.every(isRoomValid) &&
    // 편의시설(최소 1개)
    Array.isArray(guesthouse.amenities) &&
    guesthouse.amenities.length > 0 &&
    // 해시태그(선택 기준이 있다면 유지)
    Array.isArray(guesthouse.hashtagIds) &&
    guesthouse.hashtagIds.length > 0;

  const handleSubmit = async () => {
    if (!isSubmitReady) return;

    try {
      const payload = {
        ...guesthouse,
        applicationId: selectedApplication?.id,
        roomInfos: guesthouse.roomInfos.map(room => ({
          ...room,
          roomCapacity: Number(room.roomCapacity),
          roomMaxCapacity: Number(room.roomMaxCapacity),
          roomPrice: Number(room.roomPrice), // 가격도 숫자 변환
        })),
      };

      // console.log('📦 Guesthouse 등록 payload:', JSON.stringify(payload, null, 2));

      const res = await hostGuesthouseApi.registerGuesthouse(payload);
      console.log('등록 성공', res.data);
      Toast.show({
        type: 'success',
        text1: '게스트하우스가 등록되었습니다!',
        position: 'top',
        visibilityTime: 1200,
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
      
    } catch (error) {
      Alert.alert('등록 실패', '잠시 후 다시 시도해주세요.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    }
  };

  // 섹션 완료 여부 플래그
  const isPostDone = !!selectedApplication?.id;

  const isInfoDone =
    isNonEmpty(guesthouse.guesthouseName) &&
    isNonEmpty(guesthouse.guesthouseAddress) &&
    isNonEmpty(guesthouse.guesthousePhone) &&
    isNonEmpty(guesthouse.checkIn) &&
    isNonEmpty(guesthouse.checkOut) &&
    Array.isArray(guesthouse.hashtagIds) &&
    guesthouse.hashtagIds.length > 0;

  const isIntroDone =
    isNonEmpty(guesthouse.guesthouseShortIntro) &&
    Array.isArray(guesthouse.guesthouseImages) &&
    guesthouse.guesthouseImages.length > 0 &&
    hasThumb(guesthouse.guesthouseImages);

  const isRoomDone =
    Array.isArray(guesthouse.roomInfos) &&
    guesthouse.roomInfos.length > 0 &&
    guesthouse.roomInfos.every(isRoomValid);

  const isDetailDone = isNonEmpty(guesthouse.guesthouseLongDesc);

  const isRulesDone = isNonEmpty(guesthouse.rules);

  const isAmenitiesDone =
    Array.isArray(guesthouse.amenities) &&
    guesthouse.amenities.length > 0;

  // 아이콘 렌더 유틸
  const renderRightIcon = (done, enabled = true) => {
    if (!enabled) return <ChevronRight width={24} height={24} />;
    return done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;
  };

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 등록" />

      <View style={styles.bodyContainer}>
        {/* 임점신청서 조회 */}
        <TouchableOpacity style={styles.section} onPress={() => setPostModalVisible(true)}>
          <Text style={[FONTS.fs_16_semibold, styles.title, { color: COLORS.primary_orange }]}>게스트하우스 게시물 등록</Text>
          {renderRightIcon(isPostDone)}
        </TouchableOpacity>

        {/* 게스트하우스 정보 */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setInfoModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>게스트하우스 정보</Text>
          {renderRightIcon(isInfoDone, !!selectedApplication)}
        </TouchableOpacity>

        {/* 게스트하우스 소개요약 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setIntroModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>게스트하우스 소개요약</Text>
          {renderRightIcon(isIntroDone, !!selectedApplication)}
        </TouchableOpacity>

        {/* 객실 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setRoomModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>객실</Text>
          {renderRightIcon(isRoomDone, !!selectedApplication)}
        </TouchableOpacity>

        {/* 상세정보 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setDetailInfoModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>상세정보</Text>
          {renderRightIcon(isDetailDone, !!selectedApplication)}
        </TouchableOpacity>

        {/* 이용규칙 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setRulesModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>이용규칙</Text>
          {renderRightIcon(isRulesDone, !!selectedApplication)}
        </TouchableOpacity>

        {/* 편의시설 및 서비스 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setAmenitiesModalVisible(true)}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>편의시설 및 서비스</Text>
          {renderRightIcon(isAmenitiesDone, !!selectedApplication)}
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          모든 항목을 입력하셔야 등록이 완료됩니다.
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

      {/* 게스트하우스 게시물 등록 모달 */}
      <GuesthousePostRegisterModal
        visible={postModalVisible}
        shouldResetOnClose={postModalReset}
        onClose={() => setPostModalVisible(false)}
        onSelect={handlePostRegisterSelect}
      />

      {/* 게스트하우스 정보 모달 */}
      <GuesthouseInfoModal
        visible={infoModalVisible}
        shouldResetOnClose={infoModalReset}
        onClose={() => setInfoModalVisible(false)}
        defaultName={selectedApplication?.businessName || ''}
        defaultAddress={selectedApplication?.address || ''}
        defaultPhone={selectedApplication?.businessPhone || ''}
        onSelect={handleInfoSelect}
      />

      {/* 게스트하우스 소개요약 모달 */}
      <GuesthouseIntroSummaryModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        onSelect={handleIntroSelect}
      />
      
      {/* 객실 모달 */}
      <GuesthouseRoomModal
        visible={roomModalVisible}
        shouldResetOnClose={roomModalReset}
        onClose={() => setRoomModalVisible(false)}
        onSelect={handleRoomSelect}
      />

      {/* 상세정보 모달 */}
      <GuesthouseDetailInfoModal
        visible={detailInfoModalVisible}
        shouldResetOnClose={detailInfoModalReset}
        onClose={() => setDetailInfoModalVisible(false)}
        onSelect={handleDetailInfoSelect}
      />

      {/* 이용규칙 모달 */}
      <GuesthouseRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        onSelect={handleRulesSelect}
      />

      {/* 편의시설 및 서비스 모달 */}
      <GuesthouseAmenitiesModal
        visible={amenitiesModalVisible}
        shouldResetOnClose={amenitiesModalReset}
        onClose={() => setAmenitiesModalVisible(false)}
        onSelect={handleAmenitiesSelect}
      />
    </View>
  );
};

export default MyGuesthouseAdd;