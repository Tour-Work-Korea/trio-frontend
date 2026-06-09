import React from 'react';
import {View} from 'react-native';

const ALL_EDGES = ['top', 'right', 'bottom', 'left'];

const SAFE_AREA_STYLE_BY_EDGE = {
  top: {paddingTop: 'env(safe-area-inset-top)'},
  right: {paddingRight: 'env(safe-area-inset-right)'},
  bottom: {paddingBottom: 'env(safe-area-inset-bottom)'},
  left: {paddingLeft: 'env(safe-area-inset-left)'},
};

export function SafeAreaProvider({children}) {
  return children;
}

export function SafeAreaView({children, edges, style, ...props}) {
  const safeAreaStyle = (edges || ALL_EDGES).map(
    edge => SAFE_AREA_STYLE_BY_EDGE[edge],
  );

  return (
    <View {...props} style={[...safeAreaStyle, style]}>
      {children}
    </View>
  );
}

export function useSafeAreaInsets() {
  return {top: 0, right: 0, bottom: 0, left: 0};
}

export function useSafeAreaFrame() {
  return {x: 0, y: 0, width: 0, height: 0};
}

export const initialWindowMetrics = {
  frame: {x: 0, y: 0, width: 0, height: 0},
  insets: {top: 0, right: 0, bottom: 0, left: 0},
};
