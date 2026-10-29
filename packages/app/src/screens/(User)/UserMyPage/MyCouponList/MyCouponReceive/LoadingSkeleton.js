import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.content}>
      <View style={layout.topRow}>
        <Line width="25%" />
      </View>
      <Repeat>
        {() => (
          <View style={layout.couponCard}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}>
              <View style={{flex: 1, gap: 6}}>
                <Line width="45%" height={24} />
                <Line width="80%" />
                <Line width="95%" height={12} />
              </View>
              <Line width={60} height={24} />
            </View>
            <Line width="55%" height={12} style={{marginTop: 6}} />
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
