import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import EditIcon from '@assets/images/edit_gray.svg';
import EmployTagModal from '@components/modals/Employ/EmployTagModal';

const ApplicantTag = ({tags, isEditable = false, setTags = null}) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View>
      <View style={styles.sectionBox}>
        <View style={styles.titleBox}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>태그</Text>
            <Text style={styles.subTitleText}>
              나를 표현하는 세 가지 키워드
            </Text>
          </View>
          {isEditable ? (
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
              }}>
              <EditIcon width={24} />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={styles.tagContainer}>
          {tags?.map((item, idx) => (
            <Text key={idx} style={styles.tag}>
              {item.hashtag}
            </Text>
          ))}
        </View>
      </View>
      <EmployTagModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        addTags={setTags}
        initialData={tags}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 20,
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  subTitleText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
  },
});
export default ApplicantTag;
