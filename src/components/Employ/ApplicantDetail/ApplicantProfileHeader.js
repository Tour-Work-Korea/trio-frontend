import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import ProfileIcon from '@assets/images/Gray_Person.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const ApplicantProfileHeader = ({data}) => {
  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.profileName}>{data?.nickname}</Text>
          <Text style={styles.basicInfoText}>
            {data?.gender === 'F' ? '여자' : '남자'} • {data?.age}세 (
            {data?.birthDate.split('-')[0]}년생)
          </Text>
        </View>
        <View style={styles.profileMainContainer}>
          {data?.photoUrl ? (
            <Image
              source={{uri: data?.photoUrl}}
              style={styles.profileImageContainer}
            />
          ) : (
            <View style={styles.profileImageContainer}>
              <ProfileIcon width={80} height={80} />
            </View>
          )}

          <View style={styles.infoContainer}>
            <InfoRow label="연락처" value={data?.phone} />
            <InfoRow label="이메일" value={data?.email} />
            <InfoRow label="MBTI" value={data?.mbti} />
            <InfoRow label="insta" value={data?.instagramId} />
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

const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  //프로필
  basicInfoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  profileName: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
  },
  basicInfoText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  profileMainContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 116,
    height: 116,
    borderRadius: 8,
    backgroundColor: '#E6E9F0',
    alignSelf: 'center',
  },
  infoContainer: {flex: 1, gap: 4, justifyContent: 'center'},
  infoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  infoLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    width: 37,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    textAlign: 'right',
  },
});
