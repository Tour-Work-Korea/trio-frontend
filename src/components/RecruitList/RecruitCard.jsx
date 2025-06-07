import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import styles from './RecruitList.styles';

const RecruitCard = ({item, onPress, onApply, onToggleFavorite}) => {
  return (
    <View style={styles.RecruitCard}>
      <TouchableOpacity style={styles.jobItemContent} onPress={onPress}>
        <Image
          source={require('@assets/images/exphoto.jpeg')} // 실제로는 item.thumbnailImage
          style={styles.jobImage}
          resizeMode="cover"
        />
        <View style={styles.jobDetails}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobType}>{item.guesthouseName}</Text>
            {item.deadline && (
              <Text style={styles.deadline}>{item.deadline}</Text>
            )}
          </View>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.recruitTitle}
            </Text>
            <TouchableOpacity onPress={onToggleFavorite}>
              {item.isLiked ? (
                <FilledHeartIcon width={20} height={20} />
              ) : (
                <HeartIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.jobHeader}>
            <View>
              {item.hashtags && (
                <View style={styles.tagsContainer}>
                  {item.hashtags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      {tag.hashtag}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.jobLocation}>{item.address}</Text>
              <Text style={styles.jobPeriod}>{item.workDate}</Text>
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>지원하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RecruitCard;
