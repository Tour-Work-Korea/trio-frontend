import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.listContent}>
      <Repeat>
        {() => (
          <View style={layout.card}>
            <Line style={layout.image} />
            <View style={layout.cardContent}>
              <Chips />
              <Line width="76%" height={18} />
              <Line width="88%" height={12} />
              <View style={layout.bottomRow}>
                <Line width="42%" height={18} />
              </View>
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
