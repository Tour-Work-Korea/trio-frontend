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

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckWhite from '@assets/images/check_white.svg';

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
    if (initial) {
      setGuesthouse(prev => ({ ...prev, ...initial }));
      setSelectedAmenities((initial.amenities || []).map(a => a.amenityId));
    }
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
        <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>미리보기</Text>
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
        defaultName={guesthouse?.guesthouseName || ''}
        defaultAddress={guesthouse?.guesthouseAddress || ''}
        defaultDetailAddress={guesthouse?.guesthouseDetailAddress || ''}
        defaultPhone={guesthouse?.guesthousePhone || ''}
        defaultCheckIn={guesthouse?.checkIn || '15:00:00'}
        defaultCheckOut={guesthouse?.checkOut || '11:00:00'}
        defaultHashtags={guesthouse?.hashtags || []}
        onSelect={handleInfoSelect}
      />

      {/* 게스트하우스 소개요약 모달 */}
      <GuesthouseIntroSummaryModal
        visible={introModalVisible}
        shouldResetOnClose={introModalReset}
        onClose={() => setIntroModalVisible(false)}
        defaultImages={guesthouse?.guesthouseImages || []}
        defaultShortIntro={guesthouse?.guesthouseShortIntro || ''}
        onSelect={handleIntroSelect}
      />
      
      {/* 객실 모달 */}
      <GuesthouseRoomModal
        visible={roomModalVisible}
        shouldResetOnClose={roomModalReset}
        onClose={() => setRoomModalVisible(false)}
        defaultRooms={guesthouse?.roomInfos || []}
        onSelect={handleRoomSelect}
      />

      {/* 상세정보 모달 */}
      <GuesthouseDetailInfoModal
        visible={detailInfoModalVisible}
        shouldResetOnClose={detailInfoModalReset}
        onClose={() => setDetailInfoModalVisible(false)}
        defaultLongDesc={guesthouse?.guesthouseLongDesc || ''}
        onSelect={handleDetailInfoSelect}
      />

      {/* 이용규칙 모달 */}
      <GuesthouseRulesModal
        visible={rulesModalVisible}
        shouldResetOnClose={rulesModalReset}
        onClose={() => setRulesModalVisible(false)}
        defaultRules={guesthouse?.rules || ''}
        onSelect={handleRulesSelect}
      />

      {/* 편의시설 및 서비스 모달 */}
      <GuesthouseAmenitiesModal
        visible={amenitiesModalVisible}
        shouldResetOnClose={amenitiesModalReset}
        onClose={() => setAmenitiesModalVisible(false)}
        defaultSelected={selectedAmenities}
        onSelect={handleAmenitiesSelect}
      />
    </View>
  );
};

export default MyGuesthouseEdit;