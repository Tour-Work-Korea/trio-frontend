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
          <View style={[layout.colWrap, {flexDirection: 'row'}]}>
            <Repeat count={2}>
              {() => (
                <View style={layout.card}>
                  <Line style={layout.thumb} />
                  <View style={layout.cardBody}>
                    <Copy lines={2} />
                    <View style={layout.bottomRow}>
                      <Line width={30} height={30} style={{borderRadius: 15}} />
                      <Line width="55%" height={12} />
                    </View>
                  </View>
                </View>
              )}
            </Repeat>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
