import React from 'react';
import {View, Text, Image} from 'react-native';
import styles from '../../../screens/(Common)/BottomTabs/Employ/EmployDetail/EmployDetail.styles';

export default function RecruitProfileSection({recruit}) {
  return (
    <>
      {/* 공고 제목 및 정보 */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{recruit.recruitTitle}</Text>
        <View style={styles.tagsContainer}>
          {recruit?.hashtags?.map(tag => (
            <View style={styles.tag} key={tag.id}>
              <Text style={styles.tagText}>#{tag.hashtag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.location}>{recruit.location}</Text>
        <Text style={styles.description}>
          {recruit.recruitShortDescription}
        </Text>
        {/* 공고 리뷰 */}
        {/* <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              업체 리뷰 평점({recruit.averageRating}) {recruit.numberOfReviews}
              개 {'>'}
            </Text>
          </TouchableOpacity> */}
      </View>
    </>
  );
}
