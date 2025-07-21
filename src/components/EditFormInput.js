import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import DeleteIcon from '@assets/images/delete.svg';

const EditFormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  showSendAuthButton = false,
  showAuthInput = false,
  onSendAuth,
  authValue,
  onChangeAuthText,
  onConfirmAuth,
}) => {
  return (
    <View style={styles.container}>
      {/* 제목 */}
      <Text style={[FONTS.fs_h1_bold, styles.label]}>{label}</Text>

      {/* 메인 입력창 */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[FONTS.fs_h2, styles.input]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
        {value?.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText('')}>
            <DeleteIcon width={24} height={24} />
          </TouchableOpacity>
        )}
      </View>

      {/* 인증번호 발급 버튼 */}
      {showSendAuthButton && (
        <View style={styles.sendAuthButton}>
          <ButtonScarlet
            title="인증 번호 발급"
            marginHorizontal="0"
            onPress={onSendAuth}
          />
        </View>
      )}

      {/* 인증번호 입력창 + 확인 버튼 */}
      {showAuthInput && (
        <View style={styles.authInputWrapper}>
          <TextInput
            style={[FONTS.fs_body, styles.authInput]}
            value={authValue}
            onChangeText={onChangeAuthText}
            placeholder="인증번호를 입력해 주세요"
          />
          <View style={styles.authInputButton}>
            <ButtonWhite
              title="확인"
              marginHorizontal="0"
              onPress={onConfirmAuth}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 40,
    backgroundColor: COLORS.white,
  },
  label: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.scarlet,
  },
  input: {
    // height: 32,
    paddingHorizontal: 15,
    color: COLORS.black,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  sendAuthButton: {
    marginTop: 24,
  },
  authInputWrapper: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  authInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.light_gray,
    borderRadius: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    color: COLORS.black,
  },
  authInputButton: {
    flex: 0.5,
  },
});

export default EditFormInput;
