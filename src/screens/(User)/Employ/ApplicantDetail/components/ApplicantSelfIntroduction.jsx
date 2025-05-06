import React from 'react';
import {View, Text} from 'react-native';
import styles from '../ApplicantDetail.styles';

const ApplicantSelfIntroduction = ({text}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>자기소개서</Text>
      <View style={styles.introductionCard}>
        <Text style={styles.introductionText}>{text}</Text>
      </View>
    </View>
  );
};

export default ApplicantSelfIntroduction;
