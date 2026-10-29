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
      <Repeat>
        {() => (
          <View
            style={[layout.itemWrap, {paddingBottom: 16, marginBottom: 16}]}>
            <View style={layout.itemTopWrap}>
              <Line style={layout.thumbnail} />
              <View style={layout.infoWrap}>
                <Copy lines={2} />
                <Line
                  width="40%"
                  style={{alignSelf: 'flex-end', marginTop: 16}}
                />
              </View>
            </View>
            <View style={layout.itemBottomWrap}>
              <Line width="55%" height={12} />
              <Line width="28%" height={12} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
