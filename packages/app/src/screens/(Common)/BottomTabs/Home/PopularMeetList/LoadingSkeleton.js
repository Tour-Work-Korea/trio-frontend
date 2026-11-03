import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
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
          <View style={layout.meetItemContainer}>
            <View style={layout.meetTopContainer}>
              <Line style={layout.meetThumb} />
              <Copy style={layout.meetInfo} />
            </View>
            <View style={layout.meetBottomContainer}>
              <Line width="55%" height={12} />
              <Line width="28%" height={12} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
