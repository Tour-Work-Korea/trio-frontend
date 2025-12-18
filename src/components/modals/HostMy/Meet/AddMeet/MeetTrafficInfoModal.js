import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import PreviewIcon from '@assets/images/show_password.svg';
import BackIcon from '@assets/images/chevron_left_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const TITLE_MAX = 100;
const DESC_MAX = 5000;
const MAX_SECTIONS = 10;

const normalizeInitialTrafficInfo = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(x => ({
    title: typeof x?.title === 'string' ? x.title : '',
    content: typeof x?.content === 'string' ? x.content : '',
  }));

const denormalizeForPayload = (sections = []) =>
  sections.map(s => ({
    title: (s.title || '').trim(),
    content: (s.content || '').trim(),
  }));

const MeetTrafficInfoModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialTrafficInfo = [], // ✅ trafficInfo로 받기
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [preview, setPreview] = useState(false);

  const [sections, setSections] = useState([]);
  // 마지막 적용값(모달 내부 복원용)
  const [applied, setApplied] = useState(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 열릴 때 복원 로직
  useEffect(() => {
    if (!visible) return;

    setPreview(false);

    if (applied !== null) {
      setSections(applied);
      return;
    }

    const normalized = normalizeInitialTrafficInfo(initialTrafficInfo);
    const next = normalized.length ? normalized : [{title: '', content: ''}];

    setSections(prev => {
      const sameLen = prev.length === next.length;
      const same =
        sameLen &&
        prev.every(
          (p, i) => p.title === next[i].title && p.content === next[i].content,
        );
      return same ? prev : next;
    });
  }, [visible, initialTrafficInfo, applied]);

  const resetToInitial = () => {
    const normalized = normalizeInitialTrafficInfo(initialTrafficInfo);
    setSections(normalized.length ? normalized : [{title: '', content: ''}]);
    setPreview(false);
  };

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (applied !== null) setSections(applied);
      else resetToInitial();
      setPreview(false);
    }
    onClose?.();
  };

  // 섹션 조작
  const addSection = () => {
    if (sections.length >= MAX_SECTIONS) return;
    setSections(prev => [...prev, {title: '', content: ''}]);
  };

  const removeSection = idx => {
    setSections(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{title: '', content: ''}];
    });
  };

  const setField = (idx, key, value) => {
    setSections(prev =>
      prev.map((s, i) => (i === idx ? {...s, [key]: value} : s)),
    );
  };

  // ✅ 유효성: 둘 다 비면 OK, 하나만 있으면 NO
  const allValid = useMemo(
    () =>
      sections.every(s => {
        const t = (s.title || '').trim();
        const c = (s.content || '').trim();
        if (!t && !c) return true;
        return !!t && !!c;
      }),
    [sections],
  );

  const buildPayloadTrafficInfo = (sections = []) =>
    denormalizeForPayload(sections)
      .filter(x => x.title.length > 0 || x.content.length > 0) // 완전 빈 단락 제거
      .filter(x => x.title.length > 0 && x.content.length > 0); // 한쪽만 채운 것 제거

  // 적용
  const handleConfirm = () => {
    const payload = buildPayloadTrafficInfo(sections);

    setApplied(sections);
    onSelect?.({
      trafficInfo: payload.length ? payload : undefined,
    });

    onClose?.();
  };

  const HeaderBar = () => (
    <View style={styles.header}>
      <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>교통 정보</Text>

      <View style={styles.headerRight}>
        {!preview ? (
          <TouchableOpacity
            onPress={() => setPreview(true)}
            style={[styles.iconBtn, {marginRight: 8}]}>
            <PreviewIcon width={22} height={22} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setPreview(false)}
            style={[styles.iconBtn, {marginRight: 8}]}>
            <BackIcon width={22} height={22} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleModalClose}>
          <XBtn width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 0}>
        <TouchableWithoutFeedback
          onPress={() => (isKeyboardVisible ? Keyboard.dismiss() : handleModalClose())}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <HeaderBar />

                {!preview ? (
                  <ScrollView
                    style={styles.body}
                    keyboardShouldPersistTaps="handled">
                    {/* 상단 설명 + 추가 버튼 */}
                    <View style={styles.topRow}>
                      <Text style={[FONTS.fs_14_semibold, {color: COLORS.grayscale_800}]}>
                        참여자를 위한 교통 관련 안내 글을 작성해 주세요
                      </Text>

                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400, marginRight: 8}]}>
                          {sections.length}/{MAX_SECTIONS}
                        </Text>
                        <TouchableOpacity onPress={addSection} style={styles.circleBtn}>
                          <PlusIcon width={20} height={20} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{paddingBottom: 120}}>
                      {sections.map((s, idx) => {
                        const titleLen = (s.title || '').length;
                        const descLen = (s.content || '').length;

                        return (
                          <View key={`sec-${idx}`} style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                              <Text style={[FONTS.fs_14_semibold, {color: COLORS.grayscale_700}]}>
                                교통 정보 {idx + 1}
                              </Text>

                              <TouchableOpacity
                                onPress={() => removeSection(idx)}
                                style={styles.circleBtnSmall}>
                                <MinusIcon width={20} height={20} />
                              </TouchableOpacity>
                            </View>

                            {/* 제목 */}
                            <View style={styles.rowBetween}>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_500}]}>
                                제목
                              </Text>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
                                {titleLen}/{TITLE_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.title}
                              onChangeText={t =>
                                setField(idx, 'title', t.slice(0, TITLE_MAX))
                              }
                              placeholder="예) 지하철 이용 시"
                              placeholderTextColor={COLORS.grayscale_400}
                              style={[FONTS.fs_14_regular, styles.textInput]}
                              maxLength={TITLE_MAX}
                              returnKeyType="done"
                            />

                            {/* 내용 */}
                            <View style={[styles.rowBetween, {marginTop: 12}]}>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_500}]}>
                                내용
                              </Text>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
                                {descLen}/{DESC_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.content}
                              onChangeText={t =>
                                setField(idx, 'content', t.slice(0, DESC_MAX))
                              }
                              placeholder="예) 2호선 강남역 1번 출구에서 도보 5분 거리입니다."
                              placeholderTextColor={COLORS.grayscale_400}
                              style={[FONTS.fs_14_regular, styles.textArea]}
                              multiline
                              maxLength={DESC_MAX}
                              textAlignVertical="top"
                            />
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                ) : (
                  // 미리보기
                  <ScrollView style={styles.previewBody}>
                    <View style={{paddingBottom: 120}}>
                      {sections.map((s, idx) => (
                        <View key={`pv-${idx}`} style={styles.previewCard}>
                          <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_500, marginBottom: 8}]}>
                            교통 정보 {idx + 1}
                          </Text>

                          {!!(s.title || '').trim() && (
                            <Text style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_900}]}>
                              {(s.title || '').trim()}
                            </Text>
                          )}

                          {!!(s.content || '').trim() && (
                            <Text
                              style={[
                                FONTS.fs_14_regular,
                                {color: COLORS.grayscale_700, marginTop: 8, lineHeight: 22},
                              ]}>
                              {(s.content || '').trim()}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {/* 적용하기 버튼 */}
                <ButtonScarlet
                  title={'적용하기'}
                  onPress={handleConfirm}
                  disabled={!allValid}
                  style={{marginBottom: 16}}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MeetTrafficInfoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  headerRight: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_100,
  },

  body: {flex: 1},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textInput: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },
  textArea: {
    marginTop: 6,
    padding: 12,
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },

  previewBody: {flex: 1},
  previewCard: {
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },

  circleBtn: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnSmall: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
