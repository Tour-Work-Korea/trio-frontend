import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
// 딥링크 생성 유틸 함수 호출
import { exDeeplink, copyDeeplinkToClipboard } from '@utils/deeplinkGenerator';

const EXDeeplink = () => {
  const createAndCopyDeepLink = () => {
    const deepLinkUrl = exDeeplink('1234');
    copyDeeplinkToClipboard(deepLinkUrl);
    console.log('딥링크 생성 및 복사:', deepLinkUrl);
    Alert.alert('딥링크 복사 완료', deepLinkUrl);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>딥링크 생성 및 복사</Text>
      <TouchableOpacity onPress={createAndCopyDeepLink} style={{ padding: 20, backgroundColor: 'skyblue' }}>
        <Text>딥링크 생성 & 복사</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EXDeeplink;
