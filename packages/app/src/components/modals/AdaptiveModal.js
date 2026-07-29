import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

const AndroidModalHostContext = createContext(null);
let nextAndroidModalId = 0;

const createAndroidModalStore = () => {
  const entries = new Map();
  const listeners = new Set();
  let version = 0;

  const notify = () => {
    version += 1;
    listeners.forEach(listener => listener());
  };

  return {
    mount(key, element) {
      entries.set(key, element);
      notify();
    },
    update(key, element) {
      if (!entries.has(key)) {
        return;
      }

      entries.set(key, element);
      notify();
    },
    unmount(key) {
      if (entries.delete(key)) {
        notify();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return version;
    },
    getEntries() {
      return Array.from(entries.entries());
    },
  };
};

const AndroidModalHost = ({store}) => {
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return store.getEntries().map(([key, element]) => (
    <React.Fragment key={key}>{element}</React.Fragment>
  ));
};

export const AdaptiveModalProvider = ({children}) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = createAndroidModalStore();
  }

  if (Platform.OS !== 'android') {
    return children;
  }

  return (
    <AndroidModalHostContext.Provider value={storeRef.current}>
      <View style={styles.provider}>
        {children}
        <View pointerEvents="box-none" style={styles.host}>
          <AndroidModalHost store={storeRef.current} />
        </View>
      </View>
    </AndroidModalHostContext.Provider>
  );
};

const AdaptiveModal = ({
  visible,
  children,
  onRequestClose,
  androidOverlayStyle,
  useNativeModalOnAndroid = false,
  ...modalProps
}) => {
  const androidModalStore = useContext(AndroidModalHostContext);
  const portalKey = useRef(`adaptive-modal-${nextAndroidModalId++}`);
  const useAndroidOverlay =
    Platform.OS === 'android' && !useNativeModalOnAndroid;
  const portalElement = useMemo(
    () =>
      useAndroidOverlay && visible ? (
        <View style={[styles.androidOverlayHost, androidOverlayStyle]}>
          {children}
        </View>
      ) : null,
    [androidOverlayStyle, children, useAndroidOverlay, visible],
  );
  const portalElementRef = useRef(portalElement);
  portalElementRef.current = portalElement;

  useLayoutEffect(() => {
    if (!useAndroidOverlay || !visible || !androidModalStore) {
      return undefined;
    }

    const key = portalKey.current;
    androidModalStore.mount(key, portalElementRef.current);

    return () => {
      androidModalStore.unmount(key);
    };
  }, [androidModalStore, useAndroidOverlay, visible]);

  useLayoutEffect(() => {
    if (!useAndroidOverlay || !visible || !androidModalStore) {
      return;
    }

    androidModalStore.update(portalKey.current, portalElement);
  }, [
    androidModalStore,
    portalElement,
    useAndroidOverlay,
    visible,
  ]);

  useEffect(() => {
    if (!useAndroidOverlay || !visible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!onRequestClose) {
          return false;
        }

        onRequestClose?.();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [onRequestClose, useAndroidOverlay, visible]);

  if (useAndroidOverlay) {
    if (!visible) {
      return null;
    }

    return androidModalStore ? null : portalElement;
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      hardwareAccelerated
      statusBarTranslucent
      {...modalProps}>
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  provider: {
    flex: 1,
  },
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  androidOverlayHost: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AdaptiveModal;
