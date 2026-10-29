import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {Line, Copy} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={[layout.container, {flex: 0}]}>
      <Line width="100%" height={280} style={{borderRadius: 0}} />
      <View style={[layout.contentContainer, {paddingTop: 20}]}>
        <Line width="80%" height={24} style={{marginBottom: 8}} />
        <Line width="60%" height={14} />
        <View style={{padding: 8, marginTop: 12}}>
          <Copy lines={3} />
        </View>
        <View style={layout.devide} />
        <View style={{flexDirection: 'row', gap: 12, marginBottom: 20}}>
          <Line width="30%" />
          <Line width="30%" />
          <Line width="30%" />
        </View>
        <Copy lines={5} />
        <View style={layout.devide} />
        <Copy lines={3} />
      </View>
    </SkeletonLayout>
  );
}
