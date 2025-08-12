import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import styles from './RecruitmentForm';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import ButtonScarlet from '@components/ButtonScarlet';
import XBtn from '@assets/images/x_gray.svg';
import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';
import EmployLogo from '@assets/images/wa_blue_apply.svg';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ResultModal from '@components/modals/ResultModal';
import {useNavigation} from '@react-navigation/native';

const GuesthouseModal = ({handleInputChange, formData, visible, onClose}) => {
  const [guesthouses, setGuesthouses] = useState([]);
  const [selectedId, setSelectedId] = useState(formData?.guesthouseId ?? 0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMyGuestHouse();
  }, []);

  //나의 게스트하우스 리스트 조회
  const fetchMyGuestHouse = async () => {
    try {
      const response = await hostGuesthouseApi.getMyGuesthouses();
      setGuesthouses(response?.data ?? []);
    } catch (error) {
      Alert.alert('나의 게스트하우스 조회에 실패했습니다.');
    }
  };

  const renderGuesthouse = ({item}) => {
    const checked = selectedId === item.id;
    return (
      <View style={[ghStyle.ghRow]}>
        <TouchableOpacity onPress={() => setSelectedId(item.id)}>
          {checked ? (
            <EnabledRadioButton width={28} />
          ) : (
            <DisabledRadioButton width={28} />
          )}
        </TouchableOpacity>

        <View style={ghStyle.ghThumbWrap}>
          <Image
            source={{
              uri: 'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1754983680537_129464.jpg',
            }}
            width={80}
            height={80}
            style={ghStyle.ghThumb}
            resizeMode="cover"
          />
        </View>
        <View style={ghStyle.ghContent}>
          <Text
            style={{...FONTS.fs_16_semibold, color: COLORS.grayscale_900}}
            numberOfLines={1}>
            {item.guesthouseName}
          </Text>
          <Text style={{...FONTS.fs_12_medium, color: COLORS.grayscale_500}}>
            주소
          </Text>
        </View>
      </View>
    );
  };
  if (guesthouses.length === 0) {
    return (
      <ResultModal
        visible={visible}
        onClose={onClose}
        title={'게스트하우스'}
        subTitle={'입점된 게스트하우스가 없어요'}
        message={'입점 신청하러 가볼까요?'}
        buttonText={'입점 신청하기'}
        onPress={() => navigation.navigate('StoreRegister')}
        Icon={EmployLogo}
      />
    );
  }
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>게스트하우스</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              color: COLORS.grayscale_400,
              ...FONTS.fs_14_medium,
              textAlign: 'center',
            }}>
            알바 공고에 등록할 게스트하우스를 선택해주세요
          </Text>
          <FlatList
            data={guesthouses}
            keyExtractor={item => item.id}
            renderItem={renderGuesthouse}
          />

          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  handleInputChange('guesthouseId', selectedId);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ghStyle = StyleSheet.create({
  ghRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_0,
    gap: 12,
  },

  ghThumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  ghThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  ghContent: {
    height: '100%',
    paddingTop: 4,
  },
});

export default GuesthouseModal;
