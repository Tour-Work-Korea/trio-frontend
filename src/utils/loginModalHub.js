let listener = null;

const defaultModalState = {
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

export function subscribe(fn) {
  listener = fn;
  return () => {
    if (listener === fn) {
      listener = null;
    }
  };
}

export function showErrorModal(next) {
  // next: { title, message, buttonText, buttonText2, onPress, onPress2 }
  listener?.(() => ({...defaultModalState, visible: true, ...next}));
}

export function hideErrorModal() {
  listener?.(() => defaultModalState);
}
