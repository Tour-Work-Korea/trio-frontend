import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import styles from './RecruitmentForm';

import XBtn from '@assets/images/x_gray.svg';
import Plus from '@assets/images/plus_gray.svg';
import Minus from '@assets/images/minus_gray.svg';
import Calendar from '@assets/images/calendar_gray.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import DatePicker from '@components/Employ/DatePicker';
import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';
import ButtonScarlet from '@components/ButtonScarlet';

export default function RecruitConditionSection({
  handleInputChange,
  formData,
  visible,
  onClose,
}) {
  const [showRecruitCalendar, setShowRecruitCalendar] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState('');
  const [showEntryCalendar, setShowEntryCalendar] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState('');
  const [showWorkStartDate, setShowWorkStartDate] = useState(false);
  const tags = [
    {id: 1, title: '외국어 능력자'},
    {id: 2, title: '서비스업 경험자'},
    {id: 3, title: '이벤트 기획 경험자'},
    {id: 4, title: '즉시입도 가능자'},
    {id: 5, title: 'SNS 운영 경험자'},
    {id: 6, title: '운전 가능자'},
  ];
  const [selectedTags, setSelectedTags] = useState(formData.recruitCondition);
  const [etcText, setEtcText] = useState('');

  const isSelectedEtc = selectedTags?.some(t => t.id === 7);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex: 1}} enabled>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.overlay}>
            <View style={styles.container}>
              {/* 헤더 */}
              <View style={styles.header}>
                <View />
                <Text style={[FONTS.fs_20_semibold]}>모집 조건</Text>
                <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                  <XBtn width={24} height={24} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}>
                {/* 모집 기간 */}
                <View>
                  <Text style={styles.subsectionTitle}>모집기간</Text>
                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => {
                        if (selectedRecruit === 'recruitStart') {
                          setShowRecruitCalendar(!showRecruitCalendar);
                        } else {
                          setShowRecruitCalendar(true);
                          setSelectedRecruit('recruitStart');
                        }
                      }}>
                      <Text
                        style={[
                          styles.dateLabel,
                          formData.recruitStart
                            ? ''
                            : {color: COLORS.grayscale_400},
                        ]}>
                        {formData.recruitStart
                          ? new Date(formData.recruitStart).toLocaleDateString(
                              'ko-KR',
                            )
                          : '시작일자'}
                      </Text>
                      <Calendar />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => {
                        if (selectedRecruit === 'recruitEnd') {
                          setShowRecruitCalendar(!showRecruitCalendar);
                        } else {
                          setShowRecruitCalendar(true);
                          setSelectedRecruit('recruitEnd');
                        }
                      }}>
                      <Text
                        style={[
                          styles.dateLabel,
                          formData.recruitEnd
                            ? ''
                            : {color: COLORS.grayscale_400},
                        ]}>
                        {formData.recruitEnd
                          ? new Date(formData.recruitEnd).toLocaleDateString(
                              'ko-KR',
                            )
                          : '마감일자'}
                      </Text>
                      <Calendar />
                    </TouchableOpacity>
                  </View>
                  {showRecruitCalendar && (
                    <DatePicker
                      value={formData.recruitStart ?? new Date()}
                      onChange={date => {
                        setShowRecruitCalendar(false);
                        if (date) handleInputChange(selectedRecruit, date);
                      }}
                    />
                  )}
                </View>
                {/* 모집인원 */}
                <View>
                  <Text style={styles.subsectionTitle}>모집 인원</Text>
                  <View style={styles.detailContainer}>
                    <View style={styles.countRow}>
                      <Text style={styles.countLabel}>여자</Text>
                      <View style={styles.countInputContainer}>
                        <TouchableOpacity
                          style={styles.buttonPlMi}
                          onPress={() =>
                            handleInputChange(
                              'recruitNumberFemale',
                              formData.recruitNumberFemale - 1,
                            )
                          }>
                          <Minus width={24} />
                        </TouchableOpacity>

                        <TextInput
                          style={[
                            styles.input,
                            {width: 48, height: 44, textAlign: 'center'},
                          ]}
                          value={String(formData.recruitNumberFemale)}
                          keyboardType="number-pad"
                          onChangeText={text =>
                            handleInputChange('recruitNumberFemale', text)
                          }
                        />

                        <TouchableOpacity
                          onPress={() =>
                            handleInputChange(
                              'recruitNumberFemale',
                              formData.recruitNumberFemale + 1,
                            )
                          }>
                          <Plus width={24} style={styles.buttonPlMi} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.countRow}>
                      <Text style={styles.countLabel}>남자</Text>
                      <View style={styles.countInputContainer}>
                        <TouchableOpacity
                          style={styles.buttonPlMi}
                          onPress={() =>
                            handleInputChange(
                              'recruitNumberMale',
                              formData.recruitNumberMale - 1,
                            )
                          }>
                          <Minus width={24} />
                        </TouchableOpacity>

                        <TextInput
                          style={[
                            styles.input,
                            {width: 48, height: 44, textAlign: 'center'},
                          ]}
                          value={String(formData.recruitNumberMale)}
                          keyboardType="number-pad"
                          onChangeText={text =>
                            handleInputChange('recruitNumberMale', text)
                          }
                        />

                        <TouchableOpacity
                          onPress={() =>
                            handleInputChange(
                              'recruitNumberMale',
                              formData.recruitNumberMale + 1,
                            )
                          }>
                          <Plus width={24} style={styles.buttonPlMi} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                {/* 나이 */}
                <View>
                  <Text style={styles.subsectionTitle}>나이</Text>
                  <View style={styles.detailContainer}>
                    <View style={styles.countRow}>
                      <Text style={styles.countLabel}>최소</Text>
                      <View style={styles.countInputContainer}>
                        <TouchableOpacity
                          style={styles.buttonPlMi}
                          onPress={() =>
                            handleInputChange(
                              'recruitMinAge',
                              formData.recruitMinAge - 1,
                            )
                          }>
                          <Minus width={24} />
                        </TouchableOpacity>

                        <TextInput
                          style={[
                            styles.input,
                            {width: 48, height: 44, textAlign: 'center'},
                          ]}
                          value={String(formData.recruitMinAge)}
                          keyboardType="number-pad"
                          onChangeText={text =>
                            handleInputChange('recruitMinAge', text)
                          }
                        />

                        <TouchableOpacity
                          onPress={() =>
                            handleInputChange(
                              'recruitMinAge',
                              formData.recruitMinAge + 1,
                            )
                          }>
                          <Plus width={24} style={styles.buttonPlMi} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.countRow}>
                      <Text style={styles.countLabel}>최대</Text>
                      <View style={styles.countInputContainer}>
                        <TouchableOpacity
                          style={styles.buttonPlMi}
                          onPress={() =>
                            handleInputChange(
                              'recruitMaxAge',
                              formData.recruitMaxAge - 1,
                            )
                          }>
                          <Minus width={24} />
                        </TouchableOpacity>

                        <TextInput
                          style={[
                            styles.input,
                            {width: 48, height: 44, textAlign: 'center'},
                          ]}
                          keyboardType="number-pad"
                          value={String(formData.recruitMaxAge)}
                          onChangeText={text =>
                            handleInputChange('recruitMaxAge', text)
                          }
                        />

                        <TouchableOpacity
                          onPress={() =>
                            handleInputChange(
                              'recruitMaxAge',
                              formData.recruitMaxAge + 1,
                            )
                          }>
                          <Plus width={24} style={styles.buttonPlMi} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                {/* 입도기간 */}
                <View>
                  <Text style={styles.subsectionTitle}>입도기간</Text>
                  <View style={styles.dateRow}>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => {
                        if (selectedEntry === 'entryStartDate') {
                          setShowEntryCalendar(!showEntryCalendar);
                        } else {
                          setShowEntryCalendar(true);
                          setSelectedEntry('entryStartDate');
                        }
                      }}>
                      <Text
                        style={[
                          styles.dateLabel,
                          formData.entryStartDate
                            ? ''
                            : {color: COLORS.grayscale_400},
                        ]}>
                        {formData.entryStartDate
                          ? new Date(
                              formData.entryStartDate,
                            ).toLocaleDateString('ko-KR')
                          : '시작일자'}
                      </Text>
                      <Calendar />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => {
                        if (selectedEntry === 'entryEndDate') {
                          setShowEntryCalendar(!showEntryCalendar);
                        } else {
                          setShowEntryCalendar(true);
                          setSelectedEntry('entryEndDate');
                        }
                      }}>
                      <Text
                        style={[
                          styles.dateLabel,
                          formData.entryEndDate
                            ? ''
                            : {color: COLORS.grayscale_400},
                        ]}>
                        {formData.entryEndDate
                          ? new Date(formData.entryEndDate).toLocaleDateString(
                              'ko-KR',
                            )
                          : '마감일자'}
                      </Text>
                      <Calendar />
                    </TouchableOpacity>
                  </View>
                  {showEntryCalendar && (
                    <DatePicker
                      value={formData.entryStartDate ?? new Date()}
                      onChange={date => {
                        setShowEntryCalendar(false);
                        if (date) handleInputChange(selectedEntry, date);
                      }}
                    />
                  )}
                </View>
                {/* 우대조건 */}
                <View>
                  <Text style={styles.subsectionTitle}>우대조건</Text>
                  <View style={styles.tagSelectRow}>
                    {tags?.map(tag => {
                      const isSelected = selectedTags?.some(
                        t => t.id === tag.id,
                      );
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedTags(prev =>
                                prev.filter(t => t.id !== tag.id),
                              );
                            } else {
                              setSelectedTags(prev => [...prev, tag]);
                            }
                          }}
                          style={styles.tagOptionContainer}>
                          <Text
                            style={[
                              styles.tagOptionText,
                              FONTS.fs_14_medium,
                              isSelected && styles.tagOptionSelectedText,
                              isSelected && FONTS.fs_14_semibold,
                            ]}>
                            {tag.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.dateRow}>
                    <TextInput
                      style={[styles.input, {flex: 1, marginTop: 12}]}
                      placeholder="기타 입력"
                      placeholderTextColor={COLORS.grayscale_400}
                      multiline={true}
                      value={etcText}
                      onChangeText={text => {
                        setEtcText(text);
                        setSelectedTags(prev =>
                          prev.map(t => (t.id === 7 ? {...t, title: text} : t)),
                        );
                      }}
                      editable={isSelectedEtc}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        if (isSelectedEtc) {
                          setSelectedTags(prev => prev.filter(t => t.id !== 7));
                        } else {
                          setSelectedTags(prev => [
                            ...prev,
                            {id: 7, title: etcText},
                          ]);
                        }
                      }}>
                      {selectedTags?.some(t => t.id === 7) ? (
                        <EnabledRadioButton width={28} />
                      ) : (
                        <DisabledRadioButton width={28} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{marginVertical: 20}}>
                  <ButtonScarlet
                    title={'적용하기'}
                    onPress={() => {
                      handleInputChange('recruitCondition', selectedTags);
                      onClose();
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
