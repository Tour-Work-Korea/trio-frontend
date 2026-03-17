import React from 'react';
import { Alert, Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '@constants/colors';

const ADDRESS_HTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
  />
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #ececec; }
    #layer { width: 100%; min-height: 100%; }
  </style>
</head>
<body>
  <div id="layer"></div>
  <script>
    function bootstrapPostcode() {
      var layer = document.getElementById('layer');
      layer.innerHTML = '';
      new kakao.Postcode({
        hideMapBtn: true,
        animation: true,
        onsearch: function () {
          window.scrollTo(0, 0);
        },
        oncomplete: function (data) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        },
        onresize: function (size) {
          layer.style.height = size.height + 'px';
        },
        onclose: function () {
          bootstrapPostcode();
        },
        width: '100%',
        height: '100%'
      }).embed(layer);
    }

    function init() {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      s.onload = bootstrapPostcode;
      s.onreadystatechange = bootstrapPostcode;
      document.body.appendChild(s);
    }

    init();
  </script>
</body>
</html>
`;

const AddressSearchModal = ({ visible, onClose, onSelected }) => {
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event?.nativeEvent?.data ?? '{}');
      onSelected?.(data);
      onClose?.();
    } catch (e) {
      Alert.alert('주소 검색 오류', '주소를 불러오지 못했습니다. 다시 시도해주세요.');
    }
  };

  const handleShouldStartLoad = (request) => {
    const url = request?.url ?? '';
    const isAllowed =
      !url.startsWith('http') ||
      url.startsWith('https://postcode.map.kakao.com') ||
      url.startsWith('http://postcode.map.kakao.com') ||
      url.startsWith('https://postcode.map.daum.net') ||
      url.startsWith('http://postcode.map.daum.net') ||
      url.startsWith('https://t1.kakaocdn.net') ||
      url.startsWith('https://t1.daumcdn.net');

    // 외부 브라우저로 내보내지 않고, 내부 WebView에서만 주소검색을 유지
    return isAllowed;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
          <WebView
            style={{ flex: 1 }}
            source={{
              html: ADDRESS_HTML,
              baseUrl: 'https://postcode.map.kakao.com',
            }}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="compatibility"
            setSupportMultipleWindows={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    height: '90%',
    width: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
    paddingTop: 8,
  },
  closeButtonContainer: {
    padding: 10,
    alignItems: 'flex-end',
    backgroundColor: COLORS.grayscale_0,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.grayscale_800,
  },
});

export default AddressSearchModal;
