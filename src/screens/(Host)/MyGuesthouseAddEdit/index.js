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
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { useNavigation, useRoute } from '@react-navigation/native';
import { uploadSingleImage } from '@utils/imageUploadHandler';

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 10,
  marginBottom: 12,
};

const MyGuesthouseAddEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { applicationId } = route.params || {};

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

      <View style={{ marginTop: 20 }}>
        <Button title="등록하기" onPress={handleSubmit} />
      </View>

      <Modal visible={roomModalVisible} animationType="slide">
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
      </Modal>
    </ScrollView>
  );
};

export default MyGuesthouseAddEdit;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   TextInput,
// } from 'react-native';
// import { launchImageLibrary } from 'react-native-image-picker';
// import TimePickerModal from '@components/modals/TimePickerModal';
// import { useNavigation } from '@react-navigation/native';
// import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

// import Header from '@components/Header';
// import styles from './MyGuesthouseAddEdit.styles';
// import { FONTS } from '@constants/fonts';
// import ButtonScarlet from '@components/ButtonScarlet';
// import ButtonWhite from '@components/ButtonWhite';
// import AddressSearchModal from '@components/modals/AddressSearchModal';

// import ImageAddIcon from '@assets/images/Gray_ImageAdd.svg';
// import RadioBtnChecked from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
// import RadioBtnUnchecked from '@assets/images/Gray_Radio_Btn_Unchecked.svg';

// import {
//   publicFacilities,
//   roomFacilities,
//   services,
//   tags,
// } from '@data/guesthouseOptions';

// const MyGuesthouseAddEdit = ({ route }) => {
//   const { guesthouseId, guesthouseDetail, applicationId } = route.params || {};
//   const navigation = useNavigation();
//   const [name, setName] = useState(guesthouseDetail?.guesthouseName || '');
//   const [address, setAddress] = useState(guesthouseDetail?.guesthouseAddress || '');
//   const [phone, setPhone] = useState(guesthouseDetail?.guesthousePhone || '');
//   const [shortIntro, setShortIntro] = useState(guesthouseDetail?.guesthouseShortIntro || '');
//   const [longDesc, setLongDesc] = useState(guesthouseDetail?.guesthouseLongDesc || '');
//   const [images, setImages] = useState([]);
//   const [selectedPublic, setSelectedPublic] = useState([]);
//   const [selectedRoom, setSelectedRoom] = useState([]);
//   const [selectedServices, setSelectedServices] = useState([]);
//   const [selectedTags, setSelectedTags] = useState(guesthouseDetail?.hashtagIds || []);

//   const [checkInTime, setCheckInTime] = useState('오전 01:00');
//   const [checkOutTime, setCheckOutTime] = useState('오후 01:00'); 
//   const [showCheckInPicker, setShowCheckInPicker] = useState(false);
//   const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

//   const [isAddressModalVisible, setAddressModalVisible] = useState(false);

//   // 게스트하우스 등록&수정
//   // 등록 안된 applicationId 받아오는 api 추가 예정
//   const handleSubmit = async () => {
//     // 임시 데이터
//     const payloadUpdate = {
//       guesthouseName: "트리오 게하1",
//       guesthouseAddress: address,
//       guesthousePhone: phone,   // phone만 입력값으로 덮어씀
//       guesthouseShortIntro: "따뜻한 분위기의 게스트하우스입니다.",
//       guesthouseLongDesc: "트리오 게스트하우스는 도심 속의 힐링 공간으로, 깔끔한 시설과 편안한 휴식을 제공합니다.",
//       checkIn: "15:00:00",
//       checkOut: "11:00:00",
//       guesthouseImages: [
//         {
//           id: 26,
//           guesthouseImageUrl: "http://example.com/guesthouse1.jpg",
//           isThumbnail: true
//         },
//         {
//           id: 27,
//           guesthouseImageUrl: "http://example.com/guesthouse2.jpg",
//           isThumbnail: false
//         }
//       ],
//       amenities: [
//         {
//           amenityId: 1,
//           count: 1
//         },
//         {
//           amenityId: 3,
//           count: 2
//         }
//       ],
//       roomInfos: [
//         {
//           id: 28,
//           roomName: "여성 도미토리",
//           roomType: "FEMALE_ONLY",
//           roomCapacity: 4,
//           roomMaxCapacity: 6,
//           roomDesc: "편안한 2층 침대가 있는 여성 전용 도미토리입니다.",
//           roomPrice: 30000,
//           roomExtraFees: [
//             {
//               id: 29,
//               startDate: "2025-07-01",
//               endDate: "2025-07-10",
//               addPrice: 20000
//             },
//             {
//               id: 30,
//               startDate: "2025-08-01",
//               endDate: "2025-08-15",
//               addPrice: 50000
//             }
//           ],
//           roomImages: [
//             {
//               id: 29,
//               roomImageUrl: "http://example.com/room1-1.jpg",
//               isThumbnail: true
//             },
//             {
//               id: 30,
//               roomImageUrl: "http://example.com/room1-2.jpg",
//               isThumbnail: false
//             }
//           ]
//         }
//       ],
//       "hashtagIds": [
//         1, 4, 8
//       ]
//     };
    
//     const payloadAdd = {
//       guesthouseName: 'WA게하1',
//       guesthouseAddress: address,
//       guesthousePhone: '010-2223-4566',
//       guesthouseShortIntro: '편안한 게하 게하',
//       guesthouseLongDesc: '게스트하우스는 자연 속의 힐링 공간으로, 깔끔한 시설과 편안한 휴식을 제공합니다.',
//       applicationId: applicationId,
//       checkIn: '15:00:00',
//       checkOut: '11:00:00',
//       guesthouseImages: [
//         {
//           guesthouseImageUrl: 'http://example.com/guesthouse1.jpg',
//           isThumbnail: true
//         },
//         {
//           guesthouseImageUrl: 'http://example.com/guesthouse2.jpg',
//           isThumbnail: false
//         }
//       ],
//       roomInfos: [
//         {
//           roomName: '여성 도미토리',
//           roomType: 'FEMALE_ONLY',
//           roomCapacity: 4,
//           roomMaxCapacity: 6,
//           roomDesc: '편안한 2층 침대가 있는 여성 전용 도미토리입니다.',
//           roomPrice: 30000,
//           roomExtraFees: [
//             {
//               startDate: '2025-07-01',
//               endDate: '2025-07-10',
//               addPrice: 20000
//             },
//             {
//               startDate: '2025-08-01',
//               endDate: '2025-08-15',
//               addPrice: 50000
//             }
//           ],
//           roomImages: [
//             {
//               roomImageUrl: 'http://example.com/room1-1.jpg',
//               isThumbnail: true
//             },
//             {
//               roomImageUrl: 'http://example.com/room1-2.jpg',
//               isThumbnail: false
//             }
//           ]
//         },
//         {
//           roomName: '남성 도미토리',
//           roomType: 'MALE_ONLY',
//           roomCapacity: 4,
//           roomMaxCapacity: 6,
//           roomDesc: '편안한 2층 침대가 있는 남성 전용 도미토리입니다.',
//           roomPrice: 30000,
//           roomExtraFees: [
//             {
//               startDate: '2025-07-01',
//               endDate: '2025-07-10',
//               addPrice: 20000
//             },
//             {
//               startDate: '2025-08-01',
//               endDate: '2025-08-15',
//               addPrice: 50000
//             }
//           ],
//           roomImages: [
//             {
//               roomImageUrl: 'http://example.com/room2-1.jpg',
//               isThumbnail: true
//             },
//             {
//               roomImageUrl: 'http://example.com/room2-2.jpg',
//               isThumbnail: false
//             }
//           ]
//         },
//       ],
//       amenities: [
//         {
//           amenityId: 1,
//           count: 1
//         },
//         {
//           amenityId: 3,
//           count: 2
//         }
//       ],
//       hashtagIds: [
//         1, 4, 8
//       ]
//     };   

//     try {
//     let response;
//     if (guesthouseId) { // 수정일 때
//       response = await hostGuesthouseApi.updateGuesthouse(guesthouseId, payloadUpdate);
//       console.log('수정 성공:', response.data);
//     } else { // 등록일 때
//       response = await hostGuesthouseApi.registerGuesthouse(payloadAdd);
//       console.log('등록 성공:', response.data);
//     }
//     navigation.goBack();
//     } catch (error) {
//       console.error('요청 실패:', error.response?.data || error.message);
//     }
//   };

//   const selectImage = () => {
//     launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, (response) => {
//       if (response.assets) {
//         setImages([...images, ...response.assets]);
//       }
//     });
//   };

//   const toggleSelect = (item, list, setList) => {
//     if (list.includes(item)) {
//       setList(list.filter(f => f !== item));
//     } else {
//       setList([...list, item]);
//     }
//   };

//   const renderCheckboxList = (items, selected, setSelected) => (
//     <View style={styles.optionGroup}>
//       {items.map((item) => (
//         <TouchableOpacity key={item} style={styles.optionItem} onPress={() => toggleSelect(item, selected, setSelected)}>
//           <Text style={[FONTS.fs_body, styles.optionText]}>{item}</Text>
//           {selected.includes(item)
//             ? <RadioBtnChecked width={18} height={18} />
//             : <RadioBtnUnchecked width={20} height={20} />
//           }
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   return (
//     <ScrollView style={styles.container}>
//       <Header title="게스트하우스 등록" />

//       <View style={styles.contentContainer}>
//         {/* 기본 정보 */}
//         <Text style={[FONTS.fs_h1_bold, styles.sectionTitle]}>기본 정보</Text>
//         <View style={styles.devide}/>
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>게스트하우스 명</Text>
//           <TextInput
//             style={[FONTS.fs_body, styles.input]}
//             placeholder="게스트하우스 이름을 작성해 주세요."
//             value={name}
//             onChangeText={setName}
//           />
//         </View>
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>위치</Text>
//           <View style={styles.adressContainer}>
//             <Text style={[FONTS.fs_body, styles.sectionTitle]}>{address}</Text>
//             <ButtonScarlet
//               title="주소 찾기"
//               marginHorizontal="0"
//               onPress={() => setAddressModalVisible(true)}
//             />
//           </View>
//         </View>

//         {/* 카카오 우편번호 api */}
//         <AddressSearchModal
//           visible={isAddressModalVisible}
//           onClose={() => setAddressModalVisible(false)}
//           onSelected={(data) => {
//             console.log("최종 선택된 주소:", data);
//             setAddress(data.address);
//           }}
//         />

//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>전화번호</Text>
//           <TextInput
//             style={[FONTS.fs_body, styles.input]}
//             placeholder="게스트하우스에 연락할 수 있는 전화번호를 입력해 주세요."
//             value={phone}
//             onChangeText={setPhone}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>게스트하우스 객실정보 및 사진</Text>
//           <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>게스트하우스 및 객실사진을 추가해주세요.</Text>
//           <ScrollView horizontal style={styles.imageScroll}>
//             <TouchableOpacity onPress={selectImage} style={styles.imageAddBox}>
//               <ImageAddIcon width={36} height={36} />
//             </TouchableOpacity>
//             {images.map((img, idx) => (
//               <Image
//                 key={idx}
//                 source={{ uri: img.uri }}
//                 style={styles.imageThumb}
//               />
//             ))}
//           </ScrollView>
//           <View style={styles.roomDetailBtnContainer}>
//             <ButtonScarlet title="게스트하우스 객실정보 설정하기" marginHorizontal="0" to="RegisterRoomInfo"/>
//           </View>
//         </View>

//         {/* 공용시설 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>숙소 공용시설</Text>
//           <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>숙소에 포함되는 시설을 체크해주세요.</Text>
//           {renderCheckboxList(publicFacilities, selectedPublic, setSelectedPublic)}
//         </View>

//         {/* 객실 내 시설 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>객실 내 시설</Text>
//           <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>객실에 시설을 체크해주세요.</Text>
//           {renderCheckboxList(roomFacilities, selectedRoom, setSelectedRoom)}
//         </View>

//         {/* 기타 서비스 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>기타시설 및 서비스</Text>
//           <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>기타 세비스에 체크해주세요.</Text>
//           {renderCheckboxList(services, selectedServices, setSelectedServices)}
//         </View>

//         {/* 시간 선택 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>입실 / 퇴실</Text>
//           <View style={styles.timeBox}>
//             <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
//               <Text style={FONTS.fs_body_bold}>입실 시간: {checkInTime}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
//               <Text style={FONTS.fs_body_bold}>퇴실 시간: {checkOutTime}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* 소개 요약 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>소개 요약</Text>
//           <TextInput
//             style={[FONTS.fs_body, styles.textArea]}
//             multiline
//             numberOfLines={6}
//             placeholder="간략하게 들어갈 게스트하우스 소개를 200자 이내로 작성해 주세요."
//             value={shortIntro}
//             onChangeText={setShortIntro}
//           />
//         </View>

//         {/* 태그 선택 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>태그</Text>
//           <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>태그로 게스트하우스 특징을 나타내 보세요. (최대 3개 선택 가능)</Text>
//           {renderCheckboxList(tags, selectedTags, setSelectedTags)}
//         </View>

//         {/* 상세 설명 */}
//         <View style={styles.inputContainer}>
//           <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>상세 소개글</Text>
//           <TextInput
//             style={[FONTS.fs_body, styles.textArea2]}
//             multiline
//             numberOfLines={6}
//             placeholder="게스트하우스에 대해 소개하고 싶은 내용을 작성해 주세요."
//             value={longDesc}
//             onChangeText={setLongDesc}
//           />
//         </View>
//       </View>

//       <View style={styles.buttonContainer}>
//         <ButtonScarlet
//           title="게스트 하우스 등록"
//           marginHorizontal="0"
//           onPress={handleSubmit}
//         />
//         <View style={styles.whiteBtnContainer}>
//           <View style={styles.halfButtonWrapper}>
//             <ButtonWhite title="임시 저장" marginHorizontal="0" />
//           </View>
//           <View style={styles.halfButtonWrapper}>
//             <ButtonWhite title="미리 보기" marginHorizontal="0" />
//           </View>
//         </View>
//       </View>

//       {/* 시간 모달 */}
//       <TimePickerModal
//         visible={showCheckInPicker}
//         initialTime={checkInTime}
//         onConfirm={(timeString) => {
//           setCheckInTime(timeString);
//           setShowCheckInPicker(false);
//         }}
//         onClose={() => setShowCheckInPicker(false)}
//       />

//       <TimePickerModal
//         visible={showCheckOutPicker}
//         initialTime={checkOutTime}
//         onConfirm={(timeString) => {
//           setCheckOutTime(timeString);
//           setShowCheckOutPicker(false);
//         }}
//         onClose={() => setShowCheckOutPicker(false)}
//       />

//     </ScrollView>
//   );
// };

// export default MyGuesthouseAddEdit;