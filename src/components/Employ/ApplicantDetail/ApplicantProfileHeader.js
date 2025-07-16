import React from 'react';
import {View, Text} from 'react-native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import styles from './ApplicantDetail.styles';

const ApplicantProfileHeader = ({data, hashtags}) => {
  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.profileName}>{data.nickname}</Text>
          <Text style={styles.basicInfoText}>
            {data.gender === 'F' ? '여자' : '남자'} • {data.age}세 (
            {data.birthDate.split('-')[0]}년생)
          </Text>
        </View>
        <View style={styles.profileMainContainer}>
          <View style={styles.profileImageContainer}>
            <ProfileIcon width={80} height={80} />
          </View>

          <View style={{flex: 1, gap: 4}}>
            <InfoRow label="연락처" value={data.phone} />
            <InfoRow label="이메일" value={data.email} />
            <InfoRow label="주소" value={data.address} />
            <InfoRow label="MBTI" value={data.mbti} />
            <InfoRow label="insta" value={data.instagramId} />
          </View>
        </View>
      </View>
    </View>
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default ApplicantProfileHeader;
