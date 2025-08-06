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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import styles from './MyGuesthouseAdd.styles';
import Header from '@components/Header';
import { FONTS } from '@constants/fonts';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { uploadSingleImage } from '@utils/imageUploadHandler';
import { guesthouseTags } from '@data/guesthouseTags';
import { publicFacilities, roomFacilities, services } from '@data/guesthouseOptions';

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 10,
  marginBottom: 12,
};

const tagButtonStyle = (selected) => ({
  paddingVertical: 6,
  paddingHorizontal: 10,
  margin: 4,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: selected ? '#ff5a5f' : '#ccc',
  backgroundColor: selected ? '#ffebeb' : '#fff',
});

const tagTextStyle = (selected) => ({
  color: selected ? '#ff5a5f' : '#333',
});

const MyGuesthouseAdd = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};
  const [selectedAmenities, setSelectedAmenities] = useState([]); // amenity id 배열
  const [selectedHashtags, setSelectedHashtags] = useState([]); // { id, hashtag } 객체 배열

  // 테스트용 입점신청서 리스트 상태
  const [applicationList, setApplicationList] = useState([]);
  const [showAppList, setShowAppList] = useState(false);

   // 입점신청서 조회
  const handleRegisterPress = async () => {
    try {
      const res = await hostGuesthouseApi.getHostApplications();

      // 게하 등록 안된 입점신청서만 출력
      const unregisteredApplications = (res.data || []).filter(app => !app.registered);
      setApplicationList(unregisteredApplications);
      setShowAppList(true);
    } catch (error) {
      setApplicationList([]);
      setShowAppList(true);
      console.error('입점신청서 목록 불러오기 실패:', error);
    }
  };

  // 입점신청서 선택
  const handleAppSelect = (item) => {
    setShowAppList(false);
    navigation.navigate('MyGuesthouseAddEdit', { applicationId: item.id });
  };

  // 게스트 하우스 삭제
  const handleDelete = async (guesthouseId) => {
    try {
      await hostGuesthouseApi.deleteGuesthouse(guesthouseId);
      console.log('삭제 성공:', guesthouseId);

      // 삭제 후 목록 새로고침
      setGuesthouses(prev => prev.filter(item => item.id !== guesthouseId));
    } catch (error) {
      console.error('삭제 실패:', error.response?.data || error.message);
    }
  };

   // 임의로 입점신청서 리스트만 간단히 표시
  const renderApplicationListModal = () => (
    <Modal
      visible={showAppList}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAppList(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '85%',
          height: MODAL_HEIGHT,
          backgroundColor: 'white',
          borderRadius: 14,
          paddingTop: 36,
          paddingHorizontal: 18,
          paddingBottom: 18,
        }}>
          <TouchableOpacity onPress={() => setShowAppList(false)} style={{ position: 'absolute', top: 10, right: 16, zIndex: 1 }}>
            <Text style={{ fontSize: 22, color: '#999' }}>✕</Text>
          </TouchableOpacity>
          <Text style={[FONTS.fs_h2_bold, { marginBottom: 18, alignSelf: 'center' }]}>입점신청서 목록</Text>
          {applicationList.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={[FONTS.fs_body, { textAlign: 'center', marginVertical: 30 }]}>입점신청서가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={applicationList}
              keyExtractor={item => item.id.toString()}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAppSelect(item)}
                  style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' }}
                >
                  <Text style={FONTS.fs_body_bold}>사업장명: {item.businessName} (ID: {item.id})</Text>
                  <Text style={FONTS.fs_body}>대표자: {item.managerName}</Text>
                  <Text style={FONTS.fs_body}>상태: {item.status}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator
            />
          )}
        </View>
      </View>
    </Modal>
  );

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

  const [roomModalVisible, setRoomModalVisible] = useState(false);
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

  const handleAddImage = async () => {
    if (guesthouse.guesthouseImages.length >= 10) {
      Alert.alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) return;

    const isThumbnail = guesthouse.guesthouseImages.length === 0;
    setGuesthouse((prev) => ({
      ...prev,
      guesthouseImages: [
        ...prev.guesthouseImages,
        {
          guesthouseImageUrl: uploadedUrl,
          isThumbnail,
        },
      ],
    }));
  };

  const handleAddRoomImage = async () => {
    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) return;

    const isFirstImage = newRoom.roomImages.length === 0;
    const image = { roomImageUrl: uploadedUrl, isThumbnail: isFirstImage };
    setNewRoom((prev) => ({
      ...prev,
      roomImages: [...prev.roomImages, image],
    }));
  };

  const handleAddRoomExtraFee = () => {
    const { startDate, endDate, addPrice } = extraFeeInput;
    if (startDate && endDate && addPrice) {
      setNewRoom((prev) => ({
        ...prev,
        roomExtraFees: [...prev.roomExtraFees, {
          startDate,
          endDate,
          addPrice: parseInt(addPrice),
        }],
      }));
      setExtraFeeInput({ startDate: '', endDate: '', addPrice: '' });
    } else {
      Alert.alert('모든 추가요금 정보를 입력해주세요.');
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.roomName || !newRoom.roomType || newRoom.roomImages.length === 0) {
      Alert.alert('필수 정보(방 이름, 타입, 이미지)를 입력해주세요.');
      return;
    }

    const room = {
      ...newRoom,
      roomCapacity: parseInt(newRoom.roomCapacity),
      roomMaxCapacity: parseInt(newRoom.roomMaxCapacity),
      roomPrice: parseInt(newRoom.roomPrice),
    };

    setGuesthouse((prev) => ({
      ...prev,
      roomInfos: [...prev.roomInfos, room],
    }));
    setNewRoom({
      roomName: '',
      roomType: '',
      roomCapacity: '',
      roomMaxCapacity: '',
      roomPrice: '',
      roomDesc: '',
      roomImages: [],
      roomExtraFees: [],
    });
    setRoomModalVisible(false);
  };

  const handleDeleteRoom = (index) => {
    setGuesthouse((prev) => ({
      ...prev,
      roomInfos: prev.roomInfos.filter((_, idx) => idx !== index),
    }));
  };

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
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0} // 필요에 따라 조절
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>게스트하우스 이름</Text>
      <TextInput style={inputStyle} value={guesthouse.guesthouseName} onChangeText={(text) => setGuesthouse({ ...guesthouse, guesthouseName: text })} />
      <Text>주소</Text>
      <TextInput style={inputStyle} value={guesthouse.guesthouseAddress} onChangeText={(text) => setGuesthouse({ ...guesthouse, guesthouseAddress: text })} />
      <Text>전화번호</Text>
      <TextInput style={inputStyle} value={guesthouse.guesthousePhone} onChangeText={(text) => setGuesthouse({ ...guesthouse, guesthousePhone: text })} />
      <Text>한줄 소개</Text>
      <TextInput style={inputStyle} value={guesthouse.guesthouseShortIntro} onChangeText={(text) => setGuesthouse({ ...guesthouse, guesthouseShortIntro: text })} />
      <Text>상세 설명</Text>
      <TextInput style={inputStyle} multiline value={guesthouse.guesthouseLongDesc} onChangeText={(text) => setGuesthouse({ ...guesthouse, guesthouseLongDesc: text })} />
      <Text>체크인 시간</Text>
      <TextInput style={inputStyle} value={guesthouse.checkIn} onChangeText={(text) => setGuesthouse({ ...guesthouse, checkIn: text })} />
      <Text>체크아웃 시간</Text>
      <TextInput style={inputStyle} value={guesthouse.checkOut} onChangeText={(text) => setGuesthouse({ ...guesthouse, checkOut: text })} />

      <Button title="이미지 추가 (갤러리에서)" onPress={handleAddImage} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {guesthouse.guesthouseImages.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.guesthouseImageUrl }}
            style={{ width: 100, height: 100, marginRight: 8, marginBottom: 8, borderRadius: 8 }}
          />
        ))}
      </View>

      <Button title="방 추가" onPress={() => setRoomModalVisible(true)} />
      {guesthouse.roomInfos.map((room, idx) => (
        <View key={idx} style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}>
          <Text style={{ fontWeight: 'bold' }}>{room.roomName}</Text>
          <Text>{room.roomType}</Text>
          <Text>{room.roomDesc}</Text>
          <TouchableOpacity onPress={() => handleDeleteRoom(idx)}>
            <Text style={{ color: 'red', marginTop: 6 }}>삭제</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text>편의 시설 선택</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[...publicFacilities, ...roomFacilities, ...services].map((item) => {
          const selected = selectedAmenities.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={tagButtonStyle(selected)}
              onPress={() => {
                setSelectedAmenities((prev) =>
                  selected ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                );
              }}
            >
              <Text style={tagTextStyle(selected)}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text>태그 선택 (최대 3개)</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {guesthouseTags.map((tag) => {
          const selected = selectedHashtags.some((t) => t.id === tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={tagButtonStyle(selected)}
              onPress={() => {
                if (selected) {
                  setSelectedHashtags((prev) => prev.filter((t) => t.id !== tag.id));
                } else if (selectedHashtags.length < 3) {
                  setSelectedHashtags((prev) => [...prev, tag]);
                } else {
                  Alert.alert('태그는 최대 3개까지 선택할 수 있습니다.');
                }
              }}
            >
              <Text style={tagTextStyle(selected)}>{tag.hashtag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="등록하기" onPress={handleSubmit} />
      </View>

      <Modal visible={roomModalVisible} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ padding: 60 }}>
            <Text>방 이름</Text>
            <TextInput style={inputStyle} value={newRoom.roomName} onChangeText={(text) => setNewRoom({ ...newRoom, roomName: text })} />
            <Text>방 타입 (FEMALE_ONLY, MALE_ONLY, MIXED)</Text>
            <TextInput style={inputStyle} value={newRoom.roomType} onChangeText={(text) => setNewRoom({ ...newRoom, roomType: text })} />
            <Text>수용 인원</Text>
            <TextInput style={inputStyle} keyboardType="numeric" value={newRoom.roomCapacity} onChangeText={(text) => setNewRoom({ ...newRoom, roomCapacity: text })} />
            <Text>최대 인원</Text>
            <TextInput style={inputStyle} keyboardType="numeric" value={newRoom.roomMaxCapacity} onChangeText={(text) => setNewRoom({ ...newRoom, roomMaxCapacity: text })} />
            <Text>기본 가격</Text>
            <TextInput style={inputStyle} keyboardType="numeric" value={newRoom.roomPrice} onChangeText={(text) => setNewRoom({ ...newRoom, roomPrice: text })} />
            <Text>방 설명</Text>
            <TextInput style={inputStyle} value={newRoom.roomDesc} onChangeText={(text) => setNewRoom({ ...newRoom, roomDesc: text })} />

            <Button title="방 이미지 추가" onPress={handleAddRoomImage} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
              {newRoom.roomImages.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img.roomImageUrl }}
                  style={{ width: 80, height: 80, marginRight: 8, marginBottom: 8, borderRadius: 8 }}
                />
              ))}
            </View>

            <Text>추가요금 시작일 (YYYY-MM-DD)</Text>
            <TextInput style={inputStyle} value={extraFeeInput.startDate} onChangeText={(text) => setExtraFeeInput({ ...extraFeeInput, startDate: text })} />
            <Text>추가요금 종료일 (YYYY-MM-DD)</Text>
            <TextInput style={inputStyle} value={extraFeeInput.endDate} onChangeText={(text) => setExtraFeeInput({ ...extraFeeInput, endDate: text })} />
            <Text>추가요금 금액</Text>
            <TextInput style={inputStyle} keyboardType="numeric" value={extraFeeInput.addPrice} onChangeText={(text) => setExtraFeeInput({ ...extraFeeInput, addPrice: text })} />
            <Button title="추가요금 구간 추가" onPress={handleAddRoomExtraFee} />

            {newRoom.roomExtraFees.map((fee, idx) => (
              <Text key={idx} style={{ marginTop: 6 }}>{fee.startDate} ~ {fee.endDate}: +{fee.addPrice}원</Text>
            ))}

            <Button title="방 등록" onPress={handleAddRoom} />
            <View style={{ marginTop: 10 }}>
              <Button title="닫기" onPress={() => setRoomModalVisible(false)} />
            </View>
          </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
};

export default MyGuesthouseAdd;