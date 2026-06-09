import * as ReactNativeWeb from 'react-native-web';
import React from 'react';

export * from 'react-native-web';

const dragStateByElement = new WeakMap();
const CLICK_SUPPRESSION_MS = 500;
const DRAG_THRESHOLD_PX = 2;

const getEventTarget = event =>
  event?.target ?? event?.nativeEvent?.target ?? event?.currentTarget;

const getPointX = event => event?.clientX ?? event?.nativeEvent?.clientX ?? 0;

const findHorizontalScroller = (target, boundary) => {
  let current = target;

  while (current) {
    if (current.scrollWidth > current.clientWidth) {
      return current;
    }

    if (current === boundary) {
      break;
    }

    current = current.parentElement;
  }

  if (boundary?.scrollWidth > boundary?.clientWidth) {
    return boundary;
  }

  const descendants = boundary?.querySelectorAll?.('*') ?? [];

  for (const element of descendants) {
    if (element.scrollWidth > element.clientWidth) {
      return element;
    }
  }

  return null;
};

const getWheelDelta = event => {
  const nativeEvent = event?.nativeEvent;
  const deltaX = event?.deltaX ?? nativeEvent?.deltaX ?? 0;
  const deltaY = event?.deltaY ?? nativeEvent?.deltaY ?? 0;
  const shiftKey = event?.shiftKey ?? nativeEvent?.shiftKey;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX;
  }

  if (shiftKey || Math.abs(deltaY) > Math.abs(deltaX)) {
    return deltaY;
  }

  return 0;
};

const canScrollBy = (element, delta) => {
  if (!element || !delta) {
    return false;
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  if (maxScrollLeft <= 0) {
    return false;
  }

  if (delta < 0) {
    return element.scrollLeft > 0;
  }

  return element.scrollLeft < maxScrollLeft;
};

const suppressClicks = element => {
  if (!element?.dataset) {
    return;
  }

  element.dataset.trioSuppressHorizontalClickUntil = String(
    Date.now() + CLICK_SUPPRESSION_MS,
  );
};

const preventDefaultIfCancelable = event => {
  const nativeEvent = event?.nativeEvent;
  const cancelable = event?.cancelable ?? nativeEvent?.cancelable;

  if (cancelable === false) {
    return;
  }

  event?.preventDefault?.();
};

const stopPropagation = event => {
  event?.stopPropagation?.();
};

const endDrag = element => {
  if (!element) {
    return;
  }

  const dragState = dragStateByElement.get(element);

  if (dragState?.hasDragged) {
    suppressClicks(element);
  }

  dragStateByElement.delete(element);

  if (element?.style) {
    element.style.cursor = '';
    element.style.userSelect = '';
  }
};

const callHandler = (handler, event) => {
  if (typeof handler === 'function') {
    handler(event);
  }
};

const getHorizontalScrollHandlers = props => {
  if (!props?.horizontal) {
    return {};
  }

  return {
    onWheel: event => {
      callHandler(props.onWheel, event);

      if (event?.defaultPrevented) {
        return;
      }

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );
      const delta = getWheelDelta(event);

      if (!canScrollBy(scroller, delta)) {
        return;
      }

      scroller.scrollLeft += delta;
      suppressClicks(scroller);
      preventDefaultIfCancelable(event);
      stopPropagation(event);
    },
    onMouseDown: event => {
      callHandler(props.onMouseDown, event);

      if (event?.defaultPrevented || (event?.button ?? 0) !== 0) {
        return;
      }

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );

      if (!scroller) {
        return;
      }

      dragStateByElement.set(scroller, {
        startX: getPointX(event),
        scrollLeft: scroller.scrollLeft,
      });

      scroller.style.cursor = 'grabbing';
      scroller.style.userSelect = 'none';
      preventDefaultIfCancelable(event);
    },
    onMouseMove: event => {
      callHandler(props.onMouseMove, event);

      if (event?.defaultPrevented) {
        return;
      }

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );
      const dragState = dragStateByElement.get(scroller);

      if (!scroller || !dragState) {
        return;
      }

      const dragDistance = getPointX(event) - dragState.startX;

      if (Math.abs(dragDistance) > DRAG_THRESHOLD_PX) {
        dragState.hasDragged = true;
      }

      scroller.scrollLeft = dragState.scrollLeft - dragDistance;

      if (dragState.hasDragged) {
        preventDefaultIfCancelable(event);
        stopPropagation(event);
      }
    },
    onMouseUp: event => {
      callHandler(props.onMouseUp, event);

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );

      endDrag(scroller);
    },
    onMouseLeave: event => {
      callHandler(props.onMouseLeave, event);

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );

      endDrag(scroller);
    },
    onClickCapture: event => {
      callHandler(props.onClickCapture, event);

      if (event?.defaultPrevented) {
        return;
      }

      const scroller = findHorizontalScroller(
        getEventTarget(event),
        event?.currentTarget,
      );
      const suppressUntil = Number(
        scroller?.dataset?.trioSuppressHorizontalClickUntil ?? 0,
      );

      if (Date.now() <= suppressUntil) {
        preventDefaultIfCancelable(event);
        stopPropagation(event);
      }
    },
  };
};

export const ScrollView = React.forwardRef(function ScrollView(props, ref) {
  return (
    <ReactNativeWeb.ScrollView
      {...props}
      {...getHorizontalScrollHandlers(props)}
      ref={ref}
    />
  );
});

export const FlatList = React.forwardRef(function FlatList(props, ref) {
  return (
    <ReactNativeWeb.FlatList
      {...props}
      {...getHorizontalScrollHandlers(props)}
      ref={ref}
    />
  );
});

export const Image = Object.assign(ReactNativeWeb.Image, {
  resolveAssetSource(source) {
    if (typeof source === 'string') {
      return {uri: source};
    }

    if (source?.uri) {
      return source;
    }

    return undefined;
  },
});

export const NativeModules = {};

export const PermissionsAndroid = {
  PERMISSIONS: {},
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
  request: async () => 'denied',
  check: async () => false,
};

export default {
  ...ReactNativeWeb,
  FlatList,
  Image,
  NativeModules,
  PermissionsAndroid,
  ScrollView,
};
