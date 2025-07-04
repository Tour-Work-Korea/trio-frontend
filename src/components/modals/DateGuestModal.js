import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

import MinusIcon from '@assets/images/minus_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import XIcon from '@assets/images/x_gray.svg';

import ButtonScarlet from '@components/ButtonScarlet';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

// 안드로이드 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DateGuestModal = ({ visible, onClose, onApply }) => {
  // 아코디언 효과
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const toggleGuestSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsGuestOpen(!isGuestOpen);
  };

  const toggleDateSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDateOpen(!isDateOpen);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.title]}>날짜, 인원 선택</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <XIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* 날짜 */}
          <View style={styles.section}>
            <TouchableOpacity
                style={styles.sectionText}
                onPress={toggleDateSection}
            >
                <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>날짜</Text>
                <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>07.03(목) - 07.05(토), 2박</Text>
            </TouchableOpacity>
            {isDateOpen && (
              <View style={styles.selectContainer}>
                <Text style={{ color: "gray" }}>[달력 컴포넌트 자리]</Text>
              </View>
            )}
          </View>

          {/* 인원 */}
          <View style={styles.section}>
            <TouchableOpacity
                style={styles.sectionText}
                onPress={toggleGuestSection}
            >
                <Text style={[FONTS.fs_16_medium, styles.selectedTitle]}>인원</Text>
                <Text style={[FONTS.fs_14_semibold, styles.selectedText]}>성인 2</Text>
            </TouchableOpacity>
            {isGuestOpen && (
              <View style={styles.selectContainer}>
                  <View style={styles.guestContainer}>
                      <Text style={FONTS.fs_16_semibold}>성인</Text>
                      <View style={styles.selectGuest}>
                          <TouchableOpacity style={styles.pmIconContainer}>
                              <MinusIcon width={24} height={24}/>
                          </TouchableOpacity>
                          <View style={styles.guestText}>
                              <Text style={FONTS.fs_14_medium}>2</Text>
                          </View>
                          <TouchableOpacity style={styles.pmIconContainer}>
                              <PlusIcon width={24} height={24}/>
                          </TouchableOpacity>
                      </View>
                  </View>
                  <View style={styles.guestContainer}>
                      <Text style={FONTS.fs_16_semibold}>아동</Text>
                      <View style={styles.selectGuest}>
                          <TouchableOpacity style={styles.pmIconContainer}>
                              <MinusIcon width={24} height={24}/>
                          </TouchableOpacity>
                          <View style={styles.guestText}>
                              <Text style={FONTS.fs_14_medium}>2</Text>
                          </View>
                          <TouchableOpacity style={styles.pmIconContainer}>
                              <PlusIcon width={24} height={24}/>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
            )}
          </View>

          {/* 적용 버튼 */}
          <ButtonScarlet title="적용하기" />
        </View>
      </View>
    </Modal>
  );
};

export default DateGuestModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    height: height * 0.9,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_600,
  },

  // 제목, 닫기 버튼
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  title: {
    color: COLORS.grayscale_900,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 선택 틀
  section: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTitle: {
    color: COLORS.grayscale_800,
  },
  selectedText: {
    color: COLORS.primary_blue,
  },
  
  // 선택
  panel: {
    // overflow: 'hidden',
  },
  selectContainer: {
    borderTopWidth: 0.8,
    borderTopColor: COLORS.grayscale_200,
    marginTop: 20,
    paddingTop: 20,
    gap: 12,
  },

  // 인원 선택
  guestContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectGuest: {
    flexDirection: "row",
    alignItems: 'center',
  },
  pmIconContainer: {
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 100,
  },
  guestText: {
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
  },

});
