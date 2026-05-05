import React from 'react';
import {Platform, StyleSheet, TextInput} from 'react-native';

const androidTextInputResetStyle = StyleSheet.create({
  reset: {
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginVertical: 0,
    marginTop: 0,
    marginBottom: 0,
    includeFontPadding: false,
  },
});

if (Platform.OS === 'android' && !React.__trioAndroidTextInputPatched) {
  const originalCreateElement = React.createElement;

  React.createElement = (type, props, ...children) => {
    if (type === TextInput) {
      const nextProps = {
        ...props,
        underlineColorAndroid: props?.underlineColorAndroid ?? 'transparent',
        style: [androidTextInputResetStyle.reset, props?.style],
      };

      return originalCreateElement(type, nextProps, ...children);
    }

    return originalCreateElement(type, props, ...children);
  };

  React.__trioAndroidTextInputPatched = true;
}
