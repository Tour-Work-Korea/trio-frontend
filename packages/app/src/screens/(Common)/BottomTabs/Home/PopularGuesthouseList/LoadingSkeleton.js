import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title}>
      <View
        style={[
          layout.headerContainer,
          {
            backgroundColor: 'transparent',
            padding: 20,
            justifyContent: 'space-between',
          },
        ]}>
        <Line width="55%" height={20} style={{alignSelf: 'center'}} />
        <Copy lines={2} />
      </View>
      <Line width="50%" height={20} style={layout.title} />
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <Line style={layout.trendingImage} />
        <Copy lines={2} style={{marginTop: 10}} />
      </View>
      <View style={layout.indicatorContainer}>
        <Line width={6} height={6} />
        <Line width={6} height={6} />
        <Line width={6} height={6} />
      </View>
      <Line width="55%" height={20} style={layout.title} />
      <Repeat>
        {() => (
          <View style={layout.popularCard}>
            <Line style={layout.popularImage} />
            <View style={layout.popularInfo}>
              <Chips />
              <Line width="75%" height={18} />
              <Line width="90%" height={12} />
              <Line width="45%" style={{alignSelf: 'flex-end'}} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
