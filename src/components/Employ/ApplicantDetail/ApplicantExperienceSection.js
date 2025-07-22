import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {LinearGradient} from 'react-native-linear-gradient';

import EditIcon from '@assets/images/edit_gray.svg';
import TrashcanIcon from '@assets/images/delete_gary.svg';
import {parseSlashDateToYearMonthDot} from '@utils/formatDate';
import ButtonWhite from '@components/ButtonWhite';
import EmployExperienceModal from '@components/modals/Employ/EmployExperienceModal';

const ApplicantExperienceSection = ({
  experiences,
  isEditable = false,
  setExperience = null,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // 추가 버튼 클릭
  const handleAdd = () => {
    setEditingIndex(null);
    setEditingData(null);
    setModalVisible(true);
  };

  // 수정 버튼 클릭
  const handleEdit = (exp, index) => {
    setEditingIndex(index);
    setEditingData(exp);
    setModalVisible(true);
  };

  // 삭제 버튼 클릭
  const handleDelete = index => {
    const updated = [...experiences];
    updated.splice(index, 1);
    setExperience(updated);
  };
  return (
    <View style={styles.sectionBox}>
      <Text style={{...FONTS.fs_16_medium, color: COLORS.grayscale_800}}>
        경력
      </Text>

      {experiences.map((exp, idx) => (
        <View key={idx} style={styles.timelineItem}>
          <View style={styles.timelineDetailContainer}>
            {/* 줄 */}
            <LinearGradient
              colors={[COLORS.primary_orange, COLORS.grayscale_0]} // 예: 진한 오렌지에서 밝은 오렌지로
              style={styles.timelineLine}
            />
            {/* 상세 내용 */}
            <View style={styles.experienceContent}>
              <Text style={styles.experiencePeriod}>
                {parseSlashDateToYearMonthDot(exp.startDate)} -{' '}
                {parseSlashDateToYearMonthDot(exp.endDate)}
              </Text>
              <Text style={styles.experienceCompany}>{exp.companyName}</Text>
              {/* <Text style={styles.experienceDuties}>{exp.workType}</Text> */}
              <Text style={styles.experienceDuties}>{exp.description}</Text>
            </View>
          </View>

          {/* 수정, 삭제 버튼 */}
          {isEditable ? (
            <View style={styles.timelineDetailContainer}>
              <TouchableOpacity onPress={() => handleEdit(exp, idx)}>
                <EditIcon width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(idx)}>
                <TrashcanIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}
        </View>
      ))}
      {isEditable ? (
        <ButtonWhite title="경력 추가하기" onPress={() => handleAdd()} />
      ) : (
        <></>
      )}

      <EmployExperienceModal
        visible={modalVisible}
        initialData={editingData}
        onClose={() => setModalVisible(false)}
        addExperience={data => {
          let updated = [];
          if (editingIndex !== null) {
            // 수정
            updated = [...experiences];
            updated[editingIndex] = data;
          } else {
            // 추가
            updated = [...experiences, data];
          }
          setExperience(updated);
          setModalVisible(false);
        }}
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
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDetailContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLine: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.primary_orange,
  },
  experienceContent: {
    gap: 4,
  },
  experiencePeriod: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  experienceCompany: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  experienceDuties: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_600,
  },
});

export default ApplicantExperienceSection;
