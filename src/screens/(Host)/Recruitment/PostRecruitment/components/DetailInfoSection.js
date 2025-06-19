import React from 'react';
import {View, Text, TextInput} from 'react-native';
import styles from '../PostRecruitment.styles';

export default function DetailInfoSection({formData, handleInputChange}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>상세 소개글</Text>
      <View style={styles.divider} />

      <View style={styles.formGroup}>
        <TextInput
          style={styles.textArea}
          placeholder="공고에 대한 상세 정보를 입력해주세요."
          multiline={true}
          numberOfLines={4}
          value={formData.recruitDetail}
          onChangeText={text => handleInputChange('recruitDetail', text)}
        />
      </View>
    </View>
  );
}
