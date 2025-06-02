import React from 'react';
import {View, Text} from 'react-native';
import styles from '../ApplicantDetail.styles';

const ApplicantExperienceSection = ({experiences, totalExperience}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>경력</Text>
        <Text style={styles.experienceTotal}>{totalExperience}</Text>
      </View>
      <View style={styles.experienceCard}>
        <View style={styles.timelineContainer}>
          {experiences.map((exp, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View
                style={[
                  styles.timelineLine,
                  idx === experiences.length - 1 && styles.lastTimelineLine,
                ]}
              />
              <View style={styles.experienceContent}>
                <Text style={styles.experiencePeriod}>
                  {' '}
                  {new Date(exp.startDate).toISOString().split('T')[0]} -{' '}
                  {new Date(exp.endDate).toISOString().split('T')[0]}
                </Text>
                <Text style={styles.experienceCompany}>{exp.companyName}</Text>
                <Text style={styles.experienceDuties}>{exp.workType}</Text>
                <Text style={styles.experienceDuties}>{exp.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ApplicantExperienceSection;
