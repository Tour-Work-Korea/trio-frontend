import {useTranslation} from 'react-i18next';
import {subscribe} from '@utils/loginModalHub';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import AlertModal from './AlertModal';
import {navigate} from '@utils/navigationService';

const initialState = {
  visible: false,
  title: '',
  message: '',
  buttonText: null,
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
  const {t} = useTranslation();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const unsub = subscribe(updater => setState(updater));
    return unsub;
  }, []);

  const close = () => {
    setState(initialState);
  };

  const handlePress = () => {
    const callback = state.onPress;

    if (Platform.OS === 'web' && state.buttonText === t('common.logIn')) {
      close();
      requestAnimationFrame(() => {
        if (callback) {
          callback();
        } else {
          navigate('Login');
        }
      });
      return;
    }

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
        buttonText={state.buttonText || t('common.confirm')}
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
    </>
  );
}
