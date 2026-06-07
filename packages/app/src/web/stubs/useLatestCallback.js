import {useLayoutEffect, useRef} from 'react';

export default function useLatestCallback(callback) {
  const callbackRef = useRef(callback);
  const latestCallbackRef = useRef((...args) => callbackRef.current(...args));

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return latestCallbackRef.current;
}
