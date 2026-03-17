import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

/**
 * 탭 버튼과 좌우 스와이프(paging ScrollView)를 동기화하는 훅
 *
 * 사용 전제:
 * - 탭 콘텐츠를 `horizontal` + `pagingEnabled` ScrollView로 렌더링
 * - 각 페이지의 너비가 동일(보통 화면 너비)
 *
 * @param {object} params
 * @param {Array<{key: string}>} params.tabs - 탭 배열 (key 필수)
 * @param {string} [params.initialKey] - 초기 활성 탭 key
 * @param {(key: string, index: number) => void} [params.onChange] - 활성 탭 변경 콜백
 */
export default function useSwipeTabs({
  tabs = [],
  initialKey,
  onChange,
} = {}) {
  const pagerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(0);

  const tabKeys = useMemo(
    () => tabs.map(tab => tab?.key).filter(Boolean),
    [tabs],
  );

  const initialIndex = useMemo(() => {
    if (tabKeys.length === 0) {
      return 0;
    }
    const byKey = initialKey ? tabKeys.indexOf(initialKey) : -1;
    return byKey >= 0 ? byKey : 0;
  }, [initialKey, tabKeys]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // 탭 리스트가 바뀌었을 때 현재 인덱스가 범위를 넘지 않도록 보정
  useEffect(() => {
    if (tabKeys.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(prev => Math.min(prev, tabKeys.length - 1));
  }, [tabKeys.length]);

  const activeKey = tabKeys[activeIndex] ?? tabKeys[0] ?? null;

  const emitChange = useCallback(
    index => {
      const key = tabKeys[index];
      if (!key) {
        return;
      }
      onChange?.(key, index);
    },
    [onChange, tabKeys],
  );

  const scrollToIndex = useCallback(
    (index, animated = true) => {
      if (!Number.isFinite(index)) {
        return;
      }
      if (index < 0 || index >= tabKeys.length) {
        return;
      }
      if (pageWidth <= 0) {
        return;
      }

      pagerRef.current?.scrollTo?.({
        x: index * pageWidth,
        y: 0,
        animated,
      });
    },
    [pageWidth, tabKeys.length],
  );

  const setIndex = useCallback(
    (index, {animated = true, syncScroll = true} = {}) => {
      if (!Number.isFinite(index)) {
        return;
      }
      if (index < 0 || index >= tabKeys.length) {
        return;
      }

      setActiveIndex(index);
      emitChange(index);

      if (syncScroll) {
        scrollToIndex(index, animated);
      }
    },
    [emitChange, scrollToIndex, tabKeys.length],
  );

  const setKey = useCallback(
    (key, options) => {
      const nextIndex = tabKeys.indexOf(key);
      if (nextIndex < 0) {
        return;
      }
      setIndex(nextIndex, options);
    },
    [setIndex, tabKeys],
  );

  const isActive = useCallback(
    key => key === activeKey,
    [activeKey],
  );

  // pager 너비를 측정. 탭 전환 시 x 계산에 사용
  const onPagerLayout = useCallback(event => {
    const width = Number(event?.nativeEvent?.layout?.width ?? 0);
    if (width <= 0) {
      return;
    }
    setPageWidth(width);
  }, []);

  // 손가락을 떼고 paging 정렬이 끝난 시점에 현재 페이지 인덱스를 반영
  const onMomentumScrollEnd = useCallback(
    event => {
      if (pageWidth <= 0) {
        return;
      }

      const offsetX = Number(event?.nativeEvent?.contentOffset?.x ?? 0);
      const nextIndex = Math.round(offsetX / pageWidth);

      if (nextIndex === activeIndex) {
        return;
      }
      setIndex(nextIndex, {animated: false, syncScroll: false});
    },
    [activeIndex, pageWidth, setIndex],
  );

  // width 측정 후 초기 탭 위치 동기화
  useEffect(() => {
    if (pageWidth <= 0) {
      return;
    }
    scrollToIndex(activeIndex, false);
  }, [activeIndex, pageWidth, scrollToIndex]);

  return {
    pagerRef,
    activeKey,
    activeIndex,
    isActive,
    setKey,
    setIndex,
    onPagerLayout,
    onMomentumScrollEnd,
  };
}
