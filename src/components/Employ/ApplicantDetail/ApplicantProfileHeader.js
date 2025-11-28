import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import ProfileIcon from '@assets/images/wlogo_gray_up.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {openWebLink} from '@utils/openWebLink';

const ApplicantProfileHeader = ({data}) => {
  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.profileName}>{data?.nickname}</Text>
          <Text style={styles.basicInfoText}>
            {data?.gender === 'F' ? '여자!!!' : '남자'} • {data?.age}세 (
            {data?.birthDate.split('-')[0]}년생)
          </Text>
        </View>
        <View style={styles.profileMainContainer}>
          {data?.photoUrl !== '사진을 추가해주세요' ? (
            <Image
              source={{uri: data?.photoUrl}}
              style={styles.profileImageContainer}
            />
          ) : (
            <View style={styles.profileImageContainer}>
              <ProfileIcon width={40} height={40} />
            </View>
          )}

          <View style={styles.infoContainer}>
            <InfoRow label="연락처" value={data?.phone} />
            <InfoRow label="이메일" value={data?.email} />
            <InfoRow label="MBTI" value={data?.mbti ?? data?.resumeMbti} />
            <InfoRow
              label="insta"
              value={data?.instagramId}
              onPress={() => {
                openWebLink(`https://www.instagram.com/${data?.instagramId}`);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
const InfoRow = ({label, value, onPress = null}) => (
  <TouchableOpacity style={styles.infoRow} onPress={onPress}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </TouchableOpacity>
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
    width: 50,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    textAlign: 'left',
    flex: 1,
  },
});
