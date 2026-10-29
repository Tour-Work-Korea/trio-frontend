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
      <Repeat count={2}>
        {() => (
          <View style={{marginBottom: 32}}>
            <View style={layout.cardHeader}>
              <Copy lines={3} style={layout.partyInfo} />
              <View style={layout.headerActions}>
                <Line width={56} height={24} style={{borderRadius: 12}} />
                <Line width={24} height={24} />
              </View>
            </View>
            <View style={layout.reviewBox}>
              <Copy lines={3} />
              <View style={[layout.imageRow, {flexDirection: 'row', gap: 12}]}>
                <Line style={layout.reviewImage} />
                <Line style={layout.reviewImage} />
              </View>
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
