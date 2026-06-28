import {subscribe} from '@utils/loginModalHub';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import AlertModal from './AlertModal';
import LoginAppPromptModal from './LoginAppPromptModal';

const initialState = {
  visible: false,
  title: '',
  message: '',
  buttonText: '확인',
  buttonText2: null,
  onPress: null,
  onPress2: null,
  color: undefined,
  highlightText: null,
  imageUri: null,
  imageSource: null,
  iconElement: null,
};

export default function GlobalAlertModal() {
  const [state, setState] = useState(initialState);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribe(updater => setState(updater));
    return unsub;
  }, []);

  const close = () => {
    setState(initialState);
  };

  const handlePress = () => {
    if (Platform.OS === 'web' && state.buttonText === '로그인하기') {
      close();
      setLoginPromptVisible(true);
      return;
    }

    const callback = state.onPress;
    close();
    requestAnimationFrame(() => callback?.());
  };

  const handlePress2 = () => {
    const callback = state.onPress2;
    close();
    requestAnimationFrame(() => callback?.());
  };

  return (
    <>
      <AlertModal
        visible={state.visible}
        title={state.title || state.message}
        message={state.title ? state.message : null}
        highlightText={state.highlightText}
        buttonText={state.buttonText || '확인'}
        buttonText2={state.buttonText2}
        onPress={handlePress}
        onPress2={handlePress2}
        color={state.color}
        imageUri={state.imageUri}
        imageSource={state.imageSource}
        iconElement={state.iconElement}
        onRequestClose={handlePress2}
        interceptWebLoginPress={false}
      />
      <LoginAppPromptModal
        visible={loginPromptVisible}
        onClose={() => setLoginPromptVisible(false)}
      />
    </>
  );
}
