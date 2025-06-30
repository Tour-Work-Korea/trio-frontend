import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

// 제목, 버튼 텍스트만 필수
// 이미지, 세부 텍스트는 선택

const ErrorModal = ({
  visible,
  title,
  message,
  buttonText,
  onPress,
  imageUri,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : null}
          <Text style={[FONTS.fs_18_semibold, styles.title]}>{title}</Text>
          {message ? (
            <Text style={[FONTS.fs_14_medium, styles.message]}>{message}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={[FONTS.fs_16_semibold, styles.buttonText]}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop: 20,
  },
  title: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  message: {
    color: COLORS.grayscale_600,
    marginTop: 4,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary_orange,
    borderRadius: 8,
    paddingVertical: 10,
    alignSelf: 'stretch',
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.grayscale_0,
    textAlign: 'center',
  },
});

export default ErrorModal;
