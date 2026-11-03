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
      <Repeat count={2}>
        {() => (
          <View style={layout.postContainer}>
            <View style={layout.postHeader}>
              <Line style={layout.avatar} />
              <Line width="30%" />
              <Line width="18%" height={12} style={{marginLeft: 8}} />
            </View>
            <Line width="72%" height={18} style={{marginBottom: 8}} />
            <Copy lines={2} />
            <Line style={layout.singlePostImage} />
            <View style={layout.postActions}>
              <Line width={46} />
              <Line width={46} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
