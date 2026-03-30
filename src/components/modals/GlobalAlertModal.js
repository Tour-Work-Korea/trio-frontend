import {subscribe} from '@utils/loginModalHub';
import {useEffect, useState} from 'react';
import AlertModal from './AlertModal';

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

  useEffect(() => {
    const unsub = subscribe(updater => setState(updater));
    return unsub;
  }, []);

  const close = () => {
    setState(prev => ({...prev, visible: false}));
  };

  const handlePress = () => {
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
    />
  );
}
