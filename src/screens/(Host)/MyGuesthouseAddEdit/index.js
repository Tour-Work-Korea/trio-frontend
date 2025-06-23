// 콘솔에만 출력
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import TimePickerModal from '@components/modals/TimePickerModal';
import { useNavigation } from '@react-navigation/native';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import Header from '@components/Header';
import styles from './MyGuesthouseAddEdit.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import AddressSearchModal from '@components/AddressSearchModal';

import ImageAddIcon from '@assets/images/Gray_ImageAdd.svg';
import RadioBtnChecked from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import RadioBtnUnchecked from '@assets/images/Gray_Radio_Btn_Unchecked.svg';

import {
  publicFacilities,
  roomFacilities,
  services,
  tags,
} from '@data/guesthouseOptions';

const MyGuesthouseAddEdit = ({ route }) => {
  const { guesthouseId, guesthouseDetail, applicationId } = route.params || {};
  const navigation = useNavigation();
  const [name, setName] = useState(guesthouseDetail?.guesthouseName || '');
  const [address, setAddress] = useState(guesthouseDetail?.guesthouseAddress || '');
  const [phone, setPhone] = useState(guesthouseDetail?.guesthousePhone || '');
  const [shortIntro, setShortIntro] = useState(guesthouseDetail?.guesthouseShortIntro || '');
  const [longDesc, setLongDesc] = useState(guesthouseDetail?.guesthouseLongDesc || '');
  const [images, setImages] = useState([]);
  const [selectedPublic, setSelectedPublic] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTags, setSelectedTags] = useState(guesthouseDetail?.hashtagIds || []);

  const [checkInTime, setCheckInTime] = useState('오전 01:00');
  const [checkOutTime, setCheckOutTime] = useState('오후 01:00'); 
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const [isAddressModalVisible, setAddressModalVisible] = useState(false);

  // 게스트하우스 등록&수정
  // 등록 안된 applicationId 받아오는 api 추가 예정
  const handleSubmit = async () => {
    // 임시 데이터
    const payloadUpdate = {
      guesthouseName: "트리오 게하1",
      guesthouseAddress: address,
      guesthousePhone: phone,   // phone만 입력값으로 덮어씀
      guesthouseShortIntro: "따뜻한 분위기의 게스트하우스입니다.",
      guesthouseLongDesc: "트리오 게스트하우스는 도심 속의 힐링 공간으로, 깔끔한 시설과 편안한 휴식을 제공합니다.",
      checkIn: "15:00:00",
      checkOut: "11:00:00",
      guesthouseImages: [
        {
          id: 26,
          guesthouseImageUrl: "http://example.com/guesthouse1.jpg",
          isThumbnail: true
        },
        {
          id: 27,
          guesthouseImageUrl: "http://example.com/guesthouse2.jpg",
          isThumbnail: false
        }
      ],
      amenities: [
        {
          amenityId: 1,
          count: 1
        },
        {
          amenityId: 3,
          count: 2
        }
      ],
      roomInfos: [
        {
          id: 28,
          roomName: "여성 도미토리",
          roomType: "FEMALE_ONLY",
          roomCapacity: 4,
          roomMaxCapacity: 6,
          roomDesc: "편안한 2층 침대가 있는 여성 전용 도미토리입니다.",
          roomPrice: 30000,
          roomExtraFees: [
            {
              id: 29,
              startDate: "2025-07-01",
              endDate: "2025-07-10",
              addPrice: 20000
            },
            {
              id: 30,
              startDate: "2025-08-01",
              endDate: "2025-08-15",
              addPrice: 50000
            }
          ],
          roomImages: [
            {
              id: 29,
              roomImageUrl: "http://example.com/room1-1.jpg",
              isThumbnail: true
            },
            {
              id: 30,
              roomImageUrl: "http://example.com/room1-2.jpg",
              isThumbnail: false
            }
          ]
        }
      ],
      "hashtagIds": [
        1, 4, 8
      ]
    };
    
    const payloadAdd = {
      guesthouseName: 'WA게하1',
      guesthouseAddress: address,
      guesthousePhone: '010-2223-4566',
      guesthouseShortIntro: '편안한 게하 게하',
      guesthouseLongDesc: '게스트하우스는 자연 속의 힐링 공간으로, 깔끔한 시설과 편안한 휴식을 제공합니다.',
      applicationId: applicationId,
      checkIn: '15:00:00',
      checkOut: '11:00:00',
      guesthouseImages: [
        {
          guesthouseImageUrl: 'http://example.com/guesthouse1.jpg',
          isThumbnail: true
        },
        {
          guesthouseImageUrl: 'http://example.com/guesthouse2.jpg',
          isThumbnail: false
        }
      ],
      roomInfos: [
        {
          roomName: '여성 도미토리',
          roomType: 'FEMALE_ONLY',
          roomCapacity: 4,
          roomMaxCapacity: 6,
          roomDesc: '편안한 2층 침대가 있는 여성 전용 도미토리입니다.',
          roomPrice: 30000,
          roomExtraFees: [
            {
              startDate: '2025-07-01',
              endDate: '2025-07-10',
              addPrice: 20000
            },
            {
              startDate: '2025-08-01',
              endDate: '2025-08-15',
              addPrice: 50000
            }
          ],
          roomImages: [
            {
              roomImageUrl: 'http://example.com/room1-1.jpg',
              isThumbnail: true
            },
            {
              roomImageUrl: 'http://example.com/room1-2.jpg',
              isThumbnail: false
            }
          ]
        },
        {
          roomName: '남성 도미토리',
          roomType: 'MALE_ONLY',
          roomCapacity: 4,
          roomMaxCapacity: 6,
          roomDesc: '편안한 2층 침대가 있는 남성 전용 도미토리입니다.',
          roomPrice: 30000,
          roomExtraFees: [
            {
              startDate: '2025-07-01',
              endDate: '2025-07-10',
              addPrice: 20000
            },
            {
              startDate: '2025-08-01',
              endDate: '2025-08-15',
              addPrice: 50000
            }
          ],
          roomImages: [
            {
              roomImageUrl: 'http://example.com/room2-1.jpg',
              isThumbnail: true
            },
            {
              roomImageUrl: 'http://example.com/room2-2.jpg',
              isThumbnail: false
            }
          ]
        },
      ],
      amenities: [
        {
          amenityId: 1,
          count: 1
        },
        {
          amenityId: 3,
          count: 2
        }
      ],
      hashtagIds: [
        1, 4, 8
      ]
    };   

    try {
    let response;
    if (guesthouseId) { // 수정일 때
      response = await hostGuesthouseApi.updateGuesthouse(guesthouseId, payloadUpdate);
      console.log('수정 성공:', response.data);
    } else { // 등록일 때
      response = await hostGuesthouseApi.registerGuesthouse(payloadAdd);
      console.log('등록 성공:', response.data);
    }
    navigation.goBack();
    } catch (error) {
      console.error('요청 실패:', error.response?.data || error.message);
    }
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }, (response) => {
      if (response.assets) {
        setImages([...images, ...response.assets]);
      }
    });
  };

  const toggleSelect = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(f => f !== item));
    } else {
      setList([...list, item]);
    }
  };

  const renderCheckboxList = (items, selected, setSelected) => (
    <View style={styles.optionGroup}>
      {items.map((item) => (
        <TouchableOpacity key={item} style={styles.optionItem} onPress={() => toggleSelect(item, selected, setSelected)}>
          <Text style={[FONTS.fs_body, styles.optionText]}>{item}</Text>
          {selected.includes(item)
            ? <RadioBtnChecked width={18} height={18} />
            : <RadioBtnUnchecked width={20} height={20} />
          }
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Header title="게스트하우스 등록" />

      <View style={styles.contentContainer}>
        {/* 기본 정보 */}
        <Text style={[FONTS.fs_h1_bold, styles.sectionTitle]}>기본 정보</Text>
        <View style={styles.devide}/>
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>게스트하우스 명</Text>
          <TextInput
            style={[FONTS.fs_body, styles.input]}
            placeholder="게스트하우스 이름을 작성해 주세요."
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>위치</Text>
          <View style={styles.adressContainer}>
            <Text style={[FONTS.fs_body, styles.sectionTitle]}>{address}</Text>
            <ButtonScarlet
              title="주소 찾기"
              marginHorizontal="0"
              onPress={() => setAddressModalVisible(true)}
            />
          </View>
        </View>

        {/* 카카오 우편번호 api */}
        <AddressSearchModal
          visible={isAddressModalVisible}
          onClose={() => setAddressModalVisible(false)}
          onSelected={(data) => {
            console.log("최종 선택된 주소:", data);
            setAddress(data.address);
          }}
        />

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>전화번호</Text>
          <TextInput
            style={[FONTS.fs_body, styles.input]}
            placeholder="게스트하우스에 연락할 수 있는 전화번호를 입력해 주세요."
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>게스트하우스 객실정보 및 사진</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>게스트하우스 및 객실사진을 추가해주세요.</Text>
          <ScrollView horizontal style={styles.imageScroll}>
            <TouchableOpacity onPress={selectImage} style={styles.imageAddBox}>
              <ImageAddIcon width={36} height={36} />
            </TouchableOpacity>
            {images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.uri }}
                style={styles.imageThumb}
              />
            ))}
          </ScrollView>
          <View style={styles.roomDetailBtnContainer}>
            <ButtonScarlet title="게스트하우스 객실정보 설정하기" marginHorizontal="0" to="RegisterRoomInfo"/>
          </View>
        </View>

        {/* 공용시설 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>숙소 공용시설</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>숙소에 포함되는 시설을 체크해주세요.</Text>
          {renderCheckboxList(publicFacilities, selectedPublic, setSelectedPublic)}
        </View>

        {/* 객실 내 시설 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>객실 내 시설</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>객실에 시설을 체크해주세요.</Text>
          {renderCheckboxList(roomFacilities, selectedRoom, setSelectedRoom)}
        </View>

        {/* 기타 서비스 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>기타시설 및 서비스</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>기타 세비스에 체크해주세요.</Text>
          {renderCheckboxList(services, selectedServices, setSelectedServices)}
        </View>

        {/* 시간 선택 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>입실 / 퇴실</Text>
          <View style={styles.timeBox}>
            <TouchableOpacity onPress={() => setShowCheckInPicker(true)}>
              <Text style={FONTS.fs_body_bold}>입실 시간: {checkInTime}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCheckOutPicker(true)}>
              <Text style={FONTS.fs_body_bold}>퇴실 시간: {checkOutTime}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 소개 요약 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>소개 요약</Text>
          <TextInput
            style={[FONTS.fs_body, styles.textArea]}
            multiline
            numberOfLines={6}
            placeholder="간략하게 들어갈 게스트하우스 소개를 200자 이내로 작성해 주세요."
            value={shortIntro}
            onChangeText={setShortIntro}
          />
        </View>

        {/* 태그 선택 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>태그</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>태그로 게스트하우스 특징을 나타내 보세요. (최대 3개 선택 가능)</Text>
          {renderCheckboxList(tags, selectedTags, setSelectedTags)}
        </View>

        {/* 상세 설명 */}
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>상세 소개글</Text>
          <TextInput
            style={[FONTS.fs_body, styles.textArea2]}
            multiline
            numberOfLines={6}
            placeholder="게스트하우스에 대해 소개하고 싶은 내용을 작성해 주세요."
            value={longDesc}
            onChangeText={setLongDesc}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title="게스트 하우스 등록"
          marginHorizontal="0"
          onPress={handleSubmit}
        />
        <View style={styles.whiteBtnContainer}>
          <View style={styles.halfButtonWrapper}>
            <ButtonWhite title="임시 저장" marginHorizontal="0" />
          </View>
          <View style={styles.halfButtonWrapper}>
            <ButtonWhite title="미리 보기" marginHorizontal="0" />
          </View>
        </View>
      </View>

      {/* 시간 모달 */}
      <TimePickerModal
        visible={showCheckInPicker}
        initialTime={checkInTime}
        onConfirm={(timeString) => {
          setCheckInTime(timeString);
          setShowCheckInPicker(false);
        }}
        onClose={() => setShowCheckInPicker(false)}
      />

      <TimePickerModal
        visible={showCheckOutPicker}
        initialTime={checkOutTime}
        onConfirm={(timeString) => {
          setCheckOutTime(timeString);
          setShowCheckOutPicker(false);
        }}
        onClose={() => setShowCheckOutPicker(false)}
      />

    </ScrollView>
  );
};

export default MyGuesthouseAddEdit;