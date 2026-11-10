import {useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cached = new Map();
const writes = new Map();

// Each keyed banner instance owns one account/room preference.
export default function useNoticeExpanded(storageKey, previousStorageKey) {
  const [expanded, setExpanded] = useState(cached.get(storageKey) ?? true);
  const [ready, setReady] = useState(!storageKey || cached.has(storageKey));
  const current = useRef(expanded);

  useEffect(() => {
    if (!storageKey) {
      setReady(true);
      return;
    }
    if (cached.has(storageKey)) {
      const next = cached.get(storageKey);
      current.current = next;
      setExpanded(next);
      setReady(true);
      return;
    }
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then(async value => {
        if (
          value == null &&
          previousStorageKey &&
          previousStorageKey !== storageKey
        ) {
          const previous = cached.get(previousStorageKey);
          value =
            previous != null
              ? String(previous)
              : await AsyncStorage.getItem(previousStorageKey);
        }
        if (!active) return;
        // A second mounted banner may have changed it while storage was read.
        const next = cached.get(storageKey) ?? value !== 'false';
        cached.set(storageKey, next);
        current.current = next;
        setExpanded(next);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey, previousStorageKey]);

  const toggle = () => {
    if (!ready) return;
    const next = !current.current;
    current.current = next;
    setExpanded(next);
    if (!storageKey) return;
    cached.set(storageKey, next);
    // Serialize rapid toggles so the last choice is the last value on disk.
    const write = (writes.get(storageKey) ?? Promise.resolve())
      .then(() => AsyncStorage.setItem(storageKey, String(next)))
      .catch(() => {});
    writes.set(storageKey, write);
    write.finally(() => {
      if (writes.get(storageKey) === write) writes.delete(storageKey);
    });
  };

  return {expanded, ready, toggle};
}
