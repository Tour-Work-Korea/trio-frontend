import React from 'react';
import {View, Text} from 'react-native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import styles from '../ApplicantDetail.styles';

const ApplicantProfileHeader = ({data, hashtags}) => {
  return (
    <View style={styles.profileHeaderContainer}>
      <Text style={styles.pageTitle}>{data.resumeTitle}</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <ProfileIcon width={80} height={80} />
        </View>
        <Text style={styles.profileName}>
          {data.nickname} {data.gender} • {data.age}세(
          {data.birthDate.split('-')[0]})
        </Text>
        <View>
          <InfoRow label="연락처" value={data.phone} />
          <InfoRow label="이메일" value={data.email} />
          <InfoRow label="주소" value={data.address} />
          <InfoRow label="MBTI" value={data.mbti} />
          <InfoRow label="인스타그램" value={data.instagramId} />
          <InfoRow label="해시태그" value={hashtags} isHashtag />
        </View>
      </View>
    </View>
  );
};

const InfoRow = ({label, value, isHashtag}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isHashtag ? (
      <View>
        {value.map((item, idx) => (
          <Text key={idx} style={styles.infoValue}>
            {' '}
            #{item.hashtag}{' '}
          </Text>
        ))}
      </View>
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

export default ApplicantProfileHeader;
