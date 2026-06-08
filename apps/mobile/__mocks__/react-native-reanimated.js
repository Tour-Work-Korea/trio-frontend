const React = require('react');
const {View} = require('react-native');

const Reanimated = {
  View,
  Text: require('react-native').Text,
  ScrollView: require('react-native').ScrollView,
  Image: require('react-native').Image,
  createAnimatedComponent: component => component,
  useSharedValue: initialValue => ({value: initialValue}),
  useAnimatedStyle: updater => updater(),
  useAnimatedProps: updater => updater(),
  useDerivedValue: updater => ({value: updater()}),
  withTiming: value => value,
  withSpring: value => value,
  withDelay: (_delay, value) => value,
  withSequence: (...values) => values[values.length - 1],
  runOnJS: fn => fn,
  Easing: {
    linear: t => t,
    out: fn => fn,
    exp: t => t,
    bezier: () => t => t,
  },
};

module.exports = Reanimated;
module.exports.default = Reanimated;
