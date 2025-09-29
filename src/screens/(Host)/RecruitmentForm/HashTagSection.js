import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import hostEmployApi from '@utils/api/hostEmployApi';
import ErrorModal from '@components/modals/ErrorModal';

import styles from './RecruitmentForm.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const HashTagSection = ({handleInputChange, formData}) => {
  const [tags, setTags] = useState();
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});
  useEffect(() => {
    tryFetchHostHashtags();
  }, []);

  //해시태그 조회
  const tryFetchHostHashtags = async () => {
    try {
      const response = await hostEmployApi.getHostHashtags();
      setTags(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ?? '해시태그 조회에 실패했습니다.',
      });
    }
  };

  const handleTagToggle = (tagId, isSelected) => {
    if (!isSelected && formData.hashtags.length >= 3) {
      setErrorModal({
        visible: true,
        title: '태그는 최대 3개까지 선택할 수 있어요',
      });
      return;
    }

    const updatedHashtags = isSelected
      ? formData.hashtags.filter(hashtagId => hashtagId !== tagId)
      : [...formData.hashtags, tagId];

    handleInputChange('hashtags', updatedHashtags);
  };

  return (
    <View style={styles.section}>
      <Text
        style={{
          color: COLORS.grayscale_900,
          ...FONTS.fs_16_medium,
        }}>
        태그
      </Text>
      <View style={styles.divider} />

      <Text style={styles.description}>
        태그로 공고를 눈에 띄게 나타내보세요! (최대 3개 선택가능)
      </Text>

      <View style={styles.tagSelectRow}>
        {tags?.map(tag => {
          const isSelected = formData.hashtags?.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={styles.tagOptionContainer}
              onPress={() => handleTagToggle(tag.id, isSelected)}>
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

      <ErrorModal
        title={errorModal.title}
        visible={errorModal.visible}
        buttonText={'확인'}
        onPress={() => setErrorModal({visible: false, title: ''})}
      />
    </View>
  );
};

export default HashTagSection;
