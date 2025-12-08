import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import FilledHeartIcon from '@assets/images/Fill_Heart.svg';
import HeartIcon from '@assets/images/Empty_Heart.svg';
import styles from './RecruitList.styles';
import {parseSlashDateToYearMonth} from '@utils/formatDate';
import {trimJejuPrefix} from '@utils/formatAddress';

const RecruitCard = ({item, onPress, onToggleFavorite}) => {
  return (
    <View style={styles.RecruitCard}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.jobItemContent}>
          <Image
            source={{uri: item.thumbnailImage || item.recruitImage}}
            style={styles.jobImage}
            resizeMode="cover"
          />
          <View style={styles.jobDetails}>
            <View>
              {/* 게하 이름+하트 */}
              <View style={[styles.jobHeader, {marginBottom: 4}]}>
                <Text style={styles.jobType}>{item.guesthouseName}</Text>
                <TouchableOpacity onPress={onToggleFavorite}>
                  {item.isLiked ? (
                    <FilledHeartIcon width={20} height={20} />
                  ) : (
                    <HeartIcon width={20} height={20} />
                  )}
                </TouchableOpacity>
              </View>
              {/* 공고 제목 + 날짜 */}
              <View style={[styles.jobHeader]}>
                <Text
                  style={styles.jobTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.recruitTitle}
                </Text>
                {item.deadline && (
                  <Text style={styles.deadline}>
                    {parseSlashDateToYearMonth(item.deadline)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.jobHeader}>
              <Text style={styles.jobSmall}>
                {trimJejuPrefix(item.address ?? item.recruitAddress)}
              </Text>
              <Text style={styles.jobSmall}>
                {item.workDate ?? item.workPeriod}
              </Text>
            </View>
          </View>
        </View>
        {item.hashtags && (
          <View style={styles.hashTagContainer}>
            {item.hashtags.map((tag, index) => (
              <View key={index} style={styles.hashtagButton}>
                <Text style={styles.hashtagText}>{tag.hashtag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RecruitCard;
