import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
  DateColumns,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={{paddingVertical: 24}}>
      <Repeat count={2}>
        {() => (
          <View style={layout.container}>
            <View style={layout.guesthouseInfo}>
              <Line style={layout.image} />
              <Copy style={layout.infoContent} />
            </View>
            <DateColumns style={layout.dateContent} />
            <Line width="100%" height={44} style={{marginTop: 8}} />
            <View style={layout.devide} />
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
