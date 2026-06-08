import * as React from 'react';

export function useSyncExternalStoreWithSelector(
  subscribe,
  getSnapshot,
  getServerSnapshot,
  selector,
  isEqual,
) {
  const snapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot || getSnapshot,
  );
  const selected = selector(snapshot);
  const selectedRef = React.useRef(selected);

  if (!isEqual || !isEqual(selectedRef.current, selected)) {
    selectedRef.current = selected;
  }

  return selectedRef.current;
}
