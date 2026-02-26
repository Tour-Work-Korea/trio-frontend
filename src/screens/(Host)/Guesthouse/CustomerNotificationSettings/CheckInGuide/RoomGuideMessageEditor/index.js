import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';

import Header from '@components/Header';
import {FONTS} from '@constants/fonts';
import styles from './RoomGuideMessageEditor.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import { COLORS } from '@constants/colors';

const RoomGuideMessageEditor = ({route}) => {
  const roomName = route?.params?.roomName ?? '객실';
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.screen}>
          <Header title={roomName} />

          <View style={styles.body}>
            <View style={styles.descriptionBox}>
              <Text style={[FONTS.fs_14_semibold, {color: COLORS.semantic_yellow}]}>⚠️</Text>
              <Text style={[FONTS.fs_12_medium, styles.descriptionText]}>예약 고객에게 체크인 전날 카카오 알림톡이 발송됩니다.{'\n'}고객에게 전달할 안내 내용을 작성해주세요.</Text>
            </View>

            <View style={styles.inputHeader}>
              <Text style={[FONTS.fs_16_medium]}>체크인 안내문 작성</Text>
              <Text style={[FONTS.fs_12_light, styles.countText]}>
                <Text style={{color: COLORS.primary_orange}}>{message.length}</Text>/700
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                value={message}
                onChangeText={setMessage}
                style={[FONTS.fs_14_medium, styles.input]}
                multiline
                scrollEnabled
                maxLength={700}
                textAlignVertical="top"
                placeholder="체크인 전 참고할 내용을 작성해주세요. (예: 주차 안내, 늦은 체크인 안내 등)"
                placeholderTextColor={styles.placeholderText.color}
              />
            </View>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', marginBottom: 32}}
              onPress={() => {
                setMessage('');
              }}
            >
              <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
            </TouchableOpacity>

            <ButtonScarlet
              title='저장'
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RoomGuideMessageEditor;
