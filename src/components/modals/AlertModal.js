import React from 'react';
import {Modal, View, Text, StyleSheet, Image} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';

/**
 * visible, buttonText, onPress 필수
 * buttonText2, onPress2는 버튼이 두 개 필요한 경우 사용
 * buttonText2가 있는 경우 buttonText, onPress는 회색 버튼에 적용됨 (취소, 확인)을 위함
 */

const AlertModal = ({
  visible,
  title, // 제목
  message, // 내용
  highlightText, // message에서 강조할 부분 (color의 색으로 강조됨)
  buttonText, // 버튼 1개일 때 or 버튼 2개일 때 오른쪽
  buttonText2 = null, // 버튼 2개일 때 왼쪽 (회색 바탕에 검은 글씨)
  onPress, // 버튼 1개일 때 or 버튼 2개일 때 오른쪽
  onPress2 = null, // 버튼 2개일 때 왼쪽
  color = COLORS.primary_orange, // buttonText의 배경색 (기본 주황색)
  imageUri,
  imageSource,   // png/jpg 같은 이미지
  iconElement,   // SVG
}) => {
  // 강조 텍스트 여부
  const renderMessage = () => {
    if (!message) return null;

    // 강조할 텍스트가 없으면 그냥 출력
    if (!highlightText || !message.includes(highlightText)) {
      return (
        <Text style={[FONTS.fs_14_medium, styles.message]}>
          {message}
        </Text>
      );
    }

    const parts = message.split(highlightText);

    return (
      <Text style={[FONTS.fs_14_medium, styles.message]}>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <Text>{part}</Text>
            {idx !== parts.length - 1 && (
              <Text
                style={[
                  {color},
                ]}
              >
                {highlightText}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  };

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
          {/* 제목 */}
          {title ? (
            <Text style={[FONTS.fs_18_semibold, styles.title]}>{title}</Text>
          ) : null}
          {/* 내용 */}
          {message ? (
            <Text style={[FONTS.fs_14_medium, styles.message]}>{renderMessage()}</Text>
          ) : null}

          {buttonText2 ? (
            <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
              <ButtonWhite
                title={buttonText2}
                onPress={onPress2}
                style={{flex: 1}}
              />
              <ButtonWhite
                title={buttonText}
                backgroundColor={color}
                textColor={COLORS.grayscale_0}
                onPress={onPress}
                style={{flex: 1}}
              />
            </View>
          ) : (
            <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
              <ButtonWhite
                title={buttonText}
                backgroundColor={color}
                textColor={COLORS.grayscale_0}
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
  },
  title: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  message: {
    color: COLORS.grayscale_900,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AlertModal;
