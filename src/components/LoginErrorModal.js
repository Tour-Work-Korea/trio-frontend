import {subscribe} from '@utils/loginModalHub';
import {useEffect, useState} from 'react';
import ButtonScarlet from './ButtonScarlet';
import ButtonWhite from './ButtonWhite';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

export default function LoginErrorModal() {
  const [state, setState] = useState({
    visible: false,
    title: '',
    message: '',
    buttonText: '확인',
    buttonText2: null,
    onPress: null,
    onPress2: null,
  });

  useEffect(() => {
    const unsub = subscribe(updater => setState(updater));
    return unsub;
  }, []);

  const close = () => setState(prev => ({...prev, visible: false}));
  const handleConfirm = () => {
    const cb = state.onPress;
    close();
    requestAnimationFrame(() => cb?.());
  };
  const handleCancel = () => {
    const cb = state.onPress2;
    close();
    requestAnimationFrame(() => cb?.());
  };

  if (!state.visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {!!state.message && (
          <Text style={[FONTS.fs_18_semibold, styles.title]}>
            {state.message}
          </Text>
        )}

        {state.buttonText2 ? (
          <View style={styles.actions}>
            <ButtonScarlet
              title={state.buttonText}
              onPress={handleConfirm}
              style={styles.flex1}
            />
            <ButtonWhite
              title={state.buttonText2}
              onPress={handleCancel}
              style={styles.flex1}
            />
          </View>
        ) : (
          <View style={styles.actionsSingle}>
            <ButtonScarlet
              title={state.buttonText || '확인'}
              onPress={handleConfirm}
              style={styles.flex1}
            />
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  // ✅ ErrorModal의 overlay 스타일을 그대로 복제
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.modal_background, // rgba 딤
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24, // 작은 화면에서 잘림 방지
    paddingTop: Platform.OS === 'android' ? 24 : 0, // statusBarTranslucent 보정과 동일 톤
    paddingBottom: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  // ✅ ErrorModal의 container 스타일을 그대로 복제
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420, // 큰 화면에서 과도하게 넓어지지 않도록
    alignItems: 'center',
  },
  title: {
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  message: {
    color: COLORS.grayscale_600,
    marginTop: 4,
    textAlign: 'center',
  },
  // ✅ 버튼 행도 동일하게
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    columnGap: 8, // RN 최신에서 지원
  },
  actionsSingle: {
    flexDirection: 'row',
    marginTop: 12,
  },
  flex1: {
    flex: 1,
  },
});
