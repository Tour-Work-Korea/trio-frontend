import {COLORS} from '@constants/colors';
import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.content}>
      <View style={layout.postHeader}>
        <Line
          style={[layout.avatar, {backgroundColor: COLORS.grayscale_200}]}
        />
        <Line width="40%" />
        <Line width="18%" height={12} style={{marginLeft: 8}} />
      </View>
      <Line width="82%" height={22} style={{marginBottom: 14}} />
      <Copy lines={2} />
      <View style={[layout.tagRow, {marginTop: 16}]}>
        <Chips />
      </View>
      <View style={[layout.tabRow, {justifyContent: 'space-between'}]}>
        <Line width="45%" />
        <Line width="45%" />
      </View>
      <View style={layout.infoCard}>
        <Repeat count={4}>
          {() => (
            <View style={layout.infoRow}>
              <Line width={60} height={14} style={{marginRight: 14}} />
              <Line width="58%" height={14} />
            </View>
          )}
        </Repeat>
      </View>
      <View style={layout.detailSection}>
        <Line width="35%" height={18} style={{marginBottom: 10}} />
        <Copy lines={4} />
      </View>
    </SkeletonLayout>
  );
}
