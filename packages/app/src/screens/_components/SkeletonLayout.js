import React from 'react';
import {View} from 'react-native';
import {SkeletonBlock, SkeletonPulse} from './ContentSkeleton';

// Screen files own the layout; only the animation and placeholder primitives are shared.
export default function SkeletonLayout({title, style, children}) {
  return (
    <SkeletonPulse title={title} style={{width: '100%', overflow: 'hidden'}}>
      <View style={style}>{children}</View>
    </SkeletonPulse>
  );
}

export function Line({width = '70%', height = 16, style}) {
  return <SkeletonBlock style={[{width, height, flexShrink: 0}, style]} />;
}

export function Copy({lines = 3, style}) {
  return (
    <View style={[{gap: 8}, style]}>
      {Array.from({length: lines}, (_, index) => (
        <Line key={index} width={index === lines - 1 ? '52%' : '90%'} />
      ))}
    </View>
  );
}

export function Repeat({count = 3, children}) {
  return Array.from({length: count}, (_, index) => (
    <React.Fragment key={index}>{children(index)}</React.Fragment>
  ));
}

export function Chips() {
  return (
    <View style={{width: '100%', flexDirection: 'row', gap: 6}}>
      {[0, 1, 2].map(index => (
        <Line key={index} width="22%" height={24} style={{borderRadius: 12}} />
      ))}
    </View>
  );
}

export function DateColumns({style}) {
  return (
    <View style={[{flexDirection: 'row', gap: 16}, style]}>
      {[0, 1].map(index => (
        <Copy key={index} lines={2} style={{flex: 1}} />
      ))}
    </View>
  );
}
