import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const TAGS = [
  {key: 'PARTY_FOOD', label: '음식 제공'},
  {key: 'PARTY_DRINK', label: '음료 제공'},
  {key: 'PARTY_SNACK', label: '간식 제공'},
  {key: 'PARTY_ALCOHOL', label: '주류 제공'},
  {key: 'PARTY_INDIVIDUAL', label: '각자 준비'},
  {key: 'PARTY_TOGETHER', label: '다함께 준비'},
  {key: 'PARTY_NO_SMOKE', label: '금연'},
];

const normalizeTags = v =>
  Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()) : [];

const MeetFoodDrinkModal = ({
  visible,
  onClose,
  onSelect,
  initialSnackTagList = [],
  initialSnacks = '',
}) => {
  const [selected, setSelected] = useState([]);
  const [snacks, setSnacks] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelected(normalizeTags(initialSnackTagList));
    setSnacks(typeof initialSnacks === 'string' ? initialSnacks : '');
  }, [visible, initialSnackTagList, initialSnacks]);

  const toggle = key => {
    setSelected(prev => (prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]));
  };

  const canApply = useMemo(() => selected.length > 0, [selected]);

  const handleConfirm = () => {
    if (!canApply) return;
    onSelect?.({
      snackTagList: normalizeTags(selected),
      snacks: snacks ?? '',
    });
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? -250 : 0}
            >
              <View style={styles.modalContainer}>
                <View style={styles.header}>
                  <Text style={[FONTS.fs_20_semibold, styles.title]}>음식·음료</Text>
                  <TouchableOpacity style={styles.XBtn} onPress={onClose}>
                    <XBtn width={24} height={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{flex: 1}} keyboardShouldPersistTaps="handled">
                  <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>음식·음료 제공 여부</Text>

                  <View style={styles.tagsGrid}>
                    {TAGS.map(t => {
                      const on = selected.includes(t.key);
                      return (
                        <TouchableOpacity
                          key={t.key}
                          activeOpacity={0.85}
                          style={[styles.tagItem, on && styles.tagItemOn]}
                          onPress={() => toggle(t.key)}>
                          <Text
                            style={[
                              on ? FONTS.fs_14_semibold : FONTS.fs_14_medium,
                              on ? styles.tagTextOn : styles.tagText,
                            ]}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {!canApply && (
                    <Text style={[FONTS.fs_12_medium, styles.errorText]}>
                      태그를 하나 이상 선택해 주세요
                    </Text>
                  )}

                  <View style={styles.titleContainer}>
                    <Text style={[FONTS.fs_16_medium, styles.sectionTitle, {marginTop: 20}]}>
                      제공량/준비량 관련 안내
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_12_light,
                        styles.countText,
                        {marginTop: 20},
                      ]}>
                      <Text style={[{color: COLORS.primary_orange}]}>
                        {snacks.length}
                      </Text>
                      /500
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <TextInput
                      value={snacks}
                      onChangeText={setSnacks}
                      placeholder="예) 맥주/과자 기본 제공, 포틀럭을 위해 자유롭게 준비해 주세요."
                      placeholderTextColor={COLORS.grayscale_400}
                      style={[FONTS.fs_14_regular, styles.textarea]}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={styles.rewriteButton}
                      onPress={() => setSnacks('')}>
                      <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>
                        다시쓰기
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <ButtonScarlet title="적용하기" onPress={handleConfirm} disabled={!canApply} style={{marginBottom: 16}} />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetFoodDrinkModal;

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: COLORS.modal_background, justifyContent: 'flex-end'},
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {alignItems: 'center', marginBottom: 16},
  title: {color: COLORS.grayscale_900},
  XBtn: {position: 'absolute', right: 0},
  sectionTitle: {color: COLORS.grayscale_900},
  hint: {color: COLORS.grayscale_500, marginTop: 6},

  tagsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
  },
  tagItem: {
    width: '48%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {color: COLORS.grayscale_400},
  tagTextOn: {color: COLORS.primary_orange},

  errorText: {
    marginTop: 8,
    color: COLORS.primary_orange,
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: COLORS.grayscale_400,
  },
  textarea: {
    minHeight: 160,
    maxHeight: 240,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    padding: 12,
    color: COLORS.grayscale_900,
    backgroundColor: COLORS.grayscale_0,
  },

  rewriteButton: {
    marginTop: 4,
    marginBottom: 40,
    alignSelf: 'flex-end',
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },
});
