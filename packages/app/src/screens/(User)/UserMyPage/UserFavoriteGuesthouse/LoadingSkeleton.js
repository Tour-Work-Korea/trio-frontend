import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={[layout.listContiner, {gap: 0}]}>
      <Repeat>
        {() => (
          <View style={layout.card}>
            <Line style={layout.image} />
            <View style={{flex: 1, gap: 10}}>
              <Chips />
              <Line height={18} />
              <Line width="85%" height={12} />
              <Line width="45%" style={{alignSelf: 'flex-end'}} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
