import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import styles from './ApplicantList.styles';
import {formatLocalDateToDot} from '@utils/formatDate';

export default function ApplicantCard({item, handleApplicantPress}) {
  return (
    <TouchableOpacity onPress={() => handleApplicantPress(item.id)}>
      <View style={styles.applicantCard}>
        <View style={styles.applyRow}>
          <Text style={styles.applyText}>지원 날짜</Text>
          <Text style={styles.applyText}>
            {formatLocalDateToDot(item.applyDate)}
          </Text>
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{uri: item.photoUrl}}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>연락처</Text>
              <Text style={styles.infoValue}>{item.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{item.mbti}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>insta</Text>
              <Text style={styles.infoValue}>{item.instagram}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.introductionText}>{item.resumeTitle}</Text>
        <View style={styles.tagsRow}>
          {item.userHashtag.map(tag => (
            <Text key={tag.id} style={styles.hashTag}>
              {tag.hashtag}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
