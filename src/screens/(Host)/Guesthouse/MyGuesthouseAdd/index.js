import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';

import styles from './MyGuesthouseAdd.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import GuesthousePostRegisterModal from '@components/modals/HostMy/Guesthouse/GuesthousePostRegisterModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';

const MyGuesthouseAdd = () => {
  // 게스트하우스 게시물 등록 모달 열림 상태
  const [postModalVisible, setPostModalVisible] = useState(false);

  // 선택된 입점 신청서 정보
  const [selectedApplication, setSelectedApplication] = useState(null);

  const handlePostRegisterSelect = (application) => {
    setSelectedApplication(application); // { id, businessName, address }
    setPostModalVisible(false);
  };

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
  });

  const [newRoom, setNewRoom] = useState({
    roomName: '',
    roomType: '',
    roomCapacity: '',
    roomMaxCapacity: '',
    roomPrice: '',
    roomDesc: '',
    roomImages: [],
    roomExtraFees: [],
  });

  const [extraFeeInput, setExtraFeeInput] = useState({
    startDate: '',
    endDate: '',
    addPrice: '',
  });

  const handleSubmit = async () => {
    if (guesthouse.guesthouseImages.length === 0) {
      Alert.alert('게스트하우스 이미지를 1개 이상 등록해주세요.');
      return;
    }
    if (guesthouse.roomInfos.length === 0) {
      Alert.alert('객실 정보를 1개 이상 등록해주세요.');
      return;
    }

    const hasEachRoomThumbnail = guesthouse.roomInfos.every(room =>
      room.roomImages.some(img => img.isThumbnail === true)
    );
    if (!hasEachRoomThumbnail) {
      Alert.alert('각 방에는 반드시 썸네일 이미지 1개가 포함되어야 합니다.');
      return;
    }

    try {
      const payload = {
        ...guesthouse,
        applicationId: applicationId,
        amenities: selectedAmenities.map(id => ({ amenityId: id, count: 1 })),
        hashtagIds: selectedHashtags.map(tag => tag.id),
      };
      const res = await hostGuesthouseApi.registerGuesthouse(payload);
      console.log('등록 성공', res.data);
      Alert.alert('게스트하우스 등록 완료');
      navigation.goBack();
    } catch (error) {
      console.error('등록 실패:', error.response?.data || error.message);
      Alert.alert('등록 실패');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 등록" />

      <View style={styles.bodyContainer}>
        {/* 임점신청서 조회 */}
        <TouchableOpacity style={styles.section} onPress={() => setPostModalVisible(true)}>
          <Text style={[FONTS.fs_16_semibold, styles.title, { color: COLORS.primary_orange }]}>게스트하우스 게시물 등록</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        {/* 게스트하우스 정보 */}
        <TouchableOpacity 
          style={styles.section}
          onPress={() => console.log('게스트하우스 정보 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>게스트하우스 정보</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => console.log('게스트하우스 소개요약 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>게스트하우스 소개요약</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => console.log('객실 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>객실</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => console.log('상세정보 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>상세정보</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => console.log('이용규칙 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>이용규칙</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.section}
          onPress={() => console.log('편의시설 및 서비스 클릭')}
          disabled={!selectedApplication}
        >
          <Text style={[FONTS.fs_14_medium, !selectedApplication ? styles.disabled : styles.title]}>편의시설 및 서비스</Text>
          <ChevronRight width={24} height={24}/>
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          모든 항목을 입력하셔야 등록이 완료됩니다.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={[FONTS.fs_14_medium, styles.submitText]}>등록하기</Text>
          <CheckBlack width={24} height={24}/>
        </TouchableOpacity>
      </View>

      {/* 게스트하우스 게시물 등록 모달 */}
      <GuesthousePostRegisterModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        onSelect={handlePostRegisterSelect}
      />
      
    </View>
  );
};

export default MyGuesthouseAdd;