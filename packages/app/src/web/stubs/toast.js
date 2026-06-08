import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const DEFAULT_VISIBILITY_TIME = 2500;
const listeners = new Set();
let toastId = 0;
let currentToast = null;

const notify = toast => {
  listeners.forEach(listener => listener(toast));
};

const normalizeToast = options => {
  if (!options) {
    return null;
  }

  return {
    id: ++toastId,
    position: options.position ?? 'top',
    props: options.props ?? {},
    text1: options.text1 ?? options.message ?? '',
    text2: options.text2 ?? options.subMessage ?? '',
    type: options.type ?? 'success',
    visibilityTime: options.visibilityTime ?? DEFAULT_VISIBILITY_TIME,
  };
};

function DefaultToast({text1, text2, type}) {
  const isError = type === 'error';

  return (
    <View style={[styles.toast, isError && styles.errorToast]}>
      <Text style={[FONTS.fs_14_medium, styles.text]}>{text1}</Text>
      {!!text2 && (
        <Text style={[FONTS.fs_12_medium, styles.subText]}>{text2}</Text>
      )}
    </View>
  );
}

function ToastHost({config = {}}) {
  const [toast, setToast] = useState(currentToast);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const listener = nextToast => setToast(nextToast);
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!toast) {
      return undefined;
    }

    hideTimerRef.current = setTimeout(() => {
      currentToast = null;
      notify(null);
    }, toast.visibilityTime);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [toast]);

  if (!toast) {
    return null;
  }

  const Renderer = config?.[toast.type] ?? DefaultToast;
  const positionStyle =
    toast.position === 'bottom' ? styles.bottomHost : styles.topHost;

  return (
    <View pointerEvents="none" style={[styles.host, positionStyle]}>
      <Renderer
        {...toast.props}
        text1={toast.text1}
        text2={toast.text2}
        type={toast.type}
      />
    </View>
  );
}

ToastHost.show = options => {
  currentToast = normalizeToast(options);
  notify(currentToast);
};

ToastHost.hide = () => {
  currentToast = null;
  notify(null);
};

const styles = StyleSheet.create({
  bottomHost: {
    bottom: 36,
  },
  errorToast: {
    backgroundColor: COLORS.semantic_red,
  },
  host: {
    alignItems: 'center',
    left: 0,
    paddingHorizontal: 20,
    position: 'fixed',
    right: 0,
    zIndex: 2147483647,
  },
  subText: {
    color: COLORS.grayscale_0,
    marginTop: 2,
    textAlign: 'center',
  },
  text: {
    color: COLORS.grayscale_0,
    textAlign: 'center',
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: COLORS.grayscale_900,
    borderRadius: 100,
    maxWidth: 360,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topHost: {
    top: 30,
  },
});

export default ToastHost;
