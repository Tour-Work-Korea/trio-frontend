import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';

import XIcon from '@assets/images/x_gray.svg';

// title 모달 제목
// content 약관동의 내용 -> 나중에 data파일에 적어주고 모달호출할때 보내주면 될듯!
// onAgree 동의합니다 누르고 진행할 함수

const TermsModal = ({ visible, onClose, title, content, onAgree }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={[FONTS.fs_18_semibold]}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <XIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* 본문 */}
            <View style={styles.contentBox}>
              <ScrollView >
                <Text style={[FONTS.fs_14_regular, styles.contentText]}>
                  {content}
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* 동의 버튼 */}
          <View style={styles.agreeButton}>
            <ButtonScarlet
              onPress={onAgree}
              title={'동의합니다'}
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: "flex-end",
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 본문
  contentBox: {
    backgroundColor: COLORS.grayscale_200,
    flexGrow: 1,
    minHeight: 520,
    marginBottom: 20,
  },
  contentText: {
    color: COLORS.grayscale_900,
    lineHeight: 20,
  },

  // 동의 버튼
  agreeButton: {
  },
});

export default TermsModal;
