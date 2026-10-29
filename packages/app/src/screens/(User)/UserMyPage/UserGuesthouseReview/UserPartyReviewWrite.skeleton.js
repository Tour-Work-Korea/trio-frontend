import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  DateColumns,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.listContent}>
      <Repeat count={2}>
        {() => (
          <View style={layout.itemContainer}>
            <Line width="80%" height={20} />
            <DateColumns style={layout.dateBox} />
            <Line width="100%" height={44} style={{marginTop: 8}} />
            <View style={layout.divider} />
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
