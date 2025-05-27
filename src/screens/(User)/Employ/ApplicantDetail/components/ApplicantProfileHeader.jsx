import React from 'react';
import {View, Text} from 'react-native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import styles from '../ApplicantDetail.styles';

const ApplicantProfileHeader = ({data}) => {
  return (
    <View style={styles.profileHeaderContainer}>
      <Text style={styles.pageTitle}>
        많은 업무에 항상 최선을 다하는 인재입니다.
      </Text>
      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <ProfileIcon width={80} height={80} />
        </View>
        <Text style={styles.profileName}>
          {data.name} {data.gender} • {data.age}세({data.birthYear})
        </Text>
        <View>
          <InfoRow label="연락처" value={data.phone} />
          <InfoRow label="이메일" value={data.email} />
          <InfoRow label="주소" value={data.address} />
          <InfoRow label="MBTI" value={data.mbti} />
          <InfoRow label="인스타그램" value={data.socialMedia} />
          <InfoRow label="해시태그" value={data.hashtag} isHashtag />
        </View>
      </View>
    </View>
  );
};

const InfoRow = ({label, value, isHashtag}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={isHashtag ? styles.infoValueHashtag : styles.infoValue}>
      {value}
    </Text>
  </View>
);

export default ApplicantProfileHeader;
