import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';

import {uploadMultiImage} from '@utils/imageUploadHandler';
import ErrorModal from '@components/modals/ErrorModal';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Gray_ImageAdd from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import styles from './RecruitmentForm';
import {useState} from 'react';

export default function WorkInfoSection({
  formData,
  visible,
  onClose,
  handleInputChange,
}) {
  const limitImage = 6;
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  const pickImage = async () => {
    const limit = limitImage - (formData?.recruitImage?.length ?? 0);
    if (limit <= 0) {
      setErrorModal({
        visible: true,
        title: `최대 ${limitImage}장까지 등록 가능합니다.`,
      });
      return;
    }

    const uploadedUrls = await uploadMultiImage(limit);
    if (!uploadedUrls?.length) {
      return;
    }

    const baseLen = formData.recruitImage.length;
    const newImages = uploadedUrls.map((url, idx) => ({
      recruitImageUrl: url,
      isThumbnail: baseLen === 0 && idx === 0,
    }));

    handleInputChange('recruitImage', [...formData.recruitImage, ...newImages]);
  };

  const removePhoto = index => {
    const next = formData.recruitImage.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some(img => img.isThumbnail)) {
      next[0] = {...next[0], isThumbnail: true};
    }

    handleInputChange('recruitImage', next);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View />
            <Text style={recruitStyle.headerText}>근무지 정보</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.dateRow}>
              <Text style={styles.subsectionTitle}>
                근무지 사진을 추가해주세요
              </Text>
              <Text style={recruitStyle.lengthTextAll}>
                <Text style={recruitStyle.lengthText}>
                  {limitImage - formData.recruitImage.length}
                </Text>
                /{limitImage}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={pickImage}
              disabled={formData?.recruitImage?.length === limitImage}>
              <Gray_ImageAdd width={30} height={30} />
            </TouchableOpacity>
            <View style={styles.photoGrid}>
              {formData.recruitImage.map((imageObj, index) => (
                <View key={index} style={[styles.photoItem]}>
                  <Image
                    source={{uri: imageObj.recruitImageUrl}}
                    style={[
                      styles.addPhotoButton,
                      imageObj.isThumbnail ? styles.thumbnail : '',
                    ]}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}>
                    <XBtn width={14} height={14} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={'확인'}
          onPress={() => setErrorModal({visible: false, title: ''})}
        />
      </View>
    </Modal>
  );
}

const recruitStyle = StyleSheet.create({
  headerText: [FONTS.fs_20_semibold],

  lengthTextAll: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  lengthText: {color: COLORS.primary_orange},
});
