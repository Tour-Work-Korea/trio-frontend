import React, {useMemo, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';
import ApplicantInfoDatePicker from './ApplicantInfoDatePicker';
import styles from './ApplicantInfo.styles';

const MESSAGE_MAX_LENGTH = 50;

const pad2 = value => String(value).padStart(2, '0');

const formatYearMonth = date => {
  if (!date) {
    return '2025. 04';
  }

  return `${date.getFullYear()}. ${pad2(date.getMonth() + 1)}`;
};

const formatLocalDate = date =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const ApplicantInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    recruitId,
    recruitTitle,
    guesthouseName,
    recruitEnd,
  } = route.params ?? {};
  const [startDate, setStartDate] = useState(null);
  const [message, setMessage] = useState('');
  const {
    scrollRef,
    keyboardHeight,
    contentContainerStyle: keyboardAwareContentStyle,
    registerInput,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 120,
    extraScrollOffset: 88,
    scrollDelay: 180,
    iosOnly: false,
  });
  const messageInputField = registerInput('message');
  const bottomContainerStyle = useMemo(
    () => [
      styles.bottomContainer,
      keyboardHeight > 0 ? {bottom: keyboardHeight} : null,
    ],
    [keyboardHeight],
  );

  const handleNext = () => {
    if (!startDate) {
      return;
    }

    navigation.navigate('ApplicantForm', {
      recruitId,
      recruitTitle,
      guesthouseName,
      recruitEnd,
      startDate: formatLocalDate(startDate),
      message: message.trim(),
    });
  };

  return (
    <View style={styles.container}>
      <Header title="지원 정보 입력" onPress={() => navigation.goBack()} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, keyboardAwareContentStyle]}>
        <Text style={[FONTS.fs_16_semibold, styles.label]}>입도 가능 날짜</Text>

        <View style={styles.dateInput}>
          <Text
            style={[
              FONTS.fs_14_regular,
              startDate ? styles.dateInputText : styles.dateInputPlaceholder,
            ]}>
            {formatYearMonth(startDate)}
          </Text>
          <CalendarIcon width={24} height={24} />
        </View>

        <ApplicantInfoDatePicker
          value={startDate}
          onChange={setStartDate}
          label="날짜"
          style={styles.calendar}
        />

        <View style={styles.messageHeader}>
          <Text style={[FONTS.fs_16_semibold, styles.label]}>
            추가 문의 사항
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.messageCount]}>
            <Text style={styles.messageCountActive}>{message.length}</Text>/
            {MESSAGE_MAX_LENGTH}
          </Text>
        </View>

        <View {...messageInputField}>
          <TextInput
            style={[FONTS.fs_14_regular, styles.messageInput]}
            placeholder="ex. 서빙, 설거지, 계산"
            placeholderTextColor={COLORS.grayscale_400}
            value={message}
            maxLength={MESSAGE_MAX_LENGTH}
            onChangeText={setMessage}
            onFocus={messageInputField.onFocus}
            returnKeyType="done"
          />
        </View>
      </ScrollView>

      <View style={bottomContainerStyle}>
        <ButtonScarlet
          title="다음"
          onPress={handleNext}
          disabled={!startDate}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

export default ApplicantInfo;
