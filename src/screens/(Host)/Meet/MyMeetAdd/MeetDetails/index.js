import React, {useEffect, useState, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import MeetDetailScheduleModal from '@components/modals/HostMy/Meet/AddMeet/MeetDetailScheduleModal';
import MeetFoodDrinkModal from '@components/modals/HostMy/Meet/AddMeet/MeetFoodDrinkModal';
import MeetUsageRulesModal from '@components/modals/HostMy/Meet/AddMeet/MeetUsageRulesModal';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';

import styles from './MeetDetails.styles';

const normalizeInitial = (v = {}) => ({
  detailSchedule: v?.detailSchedule ?? '',
  snackTagList: Array.isArray(v?.snackTagList) ? v.snackTagList : [],
  snacks: v?.snacks ?? '',
  rules: Array.isArray(v?.rules)
    ? v.rules
        .map(r => ({
          title: r?.title ?? '',
          content: r?.content ?? '',
        }))
        .filter(r => r.title.trim() !== '' || r.content.trim() !== '')
    : [],
});

const MeetDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {initialValues, onSelect} = route.params || {};

  const [party, setParty] = useState(normalizeInitial(initialValues));

  // 페이지 재진입 시에도 항상 최신 initialValues 반영
  useEffect(() => {
    setParty(normalizeInitial(initialValues));
  }, [initialValues]);

  // 모달 상태
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [foodVisible, setFoodVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);

  const isScheduleDone = useMemo(
    () => party.detailSchedule.trim().length > 0,
    [party.detailSchedule],
  );

  const isFoodDone = useMemo(() => {
    const hasTags = Array.isArray(party.snackTagList) && party.snackTagList.length > 0;
    const hasText = (party.snacks ?? '').trim().length > 0;
    return hasTags || hasText;
  }, [party.snackTagList, party.snacks]);

  const isRulesDone = useMemo(() => {
    const list = Array.isArray(party.rules) ? party.rules : [];
    return list.some(r => (r?.title ?? '').trim() || (r?.content ?? '').trim());
  }, [party.rules]);

  const isSubmitReady = isScheduleDone;

  const renderRightIcon = done =>
    done ? <CheckOrange width={24} height={24} /> : <ChevronRight width={24} height={24} />;

  const handleSubmit = () => {
    if (!isSubmitReady) {
      Toast.show({type: 'error', text1: '필수 항목을 입력해주세요.'});
      return;
    }

    try {
      onSelect?.({
        detailSchedule: party.detailSchedule,
        snackTagList: party.snackTagList,
        snacks: party.snacks,
        rules: party.rules,
      });
      Toast.show({type: 'success', text1: '상세 안내가 적용되었어요.'});
      navigation.goBack();
    } catch (e) {
      Toast.show({type: 'error', text1: '적용 중 오류가 발생했어요.'});
    }
  };

  return (
    <View style={styles.container}>
      <Header title="상세 안내" />

      <View style={styles.bodyContainer}>

        {/* 세부 일정 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setScheduleVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>
              세부 일정
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.explainText]}>*필수</Text>
          </View>
          {renderRightIcon(isScheduleDone)}
        </TouchableOpacity>

        {/* 음식·음료 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setFoodVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>음식·음료</Text>
          </View>
          {renderRightIcon(isFoodDone)}
        </TouchableOpacity>

        {/* 이용 규칙 */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => setRulesVisible(true)}>
          <View style={styles.titleRow}>
            <Text style={[FONTS.fs_14_medium, styles.title]}>이용 규칙</Text>
          </View>
          {renderRightIcon(isRulesDone)}
        </TouchableOpacity>

        <Text style={[FONTS.fs_12_medium, styles.explainText]}>
          필수 항목을 입력하셔야 등록이 완료됩니다.
        </Text>

      </View>

      <View style={styles.bottomContainer}>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Text style={[FONTS.fs_14_medium, styles.saveText]}>임시저장</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitReady && styles.submitButtonDisabled,
          ]}
          disabled={!isSubmitReady}
          onPress={handleSubmit}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.submitText,
              !isSubmitReady && styles.submitTextDisabled,
            ]}>
            적용하기
          </Text>
          {isSubmitReady ? (
            <CheckWhite width={24} height={24} />
          ) : (
            <CheckBlack width={24} height={24} />
          )}
        </TouchableOpacity>
      </View>

      {/* 세부 일정 모달 */}
      <MeetDetailScheduleModal
        visible={scheduleVisible}
        onClose={() => setScheduleVisible(false)}
        onSelect={({detailSchedule}) => {
          setParty(p => ({...p, detailSchedule}));
          setScheduleVisible(false);
        }}
        initialDetailSchedule={party.detailSchedule}
      />

      {/* 음식·음료 모달 */}
      <MeetFoodDrinkModal
        visible={foodVisible}
        onClose={() => setFoodVisible(false)}
        onSelect={({snackTagList, snacks}) => {
          setParty(p => ({
            ...p,
            snackTagList: Array.isArray(snackTagList) ? snackTagList : [],
            snacks: snacks ?? '',
          }));
          setFoodVisible(false);
        }}
        initialSnackTagList={party.snackTagList}
        initialSnacks={party.snacks}
      />

      {/* 이용 규칙 모달 */}
      <MeetUsageRulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
        onSelect={({rules}) => {
          setParty(p => ({
            ...p,
            rules: Array.isArray(rules) ? rules : [],
          }));
          setRulesVisible(false);
        }}
        initialRules={party.rules}
      />
    </View>
  );
};

export default MeetDetails;
