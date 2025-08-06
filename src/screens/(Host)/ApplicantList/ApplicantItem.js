import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import styles from './ApplicantList.styles';

export default function ApplicantItem({item, handleApplicantPress}) {
  return (
    <TouchableOpacity onPress={() => handleApplicantPress(item.id)}>
      <View style={styles.applicantCard}>
        <View>
          <View style={styles.tagsRow}>
            {item.userHashtag.map(tag => (
              <Text key={tag.id} style={styles.hashTag}>
                {tag.hashtag}
              </Text>
            ))}
          </View>
          <Text style={styles.introductionText}>{item.resumeTitle}</Text>
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
              <Text style={styles.infoLabel}>성별/나이</Text>
              <Text style={styles.infoValue}>
                {item.gender === 'F' ? '여자' : '남자'} / {item.age}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{item.mbti}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>경력</Text>
              <Text style={styles.infoValue}>{item.totalExperience}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
