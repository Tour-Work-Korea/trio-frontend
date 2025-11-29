import React, {useMemo, useState, useEffect} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styles from './RecruitmentForm.styles';
import Header from '@components/Header';

import CheckOrange from '@assets/images/check_orange.svg';
import CheckBlack from '@assets/images/check_black.svg';
import CheckWhite from '@assets/images/check_white.svg';
import ChevronBlack from '@assets/images/chevron_right_black.svg';
import {COLORS} from '@constants/colors';
import ErrorModal from '@components/modals/ErrorModal';
import postApi from '@utils/api/postApi';

import {CommonActions, useNavigation} from '@react-navigation/native';
import IntroSectionModal from './IntroSectionModal';
import TitleSectionModal from './TitleSectionModal';

const computeValidSections = formData => {
  const titleTextOk = (formData.title ?? '').trim().length >= 2;

  // 1) TitleSectionModal에서 올린 introImages
  const hasIntroImages = (formData.introImages ?? []).length > 0;

  // 2) 섹션 모달에서 올린 imgUrl들 (deriveImagesFromBlocks 대비)
  const hasSectionImages = (formData.introSections ?? []).some(b => {
    const i = (b.imgUrl ?? '').trim();
    return !!i;
  });

  const titleOk = titleTextOk && (hasIntroImages || hasSectionImages);

  const byType = type =>
    (formData.introSections ?? []).filter(s => s.sectionType === type);

  const isBlockValid = b => {
    const t = (b.title ?? '').trim();
    const c = (b.content ?? '').trim();
    const i = (b.imgUrl ?? '').trim();
    return !!(t || c || i); // 셋 중 하나라도 있으면 OK
  };

  const typeOk = type => {
    const blocks = byType(type).filter(isBlockValid);
    return blocks.length > 0;
  };

  return {
    title: titleOk,
    selfIntroduce: typeOk('GREETING'),
    spaceIntroduce: typeOk('SPACE'),
    life: typeOk('LIFE'),
  };
};

// ✅ images 없으면 섹션 이미지에서 자동 생성
const deriveImagesFromBlocks = introSections => {
  const urls = (introSections ?? []).map(b => b.imgUrl).filter(Boolean);
  const unique = Array.from(new Set(urls));
  if (!unique.length) return [];
  return unique.slice(0, 10).map((url, idx) => ({
    imgUrl: url,
    isThumbnail: idx === 0,
  }));
};

export default function MyGuesthouseIntroForm({route}) {
  const navigation = useNavigation();
  const guesthouseId = route.params?.guesthouseId; // 항상 존재한다고 가정

  const [mode, setMode] = useState('loading'); // 'loading' | 'create' | 'edit'

  const [modalVisible, setModalVisible] = useState({
    title: false,
    selfIntroduce: false,
    spaceIntroduce: false,
    life: false,
  });

  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    introSections: [],
    introImages: [],
  });

  const [valid, setValid] = useState({
    title: false,
    selfIntroduce: false,
    spaceIntroduce: false,
    life: false,
  });

  const isAllValid = useMemo(
    () => Object.values(valid).every(Boolean),
    [valid],
  );

  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '',
  });

  useEffect(() => {
    setValid(computeValidSections(formData));
  }, [formData]);

  // ✅ Upsert 모드 결정 + 기존 데이터 로드
  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const res = await postApi.getIntroDetailPublic(guesthouseId);
        const r = res.data;

        setMode('edit');
        setFormData(prev => ({
          ...prev,
          title: r.title ?? '',
          tags: r.tags ?? '',
          introSections: r.sections ?? [],
          introImages: r.images ?? [],
        }));
      } catch (e) {
        const status = e.response?.status;

        if (status === 404) {
          // 아직 소개글 없음 → create 모드
          setMode('create');
          setFormData(prev => ({
            ...prev,
            title: '',
            tags: '',
            introSections: [],
            introImages: [],
          }));
        } else {
          setMode('create'); // fallback
          setErrorModal({
            visible: true,
            title:
              e.response?.data?.message ||
              '소개글을 불러오는 중 오류가 발생했습니다.',
            buttonText: '확인',
          });
        }
      }
    };

    checkAndLoad();
  }, [guesthouseId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    // ✅ sectionId 제거
    const sanitizedSections = (formData.introSections ?? []).map(
      ({sectionId, ...rest}) => rest,
    );

    // ✅ imageId 제거
    const rawImages =
      formData.introImages?.length > 0
        ? formData.introImages
        : deriveImagesFromBlocks(formData.introSections);

    const sanitizedImages = (rawImages ?? []).map(({imageId, ...rest}) => rest);

    const payload = {
      title: formData.title.trim(),
      tags: formData.tags.trim(),
      sections: sanitizedSections,
      images: sanitizedImages,
    };

    if (!payload.images.length) {
      setErrorModal({
        visible: true,
        title: '이미지를 최소 1장 이상 추가해주세요.',
        buttonText: '확인',
      });
      return;
    }

    try {
      if (mode === 'create') {
        // ✅ POST 시에도 sectionId 없이 전송
        await postApi.createIntro(guesthouseId, payload);

        setErrorModal({
          visible: true,
          title: '소개글을 등록했습니다',
          buttonText: '확인',
        });

        navigation.replace('MyGuesthouseIntroList');
        return;
      }

      // ✅ edit 모드

      // (1) 제목/태그
      await postApi.updateIntroBasic(guesthouseId, {
        title: payload.title,
        tags: payload.tags,
      });

      // (2) 섹션 - sectionId 제거된 배열 사용
      await postApi.updateIntroSections(guesthouseId, payload.sections);

      // (3) 이미지
      await postApi.updateIntroImages(guesthouseId, payload.images);

      setErrorModal({
        visible: true,
        title: '소개글을 수정했습니다',
        buttonText: '확인',
      });

      navigation.replace('MyGuesthouseIntroList');
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.';
      setErrorModal({
        visible: true,
        title: serverMessage,
        buttonText: '확인',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.outContainer}>
          <Header
            title={
              mode === 'edit'
                ? '게스트하우스 소개글 수정'
                : '나의 게스트하우스 소개하기'
            }
          />

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 1) 제목 + 태그 */}
            <TouchableOpacity
              style={styles.sectionBox}
              onPress={() =>
                setModalVisible(prev => ({...prev, title: !prev.title}))
              }>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>소개 글 제목</Text>
                {valid.title ? (
                  <CheckOrange width={24} />
                ) : (
                  <ChevronBlack width={24} />
                )}
              </View>
              <Text style={styles.subtitleText}>
                사장님의 게스트하우스를 한 줄로 표현해보세요
              </Text>
            </TouchableOpacity>

            {/* 2) 사장님 자기소개 */}
            <TouchableOpacity
              style={styles.sectionBox}
              onPress={() =>
                setModalVisible(prev => ({
                  ...prev,
                  selfIntroduce: !prev.selfIntroduce,
                }))
              }>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>사장님 자기소개</Text>
                {valid.selfIntroduce ? (
                  <CheckOrange width={24} />
                ) : (
                  <ChevronBlack width={24} />
                )}
              </View>
              <Text style={styles.subtitleText}>
                사장님의 성격, 운영 계기 등을 자유롭게 작성해보세요
              </Text>
            </TouchableOpacity>

            {/* 3) 공간 소개 */}
            <TouchableOpacity
              style={styles.sectionBox}
              onPress={() =>
                setModalVisible(prev => ({
                  ...prev,
                  spaceIntroduce: !prev.spaceIntroduce,
                }))
              }>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>공간 소개</Text>
                {valid.spaceIntroduce ? (
                  <CheckOrange width={24} />
                ) : (
                  <ChevronBlack width={24} />
                )}
              </View>
              <Text style={styles.subtitleText}>
                게스트하우스의 특징과 매력을 담아 글을 작성해보세요
              </Text>
            </TouchableOpacity>

            {/* 4) 생활 */}
            <TouchableOpacity
              style={styles.sectionBox}
              onPress={() =>
                setModalVisible(prev => ({...prev, life: !prev.life}))
              }>
              <View style={styles.titleBox}>
                <Text style={styles.titleText}>생활</Text>
                {valid.life ? (
                  <CheckOrange width={24} />
                ) : (
                  <ChevronBlack width={24} />
                )}
              </View>
              <Text style={styles.subtitleText}>
                분위기, 주변 맛집, 놀거리 등 여행객이 기대할 생활을 적어주세요
              </Text>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
              모든 항목을 입력하셔야 {mode === 'edit' ? '수정' : '등록'}이
              완료됩니다
            </Text>

            <View style={[styles.buttonLocation, styles.buttonContainer]}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  isAllValid && {backgroundColor: COLORS.primary_orange},
                ]}
                disabled={!isAllValid}
                onPress={handleSubmit}
                accessibilityState={{disabled: !isAllValid}}>
                <Text
                  style={[
                    styles.addButtonText,
                    isAllValid && {color: COLORS.grayscale_0},
                  ]}>
                  {mode === 'edit' ? '수정하기' : '등록하기'}
                </Text>
                {!isAllValid ? (
                  <CheckBlack width={24} />
                ) : (
                  <CheckWhite width={24} />
                )}
              </TouchableOpacity>
            </View>

            {/* 제목/태그 모달 */}
            <TitleSectionModal
              visible={modalVisible.title}
              onClose={() => setModalVisible(prev => ({...prev, title: false}))}
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* GREETING 섹션 모달 */}
            <IntroSectionModal
              visible={modalVisible.selfIntroduce}
              onClose={() =>
                setModalVisible(prev => ({...prev, selfIntroduce: false}))
              }
              sectionType="GREETING"
              headerTitle="사장님 자기소개"
              headerSubtitle="이미지/제목/내용 중 하나만 있어도 괜찮아요!"
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* SPACE 섹션 모달 */}
            <IntroSectionModal
              visible={modalVisible.spaceIntroduce}
              onClose={() =>
                setModalVisible(prev => ({...prev, spaceIntroduce: false}))
              }
              sectionType="SPACE"
              headerTitle="공간 소개"
              headerSubtitle="이미지/제목/내용 중 하나만 있어도 괜찮아요!"
              formData={formData}
              handleInputChange={handleInputChange}
            />

            {/* LIFE 섹션 모달 */}
            <IntroSectionModal
              visible={modalVisible.life}
              onClose={() => setModalVisible(prev => ({...prev, life: false}))}
              sectionType="LIFE"
              headerTitle="생활"
              headerSubtitle="이미지/제목/내용 중 하나만 있어도 괜찮아요!"
              formData={formData}
              handleInputChange={handleInputChange}
            />

            <ErrorModal
              title={errorModal.title}
              visible={errorModal.visible}
              buttonText={errorModal.buttonText}
              onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
