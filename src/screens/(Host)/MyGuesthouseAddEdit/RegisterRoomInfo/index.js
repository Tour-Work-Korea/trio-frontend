import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './RegisterRoomInfo.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import { roomTypes, partyOptions, genderOptions } from '@data/guesthouseOptions';

import ImageAddIcon from '@assets/images/Gray_ImageAdd.svg';
import RadioBtnChecked from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import RadioBtnUnchecked from '@assets/images/Gray_Radio_Btn_Unchecked.svg';

const RegisterRoomInfo = () => {
  const navigation = useNavigation();
  const [roomName, setRoomName] = useState('');
  const [priceWeekday, setPriceWeekday] = useState('');
  const [priceWeekend, setPriceWeekend] = useState('');
  const [priceCommon, setPriceCommon] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomImages, setRoomImages] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [customRoomType, setCustomRoomType] = useState('');
  const [selectedPartyOption, setSelectedPartyOption] = useState('');
  const [selectedGenderOption, setSelectedGenderOption] = useState('');

  const handleImageSelect = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (response) => {
      if (response.assets) {
        setRoomImages([...roomImages, ...response.assets]);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="게스트하우스 등록/수정" />
      <View style={styles.contentWrapper}>
        <Text style={[FONTS.fs_h1_bold, styles.title]}>객실 유형</Text>
        <View style={styles.devide}/>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>객실명</Text>
          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            style={styles.input}
            placeholder="객실 명을 입력해주세요"
          />
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>객실에 해당되는 타입을 체크해주세요.</Text>
          <View style={styles.optionGroup}>
            {roomTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedRoomType(type)}
                style={styles.optionItem}
              >
                <Text style={FONTS.fs_body}>{type}</Text>
                {selectedRoomType === type ? (
                  <RadioBtnChecked width={18} height={18} />
                ) : (
                  <RadioBtnUnchecked width={20} height={20} />
                )}
              </TouchableOpacity>
            ))}

            {/* 기타 */}
            <View style={[styles.optionItem, { flex: 1 , paddingHorizontal: 5 }]}>
              <TouchableOpacity
                onPress={() => setSelectedRoomType('기타')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={[FONTS.fs_body, { marginRight: 16 }]}>기타</Text>
                {selectedRoomType === '기타' ? (
                  <RadioBtnChecked width={18} height={18} />
                ) : (
                  <RadioBtnUnchecked width={20} height={20} />
                )}
              </TouchableOpacity>

              {selectedRoomType === '기타' && (
                <TextInput
                  value={customRoomType}
                  onChangeText={setCustomRoomType}
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
                  placeholder="객실 명을 입력해 주세요"
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>파티 참여</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>해당되는 사항을 체크해주세요.</Text>
          <View style={styles.optionGroup}>
            {partyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedPartyOption(option)}
                style={styles.optionItem}
              >
                <Text style={FONTS.fs_body}>{option}</Text>
                {selectedPartyOption === option ? (
                  <RadioBtnChecked width={18} height={18} />
                ) : (
                  <RadioBtnUnchecked width={20} height={20} />
                )}
                
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>객실 타입</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>해당되는 사항을 체크해주세요.</Text>
          <View style={styles.optionGroup}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedGenderOption(option)}
                style={styles.optionItem}
              >
                <Text style={FONTS.fs_body}>{option}</Text>
                {selectedGenderOption === option ? (
                  <RadioBtnChecked width={18} height={18} />
                ) : (
                  <RadioBtnUnchecked width={20} height={20} />
                )}
                
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>객실 이미지</Text>
          <Text style={[FONTS.fs_body, styles.sectionSubTitle]}>객실사진을 추가해주세요.</Text>
          <ScrollView horizontal style={styles.imageScroll}>
            <TouchableOpacity onPress={handleImageSelect} style={styles.imageAddBox}>
              <ImageAddIcon width={36} height={36} />
            </TouchableOpacity>
            {roomImages.map((img, idx) => (
              <Image key={idx} source={{ uri: img.uri }} style={styles.imageThumb} />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>객실 가격</Text>
          <View style={styles.priceInputContainer}>
            <Text style={[FONTS.fs_h2, styles.title]}>평일</Text>
            <TextInput
              value={priceWeekday}
              onChangeText={setPriceWeekday}
              style={styles.input}
              placeholder="가격을 입력해주세요. (월~목)"
            />
          </View>
          <View style={styles.priceInputContainer}>
            <Text style={[FONTS.fs_h2, styles.title]}>주말</Text>
            <TextInput
              value={priceWeekend}
              onChangeText={setPriceWeekend}
              style={styles.input}
              placeholder="가격을 입력해주세요. (금~일)"
            />
          </View>
          <View style={styles.priceInputContainer}>
            <Text style={[FONTS.fs_h2, styles.title]}>공통</Text>
            <TextInput
              value={priceCommon}
              onChangeText={setPriceCommon}
              style={styles.input}
              placeholder="가격을 입력해주세요."
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[FONTS.fs_h2_bold, styles.title]}>객실 소개</Text>
          <TextInput
            value={roomDescription}
            onChangeText={setRoomDescription}
            style={styles.input}
            placeholder="객실 소개를 작성해주세요."
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title="객실정보 등록"
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
    </ScrollView>
  );
};

export default RegisterRoomInfo;
