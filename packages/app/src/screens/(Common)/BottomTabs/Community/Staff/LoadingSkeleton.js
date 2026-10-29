import {COLORS} from '@constants/colors';
import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title}>
      <Repeat>
        {() => (
          <View style={layout.recruitItem}>
            <View style={layout.headerRow}>
              <View style={layout.headerInfoRow}>
                <Line
                  style={[
                    layout.avatar,
                    {backgroundColor: COLORS.grayscale_200},
                  ]}
                />
                <Line width="50%" />
              </View>
              <Line width="18%" height={12} />
            </View>
            <Line width="80%" height={18} style={{marginBottom: 10}} />
            <View style={layout.metaRow}>
              <Line width="54%" height={12} />
              <Line width="28%" height={12} />
            </View>
            <View style={layout.tagRow}>
              <Chips />
            </View>
            <View style={layout.actionRow}>
              <Line width={46} />
              <Line width={46} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
