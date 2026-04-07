import React, {useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {WebView} from 'react-native-webview';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';

import XIcon from '@assets/images/x_gray.svg';

// title 모달 제목
// content 약관동의 내용 -> 나중에 data파일에 적어주고 모달호출할때 보내주면 될듯!
// onAgree 동의합니다 누르고 진행할 함수

const onShouldStartLoadWithRequest = request => {
  if (request.navigationType === 'click') {
    return false;
  }
  return true;
};

const escapeHtml = text =>
  String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const TermsModal = ({ visible, onClose, title, content, contentHtml, onAgree }) => {
  const scheme = useColorScheme();
  const rawHtml =
    contentHtml ||
    `<pre style="white-space:pre-wrap;font-family:system-ui, -apple-system, Roboto;line-height:1.6">${escapeHtml(
      content,
    )}</pre>`;

  const html = useMemo(
    () => `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
        <style>
          body {
            margin: 0; padding: 16px;
            background: ${scheme === 'dark' ? '#000' : '#fff'};
            color: ${scheme === 'dark' ? '#fff' : '#111'};
            -webkit-text-size-adjust: 100%;
          }
          pre { margin: 0; white-space: pre-wrap; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; }
          th { background:#f9fafb; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${rawHtml}
      </body>
    </html>
  `,
    [rawHtml, scheme],
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={[FONTS.fs_18_semibold]}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <XIcon width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* 본문 */}
            <View style={styles.contentBox}>
              <WebView
                originWhitelist={['*']}
                source={{html}}
                javaScriptEnabled={false}
                domStorageEnabled={false}
                allowFileAccess={true}
                allowingReadAccessToURL={'/'}
                onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                setSupportMultipleWindows={false}
              />
            </View>
          </View>

          {/* 동의 버튼 */}
          <View style={styles.agreeButton}>
            <ButtonScarlet
              onPress={onAgree}
              title={'동의합니다'}
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: "flex-end",
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },

  // 본문
  contentBox: {
    overflow: 'hidden',
    flexGrow: 1,
    minHeight: 520,
    marginBottom: 20,
  },

  // 동의 버튼
  agreeButton: {
  },
});

export default TermsModal;
