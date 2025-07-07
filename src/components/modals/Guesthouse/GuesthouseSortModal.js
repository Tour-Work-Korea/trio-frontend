import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

import XIcon from "@assets/images/x_gray.svg";
import CheckIcon from "@assets/images/check20_orange.svg";
import WorkawayIcon from "@assets/images/workaway_text_gray.svg";

import { FONTS } from "@constants/fonts";
import { COLORS } from "@constants/colors";

const { height } = Dimensions.get("window");

const sortOptions = [
  "낮은 가격 순",
  "높은 가격 순",
  "후기 좋은 순",
  "후기 많은 순",
  "찜 많은 순",
];

const GuesthouseSortModal = ({ visible, onClose, selected, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_16_medium, styles.headerTitle]}>정렬</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 추천 */}
          <View style={styles.recommendContainer}>
            <WorkawayIcon width={80} height={20} />
            <Text style={[FONTS.fs_14_medium, styles.recommendText]}>
              추천 순
            </Text>
          </View>

          {/* 목록 */}
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                selected === option && styles.optionItemSelected,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  FONTS.fs_14_medium,
                  selected === option && styles.optionSelectedText,
                ]}
              >
                {option}
              </Text>
              {selected === option && (
                <CheckIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default GuesthouseSortModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: COLORS.modal_background,
  },
  modal: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: height * 0.5,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: COLORS.grayscale_900,
  },
  closeButton: {
    position: "absolute",
    right: 0,
  },
  recommendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendText: {
    marginLeft: 4,
    color: COLORS.grayscale_600,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  optionItemSelected: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  optionSelectedText: {
    color: COLORS.primary_orange,
  },
});
