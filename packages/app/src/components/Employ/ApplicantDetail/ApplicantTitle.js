import {useTranslation} from 'react-i18next';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const ApplicantTitle = ({title, setTitle = null, isEditable = false}) => {
  const {t} = useTranslation();
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
        <KeyboardAvoidingView>
          <View style={styles.sectionBox}>
            <Text style={styles.inputLabel}>
              {t('employ.whatIsOneWordToDescribeMe')}
            </Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder={t('employ.pleaseEnterOneWordToDescribeYourself')}
                placeholderTextColor={COLORS.grayscale_400}
                value={title}
                onChangeText={setTitle}
                maxLength={20}
                editable={isEditable}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};
const styles = StyleSheet.create({
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  inputLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: COLORS.grayscale_0,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_900,
  },
});
export default ApplicantTitle;
