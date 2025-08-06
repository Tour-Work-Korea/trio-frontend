import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import styles from './RecruitmentForm';
import Gray_ImageAdd from '@assets/images/Gray_ImageAdd.svg';
import XBtn from '@assets/images/x_gray.svg';
import {uploadMultiImage} from '@utils/imageUploadHandler';
export default function WorkInfoSection({
  formData,
  setFormData,
  handleInputChange,
}) {
  const limitImage = 6;

  const pickImage = async () => {
    const limit = limitImage - formData.recruitImage.length;
    if (limit <= 0) {
      Alert.alert('사진 제한', `최대 ${limitImage}장까지 등록 가능합니다.`);
      return;
    }

    const uploadedUrls = await uploadMultiImage(limit);
    if (!uploadedUrls || uploadedUrls.length === 0) return;

    const newImages = uploadedUrls.map((url, idx) => ({
      recruitImageUrl: url,
      isThumbnail: formData.recruitImage.length === 0 && idx === 0,
    }));

    setFormData({
      ...formData,
      recruitImage: [...formData.recruitImage, ...newImages],
    });
  };

  const removePhoto = index => {
    const newImage = [...formData.recruitImage];
    newImage.splice(index, 1);

    // 썸네일이었던 이미지를 삭제한 경우, 첫 번째 이미지를 썸네일로 설정
    if (newImage.length > 0 && index === 0) {
      newImage[0].isThumbnail = true;
    }

    setFormData({
      ...formData,
      recruitImage: newImage,
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>근무지 정보</Text>
      <View style={styles.divider} />

      <View style={styles.formGroup}>
        <View>
          <Text style={styles.subsectionTitle}>근무지 주소</Text>
          <TextInput
            style={styles.input}
            placeholder="근무지역을 입력해주세요"
            value={formData.location}
            onChangeText={text => handleInputChange('location', text)}
          />
        </View>

        <View>
          <Text style={styles.subsectionTitle}>근무지 사진</Text>
          <Text style={styles.description}>
            게스트하우스 및 객실 사진을 추가해주세요.
          </Text>

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
                  <XBtn width={12} />
                </TouchableOpacity>
              </View>
            ))}

            {formData.recruitImage.length < limitImage && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}>
                <Gray_ImageAdd />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
