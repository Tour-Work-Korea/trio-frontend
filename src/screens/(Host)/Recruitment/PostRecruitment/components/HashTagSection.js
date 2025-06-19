import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import styles from '../PostRecruitment.styles';
import hostEmployApi from '@utils/api/hostEmployApi';

const HashTagSection = ({handleInputChange, formData}) => {
  const [hashtags, setHashtags] = useState();

  useEffect(() => {
    fetchHostHashtags();
  }, []);

  //해시태그 조회
  const fetchHostHashtags = async () => {
    try {
      const response = await hostEmployApi.getHostHashtags();
      setHashtags(response.data);
    } catch (error) {
      Alert.alert('해시태그 조회에 실패했습니다.');
    }
  };

  const handleTagToggle = (tagId, isSelected) => {
    if (!isSelected && formData.hashtags.length >= 3) {
      Alert.alert('알림', '태그는 최대 3개까지 선택할 수 있어요.');
      return;
    }

    const updatedHashtags = isSelected
      ? formData.hashtags.filter(hashtagId => hashtagId !== tagId)
      : [...formData.hashtags, tagId];

    handleInputChange('hashtags', updatedHashtags);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>태그</Text>
      <View style={styles.divider} />

      <Text style={styles.tagDescription}>
        태그로 공고를 눈에 띄게 나타내보세요! (최대 3개 선택가능)
      </Text>

      <View style={styles.tagGrid}>
        {hashtags?.map(tag => {
          const isSelected = formData.hashtags?.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
              onPress={() => handleTagToggle(tag.id, isSelected)}>
              <Text
                style={[
                  styles.tagButtonText,
                  isSelected && styles.tagButtonTextSelected,
                ]}>
                {tag.hashtag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default HashTagSection;
