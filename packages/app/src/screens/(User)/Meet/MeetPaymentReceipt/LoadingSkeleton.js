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
      <View style={layout.body}>
        <View style={layout.card}>
          <Line width="75%" height={22} style={{marginBottom: 12}} />
          <Line style={layout.image} />
        </View>
        <View style={layout.divide} />
        <Repeat count={4}>
          {() => (
            <View style={layout.infoRow}>
              <Line width="22%" />
              <Line width="52%" />
            </View>
          )}
        </Repeat>
        <View style={layout.noticeBox}>
          <Copy lines={3} />
        </View>
        <Line width="35%" height={18} style={{marginBottom: 12}} />
        <Repeat>
          {() => (
            <View style={layout.priceInfoRow}>
              <Line width="28%" />
              <Line width="36%" />
            </View>
          )}
        </Repeat>
      </View>
    </SkeletonLayout>
  );
}
