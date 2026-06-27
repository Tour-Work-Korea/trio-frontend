import {Platform} from 'react-native';

const dragStateByElement = new WeakMap();
const CLICK_SUPPRESSION_MS = 500;
let suppressHomeHorizontalPressUntil = 0;

const getPointX = event => event?.clientX ?? event?.nativeEvent?.clientX ?? 0;

const getEventTarget = event =>
  event?.currentTarget ?? event?.nativeEvent?.currentTarget ?? event?.nativeEvent?.target;

const findHorizontalScroller = element => {
  let current = element;

  while (current) {
    if (current.scrollWidth > current.clientWidth) {
      return current;
    }

    current = current.parentElement;
  }

  return element;
};

const findVerticalScroller = element => {
  let current = element?.parentElement;

  while (current) {
    if (current.scrollHeight > current.clientHeight) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
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

const endDrag = horizontalScroller => {
  const dragState = dragStateByElement.get(horizontalScroller);

  if (dragState?.hasDragged) {
    suppressHomeHorizontalPressUntil = Date.now() + CLICK_SUPPRESSION_MS;
    horizontalScroller.dataset.suppressHomeClickUntil = String(
      suppressHomeHorizontalPressUntil,
    );
  }

  dragStateByElement.delete(horizontalScroller);
  horizontalScroller.style.cursor = '';
};

export const shouldIgnoreHomeHorizontalPress = () => {
  if (Platform.OS !== 'web') {
    return false;
  }

  return Date.now() <= suppressHomeHorizontalPressUntil;
};

export const getHomeHorizontalScrollProps = () => {
  if (Platform.OS !== 'web') {
    return {};
  }

  return {
    onWheel: event => {
      const nativeEvent = event?.nativeEvent;
      const deltaX = event?.deltaX ?? nativeEvent?.deltaX ?? 0;
      const deltaY = event?.deltaY ?? nativeEvent?.deltaY ?? 0;
      const target = getEventTarget(event);
      const horizontalScroller = findHorizontalScroller(target);
      const horizontalDelta =
        Math.abs(deltaX) > Math.abs(deltaY) || nativeEvent?.shiftKey
          ? deltaX || deltaY
          : 0;

      if (horizontalDelta && horizontalScroller) {
        horizontalScroller.scrollLeft += horizontalDelta;
        suppressHomeHorizontalPressUntil = Date.now() + CLICK_SUPPRESSION_MS;
        stopPropagation(event);
        return;
      }

      if (Math.abs(deltaY) <= Math.abs(deltaX)) {
        return;
      }

      const verticalScroller = findVerticalScroller(target);

      if (verticalScroller) {
        verticalScroller.scrollTop += deltaY;
        stopPropagation(event);
      }
    },
    onMouseDown: event => {
      if ((event?.button ?? event?.nativeEvent?.button ?? 0) !== 0) {
        return;
      }

      const horizontalScroller = findHorizontalScroller(getEventTarget(event));

      dragStateByElement.set(horizontalScroller, {
        startX: getPointX(event),
        scrollLeft: horizontalScroller.scrollLeft,
      });

      horizontalScroller.style.cursor = 'grabbing';
      preventDefaultIfCancelable(event);
    },
    onMouseMove: event => {
      const horizontalScroller = findHorizontalScroller(getEventTarget(event));
      const dragState = dragStateByElement.get(horizontalScroller);

      if (!dragState) {
        return;
      }

      const dragDistance = getPointX(event) - dragState.startX;
      dragState.hasDragged =
        dragState.hasDragged || Math.abs(dragDistance) > 0;
      horizontalScroller.scrollLeft =
        dragState.scrollLeft - dragDistance;

      if (dragState.hasDragged) {
        preventDefaultIfCancelable(event);
        stopPropagation(event);
      }
    },
    onMouseUp: event => {
      const horizontalScroller = findHorizontalScroller(getEventTarget(event));

      endDrag(horizontalScroller);
    },
    onMouseLeave: event => {
      const horizontalScroller = findHorizontalScroller(getEventTarget(event));

      endDrag(horizontalScroller);
    },
    onClickCapture: event => {
      const horizontalScroller = findHorizontalScroller(getEventTarget(event));
      const suppressUntil = Number(
        horizontalScroller?.dataset?.suppressHomeClickUntil ?? 0,
      );

      if (Date.now() <= suppressUntil) {
        preventDefaultIfCancelable(event);
        stopPropagation(event);
      }
    },
  };
};
