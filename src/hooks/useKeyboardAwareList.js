import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

/**
 * FlatList용
 * TextInput 포커스 시, 해당 아이템이 키보드 위로 보이게 자동 스크롤
 * 키보드가 올라오면 리스트 맨 아래가 가려지지 않도록 paddingBottom을 키보드 높이만큼 확보
 * scrollToIndex가 측정 타이밍 때문에 실패할 수 있어서 재시도 로직 포함
 *
 * @param {object} options
 * @param {number} options.basePaddingBottom - 기본 paddingBottom(버튼/여백 확보용)
 * @param {number} options.viewPosition - scrollToIndex 시 아이템 위치(0=맨위, 1=맨아래)
 * @param {number} options.retryDelay - scrollToIndex 실패 시 재시도 딜레이(ms)
 * @param {number} options.maxRetry - 실패 재시도 횟수
 * @param {boolean} options.iosOnly - iOS에서만 키보드 높이 적용할지 여부
 */
export default function useKeyboardAwareList(options = {}) {
  const {
    basePaddingBottom = 24,
    viewPosition = 0.2,
    retryDelay = 50,
    maxRetry = 2,
    iosOnly = true,
  } = options;

  const listRef = useRef(null);

  // 키보드가 올라왔을 때 높이를 저장
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 키보드 이벤트 구독
  useEffect(() => {
    if (iosOnly && Platform.OS !== 'ios') return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [iosOnly]);

  // 리스트 하단 여백 확보
  // 키보드가 올라오면 그 높이만큼 paddingBottom을 늘림
  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: basePaddingBottom + keyboardHeight,
    }),
    [basePaddingBottom, keyboardHeight],
  );

  // 안전하게 scrollToIndex 실행
  const safeScrollToIndex = useCallback(
    (index, vp = viewPosition) => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex?.({
          index,
          animated: true,
          viewPosition: vp,
        });
      });
    },
    [viewPosition],
  );


  // FlatList 계열은 아이템 높이 측정 전이면 scrollToIndex가 실패할 수 있음 -> 짧게 기다렸다가 재시도 하면 대부분 해결됨
  // 사용: <FlatList onScrollToIndexFailed={onScrollToIndexFailed} />
  const onScrollToIndexFailed = useCallback(
    info => {
      let tries = 0;

      const retry = () => {
        tries += 1;

        // index가 유효할 때만 시도
        if (typeof info?.index !== 'number') return;

        // 재시도 횟수 제한
        if (tries > maxRetry) return;

        setTimeout(() => {
          safeScrollToIndex(info.index, viewPosition);
          if (tries < maxRetry) retry();
        }, retryDelay);
      };

      retry();
    },
    [maxRetry, retryDelay, safeScrollToIndex, viewPosition],
  );

  // TextInput onFocus에서 호출
  const scrollToIndex = useCallback(
    (index, vp) => {
      if (typeof index !== 'number') return;
      safeScrollToIndex(index, vp ?? viewPosition);
    },
    [safeScrollToIndex, viewPosition],
  );


  // TextInput마다 onFocus={() => scrollToIndex(index)} 쓰기 귀찮을 때
  // getFocusHandler(index)만 넣어주면 됨
  // 사용: <TextInput onFocus={getFocusHandler(displayIndex)} />
  const getFocusHandler = useCallback(
    index => () => scrollToIndex(index),
    [scrollToIndex],
  );

  return {
    // ref
    listRef,

    // 상태/값
    keyboardHeight,
    contentContainerStyle,

    // 스크롤 제어
    scrollToIndex,
    getFocusHandler,
    onScrollToIndexFailed,
  };
}
