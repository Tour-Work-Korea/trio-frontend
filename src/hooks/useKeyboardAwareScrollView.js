import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Platform} from 'react-native';

/**
 * ScrollView용
 * TextInput 포커스 시, 해당 아이템이 키보드 위로 보이게 자동 스크롤
 * 키보드가 올라오면 ScrollView의 contentContainerStyle paddingBottom을 키보드 높이만큼 확보
 * scrollTo({ y }) 기반
 *
 * @param {object} options
 * @param {number} options.basePaddingBottom - 기본 paddingBottom (버튼/여백 확보)
 * @param {number} options.extraScrollOffset - 포커스 시 y에서 추가로 빼줄 값(상단 헤더/여백 고려)
 * @param {number} options.scrollDelay - 포커스 직후 스크롤 지연(ms). 키보드 애니메이션 타이밍 보정용
 * @param {boolean} options.iosOnly - iOS에서만 키보드 높이 반영할지 여부
 */
export default function useKeyboardAwareScrollView(options = {}) {
  const {
    basePaddingBottom = 24,
    extraScrollOffset = 12,
    scrollDelay = 80,
    iosOnly = true,
  } = options;

  const scrollRef = useRef(null);

  // 키보드 높이를 저장해서 paddingBottom을 늘려줌
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 각 입력 필드의 y 좌표를 저장
  // key(예: 'title', 'tags') -> y
  const positionsRef = useRef({});

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

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: basePaddingBottom + keyboardHeight,
    }),
    [basePaddingBottom, keyboardHeight],
  );

  // 내부 스크롤 함수
  const scrollToY = useCallback(
    y => {
      const targetY = Math.max(0, y - extraScrollOffset);

      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollRef.current?.scrollTo?.({
            y: targetY,
            animated: true,
          });
        }, scrollDelay);
      });
    },
    [extraScrollOffset, scrollDelay],
  );

  // 각 입력 필드에 onLayout, onFocus를 쉽게 달아주는 헬퍼
  /* 사용:
   * const titleField = registerInput('title');
   * <View onLayout={titleField.onLayout}>
   *   <TextInput onFocus={titleField.onFocus} />
   * </View>
  */
  // TextInput을 감싸는 View에 onLayout을 달아주는 게 안정적임
  const registerInput = useCallback(
    key => {
      return {
        onLayout: e => {
          // ScrollView content 기준 y 좌표
          const y = e?.nativeEvent?.layout?.y ?? 0;
          positionsRef.current[key] = y;
        },
        onFocus: () => {
          const y = positionsRef.current[key];
          if (typeof y !== 'number') return;
          scrollToY(y);
        },
      };
    },
    [scrollToY],
  );

  // 외부에서 바로 스크롤하고 싶을 때 쓰는 함수 (선택)
  const scrollToKey = useCallback(
    key => {
      const y = positionsRef.current[key];
      if (typeof y !== 'number') return;
      scrollToY(y);
    },
    [scrollToY],
  );

  return {
    scrollRef,
    keyboardHeight,
    contentContainerStyle,

    registerInput,
    scrollToKey,
  };
}
