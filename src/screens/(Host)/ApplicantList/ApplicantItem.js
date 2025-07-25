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
            {/* <Text style={styles.nameText}>{item.nickname}</Text>
            <Text style={styles.genderAgeText}>
              ({item.gender}, {item.age}세)
            </Text> */}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>연락처</Text>
              <Text style={styles.infoValue}>{item.phoneNumber}</Text>
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
