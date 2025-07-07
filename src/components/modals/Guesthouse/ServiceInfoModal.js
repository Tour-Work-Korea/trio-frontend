import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

import Checkmark from '@assets/images/Checkmark.svg';
import ScarletCheckmark from '@assets/images/Scarlet_Checkmark.svg';

const sectionData = {
  숙소공용시설: ['라운지', '전자레인지', '주방/식당', '카페', '공용 욕실', '탈수기'],
  객실내시설: ['개별 샤워실', '무선 인터넷', '개인 콘센트', '욕실 용품', '에어컨', '냉장고', '드라이기', 'TV', '난방', '전기포트'],
  기타서비스: ['카드결제', '반려동물 동반'],
};

const ServiceInfoModal = ({ visible, onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item)
        ? prev.filter((el) => el !== item)
        : [...prev, item]
    );
  };

  const renderSection = (title, items) => (
    <View key={title}>
      <Text style={[FONTS.fs_h2_bold, styles.sectionTitle]}>{title}</Text>
      <View style={styles.tagWrapper}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity key={item} style={styles.tag} onPress={() => toggleItem(item)}>
              {isSelected ? <ScarletCheckmark width={20} height={20} /> : <Checkmark width={20} height={20} />}
              <Text style={[FONTS.fs_h2, styles.tagText]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
            <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                <Text style={[FONTS.fs_h2_bold, styles.title]}>편의시설 및 서비스</Text>

                {renderSection('숙소 공용시설', sectionData.숙소공용시설)}
                {renderSection('객실 내 시설', sectionData.객실내시설)}
                {renderSection('기타시설 및 서비스', sectionData.기타서비스)}
                </View>
            </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 20,
    height: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    borderColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  tagWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 8,
    alignContent: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '40%'
  },
  tagText: {
  },
});

export default ServiceInfoModal;
