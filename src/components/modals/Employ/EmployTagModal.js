import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';
import userEmployApi from '@utils/api/userEmployApi';
import ErrorModal from '../ErrorModal';

const {height} = Dimensions.get('window');

export default function EmployTagModal({
  visible,
  onClose,
  addTags,
  initialData = null,
}) {
  const [tags, setTags] = useState();
  const [selectedTags, setSelectedTags] = useState();
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    setSelectedTags(initialData);
    fetchTags();
  }, []);
  const fetchTags = async () => {
    try {
      const response = await userEmployApi.getUserHashtags();
      setTags(response.data);
    } catch (error) {
      console.warn('태그 조회 실패:', error?.response?.message);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={FONTS.fs_20_semibold}>태그</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tagSelectRow}>
            {tags?.map(tag => {
              const isSelected = selectedTags?.some(t => t.id === tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedTags(prev =>
                        prev.filter(t => t.id !== tag.id),
                      );
                    } else {
                      if (selectedTags?.length >= 3) {
                        setErrorModalVisible(true);
                      } else {
                        setSelectedTags(prev => [...prev, tag]);
                      }
                    }
                  }}
                  style={styles.tagOptionContainer}>
                  <Text
                    style={[
                      styles.tagOptionText,
                      FONTS.fs_14_medium,
                      isSelected && styles.tagOptionSelectedText,
                      isSelected && FONTS.fs_14_semibold,
                    ]}>
                    {tag.hashtag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  addTags(selectedTags);
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
      <ErrorModal
        visible={errorModalVisible}
        title={'태그는 3개까지만 선택 가능합니다'}
        buttonText={'확인'}
        onPress={() => setErrorModalVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },

  // 하단 버튼
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
  //태그
  tagSelectRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  tagOptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    width: '48%',
  },
  tagOptionText: {
    color: COLORS.grayscale_400,
  },
  tagOptionSelectedText: {
    color: COLORS.primary_orange,
  },
});
