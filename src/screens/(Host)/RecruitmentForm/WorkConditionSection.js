import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native';

import ButtonScarlet from '@components/ButtonScarlet';

import styles from './RecruitmentForm.styles';
import XBtn from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function WorkConditionSection({
  handleInputChange,
  formData,
  visible,
  onClose,
}) {
  const [workParts] = useState([
    {id: 1, title: '예약 관리'},
    {id: 2, title: '파티 보조'},
    {id: 3, title: '객실 청소'},
    {id: 4, title: '침구 정리 및 교체'},
    {id: 5, title: '욕실/화장실 청소'},
    {id: 6, title: '간단한 고객 응대'},
    {id: 7, title: '조식 준비 보조'},
    {id: 8, title: '비품 확인 및 정리'},
  ]);

  const [welfares] = useState([
    {id: 1, title: '무료 서핑 강습'},
    {id: 2, title: '숙식 제공'},
    {id: 3, title: '스탭 전용 숙소 제공'},
    {id: 4, title: '렌트카 제공'},
    {id: 5, title: '자전거 무료 대여'},
    {id: 6, title: '스쿠터 무료 대여'},
    {id: 7, title: '무료 숙박 제공'},
    {id: 8, title: 'BBQ 무제한 참여'},
  ]);

  const [workDurations] = useState([
    {id: 1, title: '2주 이상'},
    {id: 2, title: '3주 이상'},
    {id: 3, title: '한달 이상'},
    {id: 4, title: '2달 이상'},
  ]);

  const normalizeToObjList = val => {
    if (!Array.isArray(val)) return [];
    return val.map((t, idx) =>
      typeof t === 'string' ? {id: -1000 - idx, title: t} : t,
    );
  };
  const asTitles = arr =>
    (Array.isArray(arr) ? arr : [])
      .map(x => (typeof x === 'string' ? x : x.title))
      .filter(Boolean);
  const uniq = arr => Array.from(new Set(arr));

  const [selectedWorkParts, setSelectedWorkParts] = useState(
    normalizeToObjList(formData.workPart),
  );
  const [selectedWelfares, setSelectedWelfares] = useState(
    normalizeToObjList(formData.welfare),
  );
  const [selectedWorkDuration, setSelectedWorkDuration] = useState();
  const [workEtcText, setWorkEtcText] = useState('');
  const [welfareEtcText, setWelfareEtcText] = useState('');

  useEffect(() => {
    if (!visible) return; // 모달 열릴 때 반영
    if (formData.workDuration) {
      const found = workDurations.find(d => d.title === formData.workDuration);
      setSelectedWorkDuration(found ?? {id: -1, title: formData.workDuration});
    } else {
      setSelectedWorkDuration(undefined);
    }
  }, [visible, formData.workDuration]);

  useEffect(() => {
    setSelectedWorkParts(normalizeToObjList(formData.workPart));
  }, [visible, formData.workPart]);

  useEffect(() => {
    setSelectedWelfares(normalizeToObjList(formData.welfare));
  }, [visible, formData.welfare]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={recruitStyle.flex} enabled>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View />
              <Text style={recruitStyle.headerText}>근무 조건</Text>
              <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={recruitStyle.flex}
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled">
              {/* 근무형태 */}
              <View>
                <View style={styles.countRow}>
                  <Text style={styles.subsectionTitle}>근무 형태</Text>
                  <Text style={recruitStyle.lengthTextAll}>
                    <Text style={recruitStyle.lengthText}>
                      {formData?.workType?.length?.toLocaleString()}
                    </Text>
                    /50
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, recruitStyle.flex]}
                  placeholder="기타 입력"
                  placeholderTextColor={COLORS.grayscale_400}
                  multiline={true}
                  maxLength={50}
                  value={formData.workType}
                  onChangeText={text => {
                    handleInputChange('workType', text);
                  }}
                />
              </View>
              {/* 주요 업무 */}
              <View>
                <View style={[styles.countRow]}>
                  <Text style={styles.subsectionTitle}>주요 업무</Text>
                </View>
                <View style={styles.tagSelectRow}>
                  {workParts?.map(tag => {
                    const isSelected = selectedWorkParts?.some(
                      t => t.title === tag.title,
                    );
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedWorkParts(prev =>
                              prev.filter(t => t.title !== tag.title),
                            );
                          } else {
                            setSelectedWorkParts(prev => [...prev, tag]);
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
                  <TextInput
                    style={[styles.input, recruitStyle.otherInput]}
                    placeholder="기타 입력"
                    placeholderTextColor={COLORS.grayscale_400}
                    multiline={true}
                    maxLength={50}
                    value={workEtcText}
                    onChangeText={setWorkEtcText}
                  />
                </View>
              </View>
              {/* 근무 기간 */}
              <View>
                <Text style={styles.subsectionTitle}>근무 기간</Text>
                <View style={styles.tagSelectRow}>
                  {workDurations?.map(tag => {
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => {
                          setSelectedWorkDuration(tag);
                        }}
                        style={styles.tagOptionContainer}>
                        <Text
                          style={[
                            styles.tagOptionText,
                            FONTS.fs_14_medium,
                            selectedWorkDuration?.id === tag.id &&
                              styles.tagOptionSelectedText,
                            selectedWorkDuration?.id === tag.id &&
                              FONTS.fs_14_semibold,
                          ]}>
                          {tag.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 복지 */}
              <View>
                <Text style={styles.subsectionTitle}>복지</Text>
                <View style={styles.tagSelectRow}>
                  {welfares?.map(tag => {
                    const isSelected = selectedWelfares?.some(
                      t => t.title === tag.title,
                    );
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedWelfares(prev =>
                              prev.filter(t => t.title !== tag.title),
                            );
                          } else {
                            setSelectedWelfares(prev => [...prev, tag]);
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
                  <TextInput
                    style={[styles.input, recruitStyle.otherInput]}
                    placeholder="기타 입력"
                    placeholderTextColor={COLORS.grayscale_400}
                    multiline={true}
                    maxLength={50}
                    value={welfareEtcText}
                    onChangeText={setWelfareEtcText}
                  />
                </View>
              </View>
              <View style={recruitStyle.bottomContainer}>
                <ButtonScarlet
                  title={'적용하기'}
                  onPress={() => {
                    const workPartCombined = uniq([
                      ...asTitles(selectedWorkParts),
                      ...(workEtcText?.trim() ? [workEtcText.trim()] : []),
                    ]);
                    const welfareCombined = uniq([
                      ...asTitles(selectedWelfares),
                      ...(welfareEtcText?.trim()
                        ? [welfareEtcText.trim()]
                        : []),
                    ]);

                    handleInputChange('workPart', workPartCombined);
                    handleInputChange('welfare', welfareCombined);
                    handleInputChange(
                      'workDuration',
                      selectedWorkDuration?.title ?? '',
                    );

                    setTimeout(onClose, 0);
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const recruitStyle = StyleSheet.create({
  flex: {flex: 1},
  headerText: [FONTS.fs_20_semibold],
  innerContainer: {gap: 4},
  subtitle: {
    color: COLORS.grayscale_900,
    ...FONTS.fs_16_medium,
  },
  lengthTextAll: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  lengthText: {color: COLORS.primary_orange},
  rewriteText: {
    textAlign: 'right',
    color: COLORS.grayscale_500,
    ...FONTS.fs_12_medium,
  },
  tagText: {...FONTS.fs_14_medium, color: COLORS.primary_blue},
  bottomContainer: {marginVertical: 20},
  otherInput: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    marginHorizontal: 10,
    marginBottom: 10,
  },
});
