import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from '../ApplicantDetail.styles';

const ApplicantAttachments = ({attachments}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>첨부파일</Text>
      {attachments.map(file => (
        <TouchableOpacity key={file.id} style={styles.attachmentButton}>
          <Text style={styles.attachmentText}>{file.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ApplicantAttachments;
