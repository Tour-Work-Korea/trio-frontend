import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.8);

const GuesthousePostRegisterModal = ({ visible, onClose, onSelect }) => {
  // 입점신청서 리스트 상태
  const [applicationList, setApplicationList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // 모달 열릴 때 데이터 불러오기
  React.useEffect(() => {
    if (visible) {
      fetchApplications();
    }
  }, [visible]);

  // 입점신청서 조회
  const fetchApplications = async () => {
    try {
      const res = await hostGuesthouseApi.getHostApplications();

      // 승인 완료되고 등록 안된 입점 신청서만 출력
      const filtered = (res.data || [])
        .filter(
          (app) => app.status === '승인 완료' && app.registered === false
        )
        .map((app) => ({
          id: app.id,
          businessName: app.businessName,
          address: app.address,
          imgUrl: app.imgUrl,
        }));

      setApplicationList(filtered);
    } catch (error) {
      console.error('입점신청서 목록 불러오기 실패:', error);
      setApplicationList([]);
    }
  };

  // 입점신청서 선택
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  // 단순 닫기일 때만 초기화
  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  // 등록 버튼 눌렀을 때
  const handleConfirm = () => {
    const selectedItem = applicationList.find((item) => item.id === selectedId);
    if (selectedItem) {
      onSelect(selectedItem); // { id, businessName, address }
      onClose();
    }
  };

  // 입점 신청서 리스트
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleSelect(item.id)}
    >
      {selectedId === item.id ? (
        <EnabledRadioButton width={28} height={28} />
      ) : (
        <DisabledRadioButton width={28} height={28} />
      )}
      <Image
        source={{ uri: item.imgUrl }}
        style={styles.itemImage}
      />
      <View style={styles.itemTextContainer}>
        <Text style={[FONTS.fs_16_semibold, styles.itemName]}>{item.businessName}</Text>
        <Text style={[FONTS.fs_12_medium, styles.itemAddress]}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.modalContainer}>

          {/* 설명 문구 */}
          <Text style={[FONTS.fs_14_medium, styles.modalTitle]}>
            게시글을 등록할 게스트하우스를 선택해주세요
          </Text>

          {/* 리스트 */}
          <FlatList
            data={applicationList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />

          {/* 등록하기 버튼 */}
          <ButtonScarlet
            title={'등록하기'}
            onPress={handleConfirm}
            disabled={!selectedId}
            style={{ marginBottom: 16 }}
          />
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default GuesthousePostRegisterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 설명 문구
  modalTitle: {
    marginBottom: 20,
    alignSelf: 'center',
    color: COLORS.grayscale_400,
  },

  // 리스트
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginLeft: 12,
  },
  itemTextContainer: {
    marginLeft: 12,
    alignItems: 'flex-start',
    height: '100%',
  },
  itemName: {
    marginBottom: 4,
  },
  itemAddress: {
    color: COLORS.grayscale_500,
  },
  
});