import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './ApplicantList.styles';
import {formatLocalDateToDot} from '@utils/formatDate';
import Avatar from '@components/Avatar';
import {openWebLink} from '@utils/openWebLink';

export default function ApplicantCard({item, handleApplicantPress}) {
  return (
    <TouchableOpacity onPress={() => handleApplicantPress(item.id)}>
      <View style={styles.applicantCard}>
        <View style={styles.applyRow}>
          <Text style={styles.applyBox}>지원 날짜</Text>
          <Text style={styles.applyBox}>
            {formatLocalDateToDot(item.applyDate)}
          </Text>
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.profileImageContainer}>
            <Avatar
              uri={item.photoUrl}
              size={68}
              iconSize={32}
              borderRadius={8}
              style={styles.profileImage}
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

            <TouchableOpacity
              style={styles.infoRow}
              onPress={() =>
                openWebLink(`https://www.instagram.com/${item?.instagram}`)
              }>
              <Text style={styles.infoLabel}>insta</Text>
              <Text style={styles.infoValue}>{item.instagram}</Text>
            </TouchableOpacity>
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
