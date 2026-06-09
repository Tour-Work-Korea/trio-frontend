import React from 'react';
import {View} from 'react-native';

export function Picker({children, ...props}) {
  return <View {...props}>{children}</View>;
}

Picker.Item = function PickerItem() {
  return null;
};

export default Picker;
