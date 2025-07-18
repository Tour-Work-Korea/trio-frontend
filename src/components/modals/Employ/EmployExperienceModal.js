import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';
import Calendar from '@assets/images/calendar_gray.svg';
import MonthPicker from '@components/Employ/MonthPicker';

const {height} = Dimensions.get('window');

export default function EmployExperienceModal({
  visible,
  onClose,
  addExperience,
  initialData = null,
}) {
  const [experience, setExperience] = useState({
    companyName: '',
    description: '',
    endDate: '',
    startDate: '',
    workType: '',
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [dateFieldTarget, setDateFieldTarget] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({year: 2025, month: 4});

  useEffect(() => {
    if (initialData) {
      setExperience(initialData);
    } else {
      setExperience({
        companyName: '',
        description: '',
        endDate: '',
        startDate: '',
        workType: '',
      });
    }
  }, [visible, initialData]);

  const handleDateInputPress = field => {
    setDateFieldTarget(field); // 'startDate' or 'endDate'
    const defaultDate = dayjs().format('YYYY.MM');
    if (!experience[field]) {
      setExperience(prev => ({...prev, [field]: defaultDate}));
      setSelectedPeriod({
        year: dayjs().year(),
        month: dayjs().month() + 1,
      });
    } else {
      const [year, month] = experience[field].split('.').map(Number);
      setSelectedPeriod({year, month});
    }
    setIsDatePickerVisible(true);
  };
  const handleMonthChange = date => {
    const formatted = `${date.year}.${String(date.month).padStart(2, '0')}`;
    setExperience(prev => ({...prev, [dateFieldTarget]: formatted}));
    setIsDatePickerVisible(false);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>경력</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          {/* 입력 폼 */}
          <View style={styles.detailContainer}>
            {/* 회사명 입력 */}
            <View>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>회사명</Text>
                <Text style={styles.titleLength}>
                  <Text style={{color: COLORS.primary_orange}}>
                    {experience.companyName.length}
                  </Text>
                  /50
                </Text>
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="회사명이나 업종을 입력해주세요"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={experience.companyName}
                  onChangeText={data =>
                    setExperience(prev => ({...prev, companyName: data}))
                  }
                  maxLength={50}
                />
              </View>
            </View>
            {/* 근무기간 입력 */}
            <View>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>근무기간</Text>
              </View>
              <View style={styles.dateInputBox}>
                <TouchableOpacity
                  style={[styles.inputBox, {flex: 1}]}
                  onPress={() => handleDateInputPress('startDate')}>
                  <Text style={styles.textInput}>
                    {experience.startDate || '근무시작일'}
                  </Text>
                  <Calendar width={24} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.inputBox, {flex: 1}]}
                  onPress={() => handleDateInputPress('endDate')}>
                  <Text style={styles.textInput}>
                    {experience.endDate || '근무종료일'}
                  </Text>
                  <Calendar width={24} />
                </TouchableOpacity>
              </View>
              {isDatePickerVisible && (
                <MonthPicker
                  selectedDate={selectedPeriod}
                  onChange={handleMonthChange}
                />
              )}
            </View>
            {/* 담당업무 */}
            <View>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>담당업무</Text>
                <Text style={styles.titleLength}>
                  <Text style={{color: COLORS.primary_orange}}>
                    {experience.description.length}
                  </Text>
                  /50
                </Text>
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="ex) 서빙, 설거지, 계산"
                  placeholderTextColor={COLORS.grayscale_400}
                  value={experience.description}
                  onChangeText={data =>
                    setExperience(prev => ({...prev, description: data}))
                  }
                  maxLength={50}
                />
              </View>
            </View>
          </View>
          {/* 하단 버튼 */}
          <View style={styles.sticky}>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="적용하기"
                onPress={() => {
                  addExperience(experience);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },

  //본문
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
  },
  titleLength: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  // 하단 버튼
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
  //본문
  detailContainer: {
    gap: 20,
  },
  inputBox: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
  },
  textInput: {
    paddingVertical: 0,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
  },
  dateInputBox: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
