import React from 'react';
import {Modal, View, Text, StyleSheet, Image} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

/**
 * visible, title, buttonText, onPress 필수
 * buttonText2, onPress2는 버튼이 두 개 필요한 경우 사용
 * buttonText2가 있는 경우 buttonText, onPress는 회색 버튼에 적용됨 (취소, 확인)을 위함
 */

const ErrorModal = ({
  visible,
  title,
  message,
  buttonText,
  buttonText2 = null,
  onPress,
  onPress2 = null,
  imageUri,
  imageSource,   // png/jpg 같은 이미지
  iconElement,   // SVG
}) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 이미지 주소 or 로컬 이미지 */}
          {iconElement ? (
            <View>{iconElement}</View>
          ) : imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : null}
          <Text style={[FONTS.fs_18_semibold, styles.title]}>{title}</Text>
          {message ? (
            <Text style={[FONTS.fs_14_medium, styles.message]}>{message}</Text>
          ) : null}

          {buttonText2 ? (
            <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
              <ButtonScarlet
                title={buttonText}
                onPress={onPress}
                style={{flex: 1}}
              />
              <ButtonWhite
                title={buttonText2}
                onPress={onPress2}
                style={{flex: 1}}
              />
            </View>
          ) : (
            <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
              <ButtonScarlet
                title={buttonText}
                onPress={onPress}
                style={{flex: 1}}
              />
            </View>
          )}
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
    width: '90%',
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
