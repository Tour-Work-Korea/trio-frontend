import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from './RecruitmentForm';
import Calendar from '@assets/images/Calendar.svg';

import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS} from '@constants/colors';

export default function RecruitConditionSection({handleInputChange, formData}) {
  const [showRecruitStart, setShowRecruitStart] = useState(false);
  const [showRecruitEnd, setShowRecruitEnd] = useState(false);
  const [showWorkStartDate, setShowWorkStartDate] = useState(false);
  const [showWorkEndDate, setShowWorkEndDate] = useState(false);
  const [datePicker, setDatePicker] = useState({
    visible: false,
    field: null,
    value: null,
  });

  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || formData[dateField];
    setDatePicker(prev => ({...prev, visible: false}));

    handleInputChange(dateField, currentDate);
  };

  const handleNumericInput = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    handleInputChange(field, parseInt(numericValue, 10));
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>모집조건</Text>
      <View style={styles.divider} />

      {/* 모집 기간 */}
      <View>
        <Text style={styles.subsectionTitle}>모집기간</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() =>
              setDatePicker({
                visible: true,
                field: 'recruitStart',
                value: formData.recruitStart,
              })
            }>
            <Text
              style={[
                styles.dateLabel,
                formData.recruitStart ? '' : {color: COLORS.grayscale_400},
              ]}>
              {formData.recruitStart
                ? new Date(formData.recruitStart).toLocaleDateString('ko-KR')
                : '시작일자'}
            </Text>
            <Calendar />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() =>
              setDatePicker({
                visible: true,
                field: 'recruitEnd',
                value: formData.recruitEnd,
              })
            }>
            <Text
              style={[
                styles.dateLabel,
                formData.recruitEnd ? '' : {color: COLORS.grayscale_400},
              ]}>
              {formData.recruitEnd
                ? new Date(formData.recruitEnd).toLocaleDateString('ko-KR')
                : '마감일자'}
            </Text>
            <Calendar />
          </TouchableOpacity>
        </View>
      </View>

      {/* 근무기간 */}
      <View>
        <Text style={styles.subsectionTitle}>근무기간</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() =>
              setDatePicker({
                visible: true,
                field: 'workStartDate',
                value: formData.workStartDate,
              })
            }>
            <Text
              style={[
                styles.dateLabel,
                formData.workStartDate ? '' : {color: COLORS.grayscale_400},
              ]}>
              {formData.workStartDate
                ? new Date(formData.workStartDate).toLocaleDateString('ko-KR')
                : '근무 시작일'}
            </Text>
            <Calendar />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateInput]}
            onPress={() =>
              setDatePicker({
                visible: true,
                field: 'workEndDate',
                value: formData.workEndDate,
              })
            }>
            <Text
              style={[
                styles.dateLabel,
                formData.workEndDate ? '' : {color: COLORS.grayscale_400},
              ]}>
              {formData.workEndDate
                ? new Date(formData.workEndDate).toLocaleDateString('ko-KR')
                : '근무 종료일'}
            </Text>
            <Calendar />
          </TouchableOpacity>
        </View>
      </View>

      {/* 모집인원 */}
      <View>
        <Text style={styles.subsectionTitle}>모집 인원</Text>
        <View style={styles.countRow}>
          <View style={styles.countItem}>
            <TextInput
              style={styles.input}
              placeholder="여자"
              placeholderTextColor={COLORS.grayscale_400}
              keyboardType="numeric"
              value={formData?.recruitNumberFemale?.toString()}
              onChangeText={text =>
                handleNumericInput('recruitNumberFemale', text)
              }
            />
          </View>

          <View style={styles.countItem}>
            <TextInput
              style={styles.input}
              placeholder="남자"
              placeholderTextColor={COLORS.grayscale_400}
              keyboardType="numeric"
              value={formData?.recruitNumberMale?.toString()}
              onChangeText={text =>
                handleNumericInput('recruitNumberMale', text)
              }
            />
          </View>
        </View>
      </View>

      {/* 나이 */}
      <View>
        <Text style={styles.subsectionTitle}>나이</Text>
        <View style={styles.ageRow}>
          <View style={styles.ageItem}>
            <TextInput
              style={styles.input}
              placeholder="최소 연령"
              placeholderTextColor={COLORS.grayscale_400}
              keyboardType="numeric"
              value={formData?.recruitMinAge?.toString()}
              onChangeText={text => handleNumericInput('recruitMinAge', text)}
            />
          </View>

          <View style={styles.ageItem}>
            <TextInput
              style={styles.input}
              placeholder="최대 연령"
              placeholderTextColor={COLORS.grayscale_400}
              keyboardType="numeric"
              value={formData?.recruitMaxAge?.toString()}
              onChangeText={text => handleNumericInput('recruitMaxAge', text)}
            />
          </View>
        </View>
      </View>
      <View>
        <Text style={styles.subsectionTitle}>우대조건</Text>
        <TextInput
          style={styles.textArea}
          placeholder="우대조건"
          placeholderTextColor={COLORS.grayscale_400}
          multiline={true}
          numberOfLines={4}
          value={formData.recruitCondition}
          onChangeText={text => handleInputChange('recruitCondition', text)}
        />
      </View>
      {datePicker.visible && (
        <DateTimePicker
          value={datePicker.value ?? new Date()}
          mode="date"
          display="default"
          onChange={(event, date) =>
            handleDateChange(event, date, datePicker.field)
          }
          on
        />
      )}
    </View>
  );
}
