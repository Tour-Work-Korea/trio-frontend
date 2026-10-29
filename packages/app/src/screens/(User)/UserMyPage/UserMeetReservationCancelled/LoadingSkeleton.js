import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.listContent}>
      <Repeat>
        {() => (
          <View style={layout.listStylesContainer}>
            <View style={layout.card}>
              <View style={layout.statusRow}>
                <Line width="25%" />
                <Line width="40%" height={12} />
              </View>
              <View style={layout.divide} />
              <View style={layout.infoRow}>
                <Line style={layout.image} />
                <Copy lines={2} style={layout.infoContent} />
              </View>
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
