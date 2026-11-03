import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Header from '@components/Header';
import Modal from '@components/modals/AdaptiveModal';
import {COLORS as C} from '@constants/colors';
import {Title, Txt, styles as s} from './ui';
import ChevronRight from '@assets/images/chevron_right_gray.svg';
import CloseIcon from '@assets/images/x_gray.svg';

export function GroupForm({title, children, footer}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <Header title={title} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={false}
        contentContainerStyle={{padding: 20, gap: 16, flexGrow: 1}}>
        {children}
      </ScrollView>
      {footer && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
          }}>
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function GroupDialog({visible, title, children, onClose}) {
  const {t} = useTranslation();
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
          backgroundColor: C.modal_background,
        }}>
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            padding: 20,
            borderRadius: 20,
            backgroundColor: C.grayscale_0,
            gap: 16,
          }}>
          <View style={s.row}>
            <Title style={s.grow}>{title}</Title>
            <TouchableOpacity
              accessibilityLabel={t('common.close')}
              onPress={onClose}
              style={{padding: 4}}>
              <CloseIcon width={22} height={22} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
export function GroupOption({
  Icon,
  title,
  subtitle,
  value,
  danger,
  onPress,
  disabled,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 17,
      }}>
      <Icon width={22} height={22} />
      <View style={{flex: 1, minWidth: 0, gap: 4}}>
        <Txt style={danger && s.orange}>{title}</Txt>
        {!!subtitle && (
          <Txt numberOfLines={2} style={s.small}>
            {subtitle}
          </Txt>
        )}
      </View>
      {value ? (
        <Txt style={s.small}>{value}</Txt>
      ) : (
        <ChevronRight width={16} height={16} />
      )}
    </TouchableOpacity>
  );
}
export function parseNotice(content) {
  const value = content || '';
  const split = value.indexOf('\n\n');
  if (split < 0) {
    return {time: '', place: '', body: value};
  }
  const header = value.slice(0, split).split('\n');
  if (header.length !== 2) {
    return {time: '', place: '', body: value};
  }
  return {time: header[0], place: header[1], body: value.slice(split + 2)};
}
export const noticeContent = ({time, place, body}) =>
  `${time}\n${place}\n\n${body}`;
