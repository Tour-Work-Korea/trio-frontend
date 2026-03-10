import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';

import styles from './MyGuesthouseEdit.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import GuesthouseInfoModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseInfoModal';
import GuesthouseIntroSummaryModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseIntroSummaryModal';
import GuesthouseRoomModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRoom/GuesthouseRoomModal';
import GuesthouseDetailInfoModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseDetailInfoModal';
import GuesthouseRulesModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseRulesModal';
import GuesthouseAmenitiesModal from '@components/modals/HostMy/Guesthouse/EditGuesthouse/GuesthouseAmenitiesModal';
import { guesthouseTags } from '@constants/guesthouseTags';
import { publicFacilities, roomFacilities, services } from '@constants/guesthouseOptions';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckWhite from '@assets/images/check_white.svg';

// 해시태그 맵핑
const nameToId = (name) => guesthouseTags.find(t => t.hashtag === name)?.id ?? null;
const idToName = (id) => guesthouseTags.find(t => t.id === id)?.hashtag ?? null;
const toTagObjectByName = (name) => {
  const found = guesthouseTags.find(t => t.hashtag === name);
  return found ? { id: found.id, hashtag: found.hashtag } : { id: null, hashtag: name };
};

// 어매너티 이름→id 매핑
const AMENITY_NAME_TO_ID = [
  ...publicFacilities,
  ...roomFacilities,
  ...services,
].reduce((acc, cur) => {
  acc[cur.name] = cur.id;
  return acc;
}, {});
// 어매너티 id→이름 매핑
const AMENITY_ID_TO_NAME = [
  ...publicFacilities,
  ...roomFacilities,
  ...services,
].reduce((acc, cur) => {
  acc[cur.id] = cur.name;
  return acc;
}, {});

const MyGuesthouseEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
    hashtags: [],
    rules: '',
    guesthouseDetailAddress: '',
  });

  // 선택된 amenities id만 별도로 들고 다니는 상태 (모달 프리셋용)
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // 상세 화면에서 보낸 초기값 주입
  useEffect(() => {
    const initial = route.params?.initialGuesthouse;
    if (!initial) return;

    // 해시태그 처리
    const hashtagNames = Array.isArray(initial.hashtags) ? initial.hashtags : [];
    const hashtagIds = hashtagNames.map(nameToId).filter(v => v !== null);

    // 어매너티 문자열(amenityType 라벨) | { amenityId } | (상세의) { amenityType } 모두 대응
    const initAmenities = initial.amenities || [];
    let selectedIds = [];

    if (initAmenities.length > 0) {
      const first = initAmenities[0];
      if (typeof first === 'string') {
        selectedIds = initAmenities
          .map(name => AMENITY_NAME_TO_ID[name])
          .filter(Boolean);
      } else if (first && typeof first === 'object') {
        if ('amenityId' in first) {
          selectedIds = initAmenities
            .map(a => a.amenityId)
            .filter(v => v != null);
        } else if ('amenityType' in first) {
          selectedIds = initAmenities
            .map(a => AMENITY_NAME_TO_ID[a.amenityType])
            .filter(Boolean);
        }
      }
    }

    setGuesthouse(prev => ({
      ...prev,
      ...initial,
      hashtagIds,            // 모달 프리셋/서버 전송용
      hashtags: hashtagNames, // 화면 표기용
      // 내부 상태는 id 기반으로 맞춰서 들고다니면 이후 처리(저장) 편함
      amenities: selectedIds.map(id => ({ amenityId: id, count: 1 })),
    }));
    setSelectedAmenities(selectedIds);
  }, [route.params]);

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

  // 게스트하우스 정보 모달에서 "적용" 눌렀을 때
  const handleInfoSelect = (data) => {
    const namesFromIds = (data.tagIds || [])
    .map(idToName)
    .filter(Boolean);

    setGuesthouse(prev => ({
      ...prev,
      guesthouseName: data.name,
      guesthouseAddress: data.address,
      guesthouseDetailAddress: data.addressDetail || '',
      guesthousePhone: data.phone,
      hashtagIds: data.tagIds,   // 서버 전송/프리셋(id)
      hashtags: namesFromIds,    // 미리보기/렌더용(이름)
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

  // 편의시설 모달에서 "적용" 눌렀을 때
  const handleAmenitiesSelect = (ids) => {
    setGuesthouse(prev => ({
      ...prev,
      amenities: ids.map(id => ({ amenityId: id, count: 1 })),
    }));
    setSelectedAmenities(ids);
    setAmenitiesModalReset(false); 
    setAmenitiesModalVisible(false);
  };

  const handleSubmit = async () => {
    Toast.show({
      type: 'success',
      text1: '수정이 완료되었습니다!',
      position: 'top',
      visibilityTime: 1200,
    });
    navigation.goBack()
  };

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 게시물 수정" />

      <View style={styles.bodyContainer}>
        {/* 게스트하우스 정보 */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => setInfoModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>게스트하우스 정보 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 게스트하우스 소개요약 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setIntroModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>게스트하우스 소개요약 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 객실 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setRoomModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>객실 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 상세정보 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setDetailInfoModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>상세정보 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 이용규칙 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setRulesModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>이용규칙 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 편의시설 및 서비스 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setAmenitiesModalVisible(true)}
        >
          <Text style={[FONTS.fs_14_medium, styles.title]}>편의시설 및 서비스 수정</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          각 섹션마다 수정사항이 바로 적용됩니다.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.previewButton}
          onPress={() => {
            // 해시태그: 이름 -> {id, hashtag}
            const previewHashtags = (guesthouse?.hashtags || [])
              .map(toTagObjectByName)
              .filter(t => t.id !== null);

            // 어매니티: 상태가 어떤 형태든 "이름" 배열로 통일
            const previewAmenities = (guesthouse?.amenities || [])
              .map(a => {
                if (typeof a === 'string') return a;                  // 이미 이름
                if (typeof a === 'number') return AMENITY_ID_TO_NAME[a]; // id 값
                if (a && typeof a === 'object') {
                  if ('amenityType' in a) return a.amenityType;      
                  if ('amenityId' in a) return AMENITY_ID_TO_NAME[a.amenityId];
                }
                return null;
              })
              .filter(Boolean);

            const previewData = {
              ...guesthouse,
              hashtags: previewHashtags,
              amenities: previewAmenities, // 이름 배열로 전달
            };

            navigation.navigate('MyGuesthouseDetail', {
              isPreview: true,
              previewData,
            });
          }}
        >
          <Text style={[FONTS.fs_14_medium, styles.previewText]}>미리보기</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.submitButton,
          ]}
          onPress={handleSubmit}
        >
          <Text 
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
            ]}
          >
            수정완료
          </Text>
          <CheckWhite width={24} height={24}/>
        </TouchableOpacity>
      </View>

      {/* 게스트하우스 정보 모달 */}
      <GuesthouseInfoModal
        visible={infoModalVisible}
        shouldResetOnClose={infoModalReset}
        onClose={() => setInfoModalVisible(false)}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        defaultName={guesthouse?.guesthouseName || ''}
        defaultAddress={guesthouse?.guesthouseAddress || ''}
        defaultDetailAddress={guesthouse?.guesthouseDetailAddress || ''}
        defaultPhone={guesthouse?.guesthousePhone || ''}
        defaultCheckIn={guesthouse?.checkIn || '15:00:00'}
        defaultCheckOut={guesthouse?.checkOut || '11:00:00'}
        defaultHashtags={
          (guesthouse?.hashtags || [])
            .map((name) => guesthouseTags.find(t => t.hashtag === name))
            .filter(Boolean)
        }
        onSelect={handleInfoSelect}
      />

      {/* 게스트하우스 소개요약 모달 */}
      <GuesthouseIntroSummaryModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        defaultImages={guesthouse?.guesthouseImages || []}
        defaultShortIntro={guesthouse?.guesthouseShortIntro || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleIntroSelect}
      />
      
      {/* 객실 모달 */}
      <GuesthouseRoomModal
        visible={roomModalVisible}
        shouldResetOnClose={roomModalReset}
        onClose={() => setRoomModalVisible(false)}
        defaultRooms={guesthouse?.roomInfos || []}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleRoomSelect}
      />

      {/* 상세정보 모달 */}
      <GuesthouseDetailInfoModal
        visible={detailInfoModalVisible}
        shouldResetOnClose={detailInfoModalReset}
        onClose={() => setDetailInfoModalVisible(false)}
        defaultLongDesc={guesthouse?.guesthouseLongDesc || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleDetailInfoSelect}
      />

      {/* 이용규칙 모달 */}
      <GuesthouseRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        defaultRules={guesthouse?.rules || ''}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleRulesSelect}
      />

      {/* 편의시설 및 서비스 모달 */}
      <GuesthouseAmenitiesModal
        visible={amenitiesModalVisible}
        shouldResetOnClose={amenitiesModalReset}
        onClose={() => setAmenitiesModalVisible(false)}
        defaultSelected={selectedAmenities}
        guesthouseId={route.params?.guesthouseId || route.params?.initialGuesthouse?.id || guesthouse?.id}
        onSelect={handleAmenitiesSelect}
      />
    </View>
  );
};

export default MyGuesthouseEdit;