let listener = null;

export function subscribe(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showErrorModal(next) {
  // next: { title, message, buttonText, buttonText2, onPress, onPress2 }
  listener?.(prev => ({...prev, visible: true, ...next}));
}

export function hideErrorModal() {
  listener?.(prev => ({...prev, visible: false}));
}
