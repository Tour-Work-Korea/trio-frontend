import React, { useState } from 'react';
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

import Header from '@components/Header';
import styles from './MyGuesthouseAddEdit.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

import ImageAddIcon from '@assets/images/Gray_ImageAdd.svg';
import RadioBtnChecked from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import RadioBtnUnchecked from '@assets/images/Gray_Radio_Btn_Unchecked.svg';

import {
  publicFacilities,
  roomFacilities,
  services,
  tags,
} from '@data/guesthouseOptions';

const MyGuesthouseAddEdit = () => {
  const navigation = useNavigation();
  const [images, setImages] = useState([]);
  const [selectedPublic, setSelectedPublic] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [checkInTime, setCheckInTime] = useState('오전 01:00');
  const [checkOutTime, setCheckOutTime] = useState('오후 01:00'); 
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

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
          <TextInput style={[FONTS.fs_body, styles.input]} placeholder="게스트하우스 이름을 작성해 주세요." />
        </View>
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>위치</Text>
          <View style={styles.adressContainer}>
            <Text style={[FONTS.fs_body, styles.sectionTitle]}>제주시 조천읍 함덕 16길 1-4 단독주택</Text>
            <ButtonScarlet title="주소 찾기" marginHorizontal="0"/>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>전화번호</Text>
          <TextInput style={[FONTS.fs_body, styles.input]} placeholder="게스트하우스에 연락할 수 있는 전화번호를 입력해 주세요." />
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
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title="게스트 하우스 등록"
          marginHorizontal="0"
          onPress={() => navigation.goBack()}
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
