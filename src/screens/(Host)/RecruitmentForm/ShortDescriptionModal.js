import React, {useState} from 'react';
import {View, Text, Modal, TouchableOpacity, TextInput} from 'react-native';
import styles from './RecruitmentForm';

import ButtonScarlet from '@components/ButtonScarlet';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const ShortDescriptionModal = ({
  handleInputChange,
  formData,
  visible,
  onClose,
}) => {
  const [shortDescription, setShortDescription] = useState(
    formData.recruitShortDescription,
  );
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>공고 요약</Text>
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
              간략하게 들어갈 공고 소개를 작성해주세요
            </Text>
            <Text
              style={{
                ...FONTS.fs_12_medium,
                color: COLORS.grayscale_400,
                textAlign: 'right',
              }}>
              <Text style={{color: COLORS.primary_orange}}>
                {shortDescription?.length?.toLocaleString()}
              </Text>
              /1,000
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="성실함과 책임감을 가지고 모든 일에 임하는 사람을 구해요."
              placeholderTextColor={COLORS.grayscale_400}
              multiline={true}
              maxLength={1000}
              value={shortDescription}
              onChangeText={setShortDescription}
            />
            <TouchableOpacity onPress={() => setShortDescription('')}>
              <Text
                style={{
                  textAlign: 'right',
                  color: COLORS.grayscale_500,
                  ...FONTS.fs_12_medium,
                }}>
                다시쓰기
              </Text>
            </TouchableOpacity>
          </View>

          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  handleInputChange(
                    'recruitShortDescription',
                    shortDescription,
                  );
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

export default ShortDescriptionModal;
