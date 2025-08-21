import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import styles from './RecruitmentForm';

import ButtonScarlet from '@components/ButtonScarlet';
import XBtn from '@assets/images/x_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import hostEmployApi from '@utils/api/hostEmployApi';
import ErrorModal from '@components/modals/ErrorModal';

const ShortDescriptionModal = ({
  handleInputChange,
  formData,
  visible,
  onClose,
}) => {
  const [shortDescription, setShortDescription] = useState(
    formData.recruitShortDescription,
  );
  const [tags, setTags] = useState();
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  useEffect(() => {
    fetchHostHashtags();
  }, []);

  const fetchHostHashtags = async () => {
    try {
      const response = await hostEmployApi.getHostHashtags();
      setTags(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        title: error?.response?.data?.message || '해시태그 조회에 실패했습니다',
      });
    }
  };

  const handleTagToggle = (tagId, isSelected) => {
    if (!isSelected && formData.hashtags.length >= 3) {
      setErrorModal({
        visible: true,
        title: '해시태그는 최대 3개까지 선택가능해요',
      });
      return;
    }

    const updatedHashtags = isSelected
      ? formData.hashtags.filter(hashtagId => hashtagId !== tagId)
      : [...formData.hashtags, tagId];

    handleInputChange('hashtags', updatedHashtags);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{flex: 1}} enabled>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.overlay}>
            <View style={styles.container}>
              {/* 헤더 */}
              <View style={styles.header}>
                <View />
                <Text style={[FONTS.fs_20_semibold]}>공고 요약</Text>
                <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                  <XBtn width={24} height={24} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}>
                <View style={{gap: 4}}>
                  <Text
                    style={{
                      color: COLORS.grayscale_900,
                      ...FONTS.fs_16_medium,
                    }}>
                    간략하게 들어갈 공고 소개를 작성해주세요
                  </Text>
                  <Text
                    style={{
                      ...FONTS.fs_12_medium,
                      color: COLORS.grayscale_400,
                      textAlign: 'right',
                    }}>
                    <Text style={{color: COLORS.primary_orange}}>
                      {shortDescription?.length?.toLocaleString()}
                    </Text>
                    /1,000
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="성실함과 책임감을 가지고 모든 일에 임하는 사람을 구해요."
                    placeholderTextColor={COLORS.grayscale_400}
                    multiline={true}
                    maxLength={1000}
                    value={shortDescription}
                    onChangeText={setShortDescription}
                  />
                  <TouchableOpacity onPress={() => setShortDescription('')}>
                    <Text
                      style={{
                        textAlign: 'right',
                        color: COLORS.grayscale_500,
                        ...FONTS.fs_12_medium,
                      }}>
                      다시쓰기
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{gap: 4}}>
                  <Text
                    style={{
                      color: COLORS.grayscale_900,
                      ...FONTS.fs_16_medium,
                    }}>
                    태그
                  </Text>

                  <Text
                    style={{...FONTS.fs_14_medium, color: COLORS.primary_blue}}>
                    태그로 공고를 눈에 띄게 나타내보세요! (최대 3개)
                  </Text>

                  <View style={styles.tagSelectRow}>
                    {tags?.map(tag => {
                      const isSelected = formData.hashtags?.includes(tag.id);
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          style={styles.tagOptionContainer}
                          onPress={() => handleTagToggle(tag.id, isSelected)}>
                          <Text
                            style={[
                              styles.tagOptionText,
                              FONTS.fs_14_medium,
                              isSelected && styles.tagOptionSelectedText,
                              isSelected && FONTS.fs_14_semibold,
                            ]}>
                            {tag.hashtag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* 하단 버튼 */}
              <View style={{marginVertical: 20}}>
                <ButtonScarlet
                  title="적용하기"
                  onPress={() => {
                    handleInputChange(
                      'recruitShortDescription',
                      shortDescription,
                    );
                    onClose();
                  }}
                />
              </View>
            </View>
            <ErrorModal
              visible={errorModal.visible}
              title={errorModal.title}
              buttonText={'확인'}
              onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ShortDescriptionModal;
