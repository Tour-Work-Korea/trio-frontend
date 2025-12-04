import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import XBtn from '@assets/images/x_gray.svg';

const MeetDetailInfoModal = ({
  visible,
  onClose,
  title,
  type = 'tag', // 'tag' | 'section'
  tags = [], // 태그형일 때
  content = '', // 태그형 본문
  sections = [], // 섹션형 [{subtitle: "", body: ""}]
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.headerRow}>
            <Text style={[FONTS.fs_18_bold, styles.headerTitle]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <XBtn width={22} height={22} />
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 */}
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>

            {/* 태그형 */}
            {type === 'tag' && (
              <View>
                {/* 태그들 */}
                <View style={styles.tagRow}>
                  {tags.map((tag, idx) => (
                    <Text
                      key={idx}
                      style={[FONTS.fs_14_medium, styles.tagText]}>
                      {tag}
                    </Text>
                  ))}
                </View>

                {/* 본문 */}
                <Text style={[FONTS.fs_14_regular, styles.tagContent]}>
                  {content}
                </Text>
              </View>
            )}

            {/* 섹션형 */}
            {type === 'section' && (
              <View style={{gap: 32}}>
                {sections.map((sec, idx) => (
                  <View key={idx} style={styles.sectionBox}>
                    <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>
                      {sec.subtitle}
                    </Text>

                    <Text style={[FONTS.fs_14_regular, styles.sectionBody]}>
                      {sec.body}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

export default MeetDetailInfoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
    minHeight: '40%',
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: COLORS.grayscale_900,
  },
  scrollArea: {
    paddingBottom: 12,
  },

  // 태그형
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  tagContent: {
    lineHeight: 22,
    color: COLORS.grayscale_700,
  },

  // 섹션형
  sectionBox: {
  },
  sectionTitle: {
    marginBottom: 8,
    color: COLORS.grayscale_900,
  },
  sectionBody: {
    lineHeight: 22,
    color: COLORS.grayscale_700,
  },
});
