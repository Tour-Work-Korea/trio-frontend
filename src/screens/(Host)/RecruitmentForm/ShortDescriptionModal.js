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
  TextInput,
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

const ShortDescriptionModal = ({
  handleInputChange,
  formData,
  visible,
  onClose,
}) => {
  const [shortDescription, setShortDescription] = useState('');
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
