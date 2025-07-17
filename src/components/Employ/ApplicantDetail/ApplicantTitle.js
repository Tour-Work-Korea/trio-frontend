import React from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const ApplicantTitle = ({title, setTitle, isEditable = false}) => {
  return (
    <View>
      <View style={styles.sectionBox}>
        <Text style={styles.inputLabel}>나를 표현하는 한 마디는?</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.textInput}
            placeholder="나를 표현하는 한 마디를 입력해주세요"
            placeholderTextColor={COLORS.grayscale_400}
            value={title}
            onChangeText={setTitle}
            maxLength={20}
            editable={isEditable}
          />
        </View>
      </View>
    </View>
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
    backgroundColor: COLORS.white,
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
