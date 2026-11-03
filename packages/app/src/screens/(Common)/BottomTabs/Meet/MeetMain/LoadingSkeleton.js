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
          <View style={layout.guesthouseSection}>
            <View style={layout.guesthouseTitleRow}>
              <Line width="55%" height={18} />
              <Line width="20%" height={12} />
            </View>
            <View style={layout.partyList}>
              <View style={layout.partyCard}>
                <Line style={layout.partyThumb} />
                <View style={layout.partyInfo}>
                  <Copy />
                  <Line
                    width="40%"
                    height={12}
                    style={{alignSelf: 'flex-end', marginTop: 12}}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
