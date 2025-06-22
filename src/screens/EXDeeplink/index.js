import React from 'react';
import { View, Text, TouchableOpacity, Alert, Clipboard } from 'react-native';

const EXDeeplink = () => {
  const createDeepLink = () => {
    const scheme = 'workaway://';
    const path = 'guesthouse/1234';
    const deepLinkUrl = `${scheme}${path}`;

    console.log('생성된 딥링크:', deepLinkUrl);
    Alert.alert('딥링크 생성 성공', deepLinkUrl);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>딥링크 생성하기</Text>
      <TouchableOpacity onPress={createDeepLink} style={{ padding: 20, backgroundColor: 'skyblue' }}>
        <Text>딥링크 생성</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EXDeeplink;
