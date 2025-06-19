import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from '../PostRecruitment.styles';
import Calendar from '@assets/images/Calendar.svg';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function RecruitConditionSection({handleInputChange, formData}) {
  const [showRecruitStart, setShowRecruitStart] = useState(false);
  const [showRecruitEnd, setShowRecruitEnd] = useState(false);
  const [showWorkStartDate, setShowWorkStartDate] = useState(false);
  const [showWorkEndDate, setShowWorkEndDate] = useState(false);

  const handleDateChange = (event, selectedDate, dateField) => {
    const currentDate = selectedDate || formData[dateField];

    if (dateField === 'recruitStart') {
      setShowRecruitStart(false);
    }
    if (dateField === 'recruitEnd') {
      setShowRecruitEnd(false);
    }
    if (dateField === 'workStartDate') {
      setShowWorkStartDate(false);
    }
    if (dateField === 'workEndDate') {
      setShowWorkEndDate(false);
    }

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
            onPress={() => setShowRecruitStart(true)}>
            <Text style={styles.dateLabel}>
              {formData.recruitStart
                ? new Date(formData.recruitStart).toLocaleDateString('ko-KR')
                : '시작일자'}
            </Text>
            <Calendar />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowRecruitEnd(true)}>
            <Text style={styles.dateLabel}>
              {formData.recruitEnd
                ? new Date(formData.recruitEnd).toLocaleDateString('ko-KR')
                : '마감일자'}
            </Text>
            <Calendar />
          </TouchableOpacity>
        </View>
        {showRecruitStart && (
          <DateTimePicker
            value={formData.recruitStart ?? new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, 'recruitStart')
            }
          />
        )}
        {showRecruitEnd && (
          <DateTimePicker
            value={formData.recruitEnd ?? new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, 'recruitEnd')
            }
          />
        )}
      </View>

      {/* 근무기간 */}
      <View>
        <Text style={styles.subsectionTitle}>근무기간</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowWorkStartDate(true)}>
            <Text style={styles.dateLabel}>
              {formData.workStartDate
                ? new Date(formData.workStartDate).toLocaleDateString('ko-KR')
                : '근무 시작일'}
            </Text>
            <Calendar />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowWorkEndDate(true)}>
            <Text style={styles.dateLabel}>
              {formData.workEndDate
                ? new Date(formData.workEndDate).toLocaleDateString('ko-KR')
                : '근무 종료일'}
            </Text>
            <Calendar />
          </TouchableOpacity>
        </View>

        {showWorkStartDate && (
          <DateTimePicker
            value={formData.workStartDate ?? new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, 'workStartDate')
            }
          />
        )}

        {showWorkEndDate && (
          <DateTimePicker
            value={formData.workEndDate ?? new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, 'workEndDate')
            }
          />
        )}
      </View>

      {/* 모집인원 */}
      <View>
        <Text style={styles.subsectionTitle}>모집 인원</Text>
        <View style={styles.countRow}>
          <View style={styles.countItem}>
            <Text style={styles.countLabel}>여자</Text>
            <TextInput
              style={styles.countInput}
              placeholder="명"
              keyboardType="numeric"
              value={formData.recruitNumberFemale.toString()}
              onChangeText={text =>
                handleNumericInput('recruitNumberFemale', text)
              }
            />
          </View>

          <View style={styles.countItem}>
            <Text style={styles.countLabel}>남자</Text>
            <TextInput
              style={styles.countInput}
              placeholder="명"
              keyboardType="numeric"
              value={formData.recruitNumberMale.toString()}
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
            <Text style={styles.ageLabel}>최소 연령</Text>
            <TextInput
              style={styles.ageInput}
              placeholder="최소 연령"
              keyboardType="numeric"
              value={formData.recruitMinAge.toString()}
              onChangeText={text => handleNumericInput('recruitMinAge', text)}
            />
          </View>

          <View style={styles.ageItem}>
            <Text style={styles.ageLabel}>최대 연령</Text>
            <TextInput
              style={styles.ageInput}
              placeholder="최대 연령"
              keyboardType="numeric"
              value={formData.recruitMaxAge.toString()}
              onChangeText={text => handleNumericInput('recruitMaxAge', text)}
            />
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.textArea}
          placeholder="우대조건"
          multiline={true}
          numberOfLines={4}
          value={formData.recruitCondition}
          onChangeText={text => handleInputChange('recruitCondition', text)}
        />
      </View>
    </View>
  );
}
