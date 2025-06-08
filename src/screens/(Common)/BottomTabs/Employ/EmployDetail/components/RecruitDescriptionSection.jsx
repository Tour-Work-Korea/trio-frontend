import React from 'react';
import {View, Text} from 'react-native';
import styles from '../EmployDetail.styles';

export default function RecruitDescriptionSection({description}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>상세 정보</Text>
      <Text style={styles.detailContent}>{description}</Text>
    </View>
  );
}
