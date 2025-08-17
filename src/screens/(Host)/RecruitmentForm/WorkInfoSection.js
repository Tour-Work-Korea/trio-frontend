import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import styles from './RecruitmentForm';
import Gray_ImageAdd from '@assets/images/add_image_gray.svg';
import XBtn from '@assets/images/x_gray.svg';
import {uploadMultiImage} from '@utils/imageUploadHandler';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
export default function WorkInfoSection({
  formData,
  visible,
  onClose,
  handleInputChange,
}) {
  const limitImage = 6;

  const pickImage = async () => {
    const limit = limitImage - (formData?.recruitImage?.length ?? 0);
    if (limit <= 0) {
      Alert.alert('사진 제한', `최대 ${limitImage}장까지 등록 가능합니다.`);
      return;
    }

    const uploadedUrls = await uploadMultiImage(limit);
    if (!uploadedUrls?.length) return;

    const baseLen = formData.recruitImage.length;
    const newImages = uploadedUrls.map((url, idx) => ({
      recruitImageUrl: url,
      isThumbnail: baseLen === 0 && idx === 0,
    }));

    handleInputChange('recruitImage', [...formData.recruitImage, ...newImages]);
  };

  const removePhoto = index => {
    const next = formData.recruitImage.filter((_, i) => i !== index);

    // 썸네일 없으면 첫 번째 이미지에 isThumbnail 부여
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
            <Text style={[FONTS.fs_20_semibold]}>근무지 정보</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.dateRow}>
              <Text style={styles.subsectionTitle}>
                근무지 사진을 추가해주세요
              </Text>
              <Text style={{...FONTS.fs_12_light, color: COLORS.grayscale_500}}>
                <Text style={{color: COLORS.primary_orange}}>
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
                    onLoad={() =>
                      console.log('IMG loaded', imageObj.recruitImageUrl)
                    }
                    onError={e =>
                      console.log(
                        'IMG error',
                        imageObj.recruitImageUrl,
                        e?.nativeEvent,
                      )
                    }
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
      </View>
    </Modal>
  );
}
