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
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex: 1}} enabled>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.overlay}>
            <View style={styles.container}>
              {/* 헤더 */}
              <View style={styles.header}>
                <View />
                <Text style={[FONTS.fs_20_semibold]}>근무 조건</Text>
                <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                  <XBtn width={24} height={24} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}>
                {/* 근무형태 */}
                <View>
                  <View style={[styles.countRow]}>
                    <Text style={styles.subsectionTitle}>근무 형태</Text>
                    <Text
                      style={{
                        ...FONTS.fs_12_medium,
                        color: COLORS.grayscale_400,
                        textAlign: 'right',
                      }}>
                      <Text style={{color: COLORS.primary_orange}}>
                        {formData?.workType?.length?.toLocaleString()}
                      </Text>
                      /50
                    </Text>
                  </View>
                  <TextInput
                    style={[styles.input, {flex: 1}]}
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
                        t => t.id === tag.id,
                      );
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedWorkParts(prev =>
                                prev.filter(t => t.id !== tag.id),
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
                      style={[
                        styles.input,
                        {
                          flex: 1,
                          backgroundColor: COLORS.grayscale_0,
                          marginHorizontal: 10,
                          marginBottom: 10,
                        },
                      ]}
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
                        t => t.id === tag.id,
                      );
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedWelfares(prev =>
                                prev.filter(t => t.id !== tag.id),
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
                      style={[
                        styles.input,
                        {
                          flex: 1,
                          backgroundColor: COLORS.grayscale_0,
                          marginHorizontal: 10,
                          marginBottom: 10,
                        },
                      ]}
                      placeholder="기타 입력"
                      placeholderTextColor={COLORS.grayscale_400}
                      multiline={true}
                      maxLength={50}
                      value={welfareEtcText}
                      onChangeText={setWelfareEtcText}
                    />
                  </View>
                </View>
                <View style={{marginVertical: 20}}>
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
                        selectedWorkDuration.title,
                      );
                      setTimeout(onClose, 0);
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
