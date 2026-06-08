import React from 'react';
import {Image, ScrollView, Text, View} from 'react-native';

const passthrough = value => value;

const Reanimated = {
  View,
  Text,
  ScrollView,
  Image,
  createAnimatedComponent: component => component,
  useSharedValue: initialValue => ({value: initialValue}),
  useAnimatedStyle: updater => updater(),
  useAnimatedProps: updater => updater(),
  useDerivedValue: updater => ({value: updater()}),
  useAnimatedRef: () => React.createRef(),
  useAnimatedScrollHandler: handler => handler,
  withTiming: passthrough,
  withSpring: passthrough,
  withDelay: (_delay, value) => value,
  withSequence: (...values) => values[values.length - 1],
  runOnJS: fn => fn,
  Easing: {
    linear: passthrough,
    out: fn => fn,
    exp: passthrough,
    bezier: () => passthrough,
  },
};

export const {
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} = Reanimated;

export default Reanimated;
