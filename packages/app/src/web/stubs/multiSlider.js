import React, {useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

const CONTAINER_HEIGHT = 40;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPageX = event => {
  const nativeEvent = event?.nativeEvent || event;

  return (
    nativeEvent?.pageX ??
    nativeEvent?.clientX ??
    nativeEvent?.locationX ??
    0
  );
};

const MultiSlider = ({
  values = [],
  min = 0,
  max = 100,
  step = 1,
  sliderLength = 280,
  onValuesChange,
  onValuesChangeStart,
  onValuesChangeFinish,
  selectedStyle,
  unselectedStyle,
  markerStyle,
}) => {
  const trackRef = useRef(null);
  const activeThumbRef = useRef(0);

  const range = Math.max(max - min, 1);
  const currentValues = useMemo(() => {
    const lower = clamp(values[0] ?? min, min, max);
    const upper = clamp(values[1] ?? max, min, max);

    return lower <= upper ? [lower, upper] : [upper, lower];
  }, [max, min, values]);

  const lowerPercent = ((currentValues[0] - min) / range) * 100;
  const upperPercent = ((currentValues[1] - min) / range) * 100;
  const flattenedSelectedStyle = StyleSheet.flatten(selectedStyle) || {};
  const flattenedUnselectedStyle = StyleSheet.flatten(unselectedStyle) || {};
  const flattenedMarkerStyle = StyleSheet.flatten(markerStyle) || {};
  const trackHeight =
    flattenedUnselectedStyle.height || flattenedSelectedStyle.height || 4;
  const markerWidth = flattenedMarkerStyle.width || 20;
  const markerHeight = flattenedMarkerStyle.height || 20;
  const trackTop = (CONTAINER_HEIGHT - trackHeight) / 2;
  const markerTop = (CONTAINER_HEIGHT - markerHeight) / 2;

  const getValueFromEvent = event => {
    const node = trackRef.current;
    const rect = node?.getBoundingClientRect?.();
    const pageX = getPageX(event);
    const offsetX = rect ? pageX - rect.left : event?.nativeEvent?.locationX;
    const percent = clamp(offsetX / sliderLength, 0, 1);
    const rawValue = min + percent * range;
    const snappedValue = Math.round(rawValue / step) * step;

    return clamp(snappedValue, min, max);
  };

  const updateValue = (event, thumbIndex = activeThumbRef.current) => {
    const nextValue = getValueFromEvent(event);
    const nextValues = [...currentValues];

    if (thumbIndex === 0) {
      nextValues[0] = Math.min(nextValue, nextValues[1]);
    } else {
      nextValues[1] = Math.max(nextValue, nextValues[0]);
    }

    onValuesChange?.(nextValues);
  };

  const handleResponderGrant = event => {
    const nextValue = getValueFromEvent(event);
    const lowerDistance = Math.abs(nextValue - currentValues[0]);
    const upperDistance = Math.abs(nextValue - currentValues[1]);

    activeThumbRef.current = lowerDistance <= upperDistance ? 0 : 1;
    onValuesChangeStart?.(currentValues);
    updateValue(event, activeThumbRef.current);
  };

  const handleResponderRelease = () => {
    onValuesChangeFinish?.(currentValues);
  };

  return (
    <View
      ref={trackRef}
      style={[styles.container, {width: sliderLength}]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleResponderGrant}
      onResponderMove={event => updateValue(event)}
      onResponderRelease={handleResponderRelease}
      onResponderTerminate={handleResponderRelease}
      onResponderTerminationRequest={() => false}>
      <View
        pointerEvents="none"
        style={[
          styles.track,
          flattenedUnselectedStyle,
          {height: trackHeight, top: trackTop},
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.selectedTrack,
          flattenedSelectedStyle,
          {
            height: trackHeight,
            left: `${lowerPercent}%`,
            right: `${100 - upperPercent}%`,
            top: trackTop,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          flattenedMarkerStyle,
          styles.marker,
          styles.markerReset,
          {
            left: `${lowerPercent}%`,
            marginLeft: -markerWidth / 2,
            top: markerTop,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          flattenedMarkerStyle,
          styles.marker,
          styles.markerReset,
          {
            left: `${upperPercent}%`,
            marginLeft: -markerWidth / 2,
            top: markerTop,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    cursor: 'pointer',
    height: CONTAINER_HEIGHT,
    position: 'relative',
  },
  track: {
    borderRadius: 999,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  selectedTrack: {
    borderRadius: 999,
    position: 'absolute',
  },
  marker: {
    borderRadius: 999,
    position: 'absolute',
  },
  markerReset: {
    marginTop: 0,
  },
});

export default MultiSlider;
