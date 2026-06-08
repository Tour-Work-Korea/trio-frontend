import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import XIcon from '@assets/images/x_gray.svg';
import CheckIcon from '@assets/images/check20_orange.svg';
import WorkawayIconGray from '@assets/images/workaway_text_gray.svg';
import WorkawayIconOrange from '@assets/images/workaway_text_orange.svg';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const sortOptions = [
  {label: '추천 순', value: 'RECOMMEND'},
  {label: '최신 순', value: 'LATEST'},
  {label: '좋아요 순', value: 'LIKE_COUNT'},
];

const EmploySortModal = ({visible, onClose, selected, onSelect}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
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
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selected === option.value && styles.optionItemSelected,
                ]}
                onPress={() => onSelect(option)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* 추천 순만 아이콘 보여주기 */}
                  {option.value === 'RECOMMEND' &&
                    (selected === 'RECOMMEND' ? (
                      <WorkawayIconOrange style={{marginRight: 4}} />
                    ) : (
                      <WorkawayIconGray style={{marginRight: 4}} />
                    ))}
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.optionText,
                      selected === option.value && styles.optionSelectedText,
                      selected === option.value && FONTS.fs_14_semibold,
                    ]}>
                    {option.label}
                  </Text>
                </View>
                {selected === option.value && (
                  <CheckIcon width={20} height={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmploySortModal;

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
