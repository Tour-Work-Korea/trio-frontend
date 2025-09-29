import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import styles from './RecruitmentForm.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

export default function DetailInfoSection({
  handleInputChange,
  formData,
  visible,
  onClose,
}) {
  const [recruitDetail, setRecruitDetail] = useState(formData.recruitDetail);

  useEffect(() => {
    setRecruitDetail(formData.recruitDetail ?? '');
  }, [visible, formData.recruitDetail]);
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>상세 정보</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={{gap: 4}}>
            <Text
              style={{
                color: COLORS.grayscale_900,
                ...FONTS.fs_16_medium,
              }}>
              알바공고 상세정보를 자유롭게 작성해주세요
            </Text>
            <Text style={detailStyle.lengthTextAll}>
              <Text style={detailStyle.lengthText}>
                {recruitDetail?.length?.toLocaleString()}
              </Text>
              /5,000
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="🏡 막내네 게스트하우스에서 스탭을 모집합니다!
안녕하세요 :)막내네 게스트하우스는 여행자들이 편히 쉬고, 사람들과 자연스럽게 어울릴 수 있는 공간을 만들고자 노력하는 숙소입니다."
              placeholderTextColor={COLORS.grayscale_400}
              multiline={true}
              maxLength={5000}
              value={recruitDetail}
              onChangeText={setRecruitDetail}
            />

            <TouchableOpacity onPress={() => setRecruitDetail('')}>
              <Text style={detailStyle.rewriteText}>다시쓰기</Text>
            </TouchableOpacity>
          </View>

          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  handleInputChange('recruitDetail', recruitDetail);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const detailStyle = StyleSheet.create({
  lengthTextAll: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  lengthText: {color: COLORS.primary_orange},
  rewriteText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
});
