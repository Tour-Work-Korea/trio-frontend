import React from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import styles from '../ApplicantList.styles';

export default function ApplicantItem({item, handleApplicantPress}) {
  return (
    <TouchableOpacity onPress={() => handleApplicantPress(item.id)}>
      <View style={styles.applicantCard}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.guesthouseName}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.recruitTitle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{uri: item.photoUrl}}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.nameText}>{item.nickname}</Text>
            <Text style={styles.genderAgeText}>
              ({item.gender}, {item.age}세)
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.introductionText}>{item.resumeTitle}</Text>
            <View style={styles.tagsRow}>
              {item.userHashtag.map(tag => (
                <Text key={tag.id} style={styles.hashTag}>
                  #{tag.hashtag}
                </Text>
              ))}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MBTI</Text>
              <Text style={styles.infoValue}>{item.mbti}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>경력</Text>
              <Text style={styles.infoValue}>
                {item.workExperience
                  .map(w => `${w.companyName}(${w.workType})`)
                  .join(', ')}
              </Text>
            </View>

            <Text style={styles.careerYears}>{item.totalExperience}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
