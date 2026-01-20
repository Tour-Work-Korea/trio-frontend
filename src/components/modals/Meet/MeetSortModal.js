import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

import XIcon from '@assets/images/x_gray.svg';
import CheckIcon from '@assets/images/check20_orange.svg';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import { meetSortOptions } from '@constants/meetOptions';

const {height} = Dimensions.get('window');

const MeetSortModal = ({visible, onClose, selected, onSelect}) => {  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>{/* 막기 위해 중첩 */}
        <View style={styles.modal}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.headerTitle]}>정렬</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 목록 */}
          <View style={styles.contentContainer}>
            {meetSortOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  selected === option.id && styles.optionItemSelected,
                ]}
                onPress={() => onSelect(option.id)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.optionText,
                      selected === option.id && styles.optionSelectedText,
                      selected === option.id && FONTS.fs_14_semibold,
                    ]}>
                    {option.name}
                  </Text>
                </View>
                {selected === option.id && (
                  <CheckIcon width={20} height={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetSortModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modal_background,
  },
  modal: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: height * 0.2,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 20,
  },
  headerTitle: {},
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 정렬 리스트
  contentContainer: {
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  optionText: {
    color: COLORS.grayscale_500,
  },
  optionItemSelected: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 12,
  },
  optionSelectedText: {
    color: COLORS.primary_orange,
  },
});
