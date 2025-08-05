import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

import XBtn from '@assets/images/x_gray.svg';

const {height} = Dimensions.get('window');

export default function EmploySelfIntroModal({
  visible,
  onClose,
  editSelfIntro,
  initialData = null,
}) {
  const [selfIntro, setSelfIntro] = useState();

  useEffect(() => {
    setSelfIntro(initialData);
  }, [initialData]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View />
              <Text style={[FONTS.fs_20_semibold]}>자기소개</Text>
              <TouchableOpacity style={styles.xBtn} onPress={onClose}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView>
              {/* 입력 폼 */}
              <View style={styles.detailContainer}>
                {/* 자기소개 입력 */}
                <View>
                  <View style={styles.titleBox}>
                    <Text style={styles.titleText}>
                      자기소개, 경력기술 등 자유롭게 입력해 주세요.
                    </Text>
                  </View>
                  <Text style={styles.titleLength}>
                    <Text style={{color: COLORS.primary_orange}}>
                      {selfIntro?.length?.toLocaleString()}
                    </Text>
                    /50,000
                  </Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="성실함과 책임감을 가지고 모든 일에 임하는 사람으로서 열심히 하겠습니다."
                      placeholderTextColor={COLORS.grayscale_400}
                      value={selfIntro}
                      onChangeText={setSelfIntro}
                      maxLength={50000}
                    />
                  </View>
                  <TouchableOpacity onPress={() => setSelfIntro('')}>
                    <Text style={styles.resetText}>다시쓰기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
            {/* 하단 버튼 */}
            <View style={styles.sticky}>
              <View style={styles.confirmButton}>
                <ButtonScarlet
                  title="적용하기"
                  onPress={() => {
                    editSelfIntro(selfIntro);
                    onClose();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },

  //본문
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
  },
  titleLength: {
    textAlign: 'right',
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  // 하단 버튼
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
  //본문
  detailContainer: {
    gap: 20,
  },
  inputBox: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
    minHeight: 222,
  },
  textInput: {
    paddingVertical: 0,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
  },
  resetText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    textAlign: 'right',
  },
});
