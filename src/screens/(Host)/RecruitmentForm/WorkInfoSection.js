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
import {launchImageLibrary} from 'react-native-image-picker';
import XBtn from '@assets/images/x_gray.svg';

export default function WorkInfoSection({
  formData,
  setFormData,
  handleInputChange,
}) {
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (formData.recruitImage.length < 6) {
            const newImage = {
              recruitImageUrl: uri,
              isThumbnail: formData.recruitImage.length === 0, // 첫 번째 이미지를 썸네일로 설정
            };
            setFormData({
              ...formData,
              recruitImage: [...formData.recruitImage, newImage],
            });
          } else {
            Alert.alert('사진 제한', '최대 6장까지 등록 가능합니다.');
          }
        }
      },
    );
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

            {formData.recruitImage.length < 6 && (
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
