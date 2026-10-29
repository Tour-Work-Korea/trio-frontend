import React from 'react';
import {View, Platform} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={[layout.container, {flex: 0}]}>
      <Line
        style={[
          layout.mainImage,
          Platform.OS === 'web' && layout.mainImageWeb,
          {borderRadius: 0},
        ]}
      />
      <View style={layout.contentWrapper}>
        <View style={layout.nameIconContainer}>
          <Line width="65%" height={28} />
          <View style={layout.topIcons}>
            <Line width={20} height={20} />
            <Line width={20} height={20} />
          </View>
        </View>
        <Line width="85%" height={20} style={{marginBottom: 4}} />
        <Line width="42%" height={16} style={{marginBottom: 8}} />
        <View style={[layout.reviewRow, {marginTop: 20}]}>
          <Line width={100} height={22} style={{borderRadius: 11}} />
        </View>
        <View style={layout.shortIntroContainer}>
          <Copy lines={2} />
        </View>
        <View style={layout.displayDateGuestRow}>
          <Line width="48%" height={40} style={{borderRadius: 12}} />
          <Line width="48%" height={40} style={{borderRadius: 12}} />
        </View>
        <View
          style={[
            layout.tabMenuContent,
            {marginHorizontal: -20, marginBottom: 24},
          ]}>
          <Repeat count={3}>{() => <Line width={75} height={24} />}</Repeat>
        </View>
        <View style={layout.roomCard}>
          <Line style={layout.roomImage} />
          <View style={layout.roomInfo}>
            <Line width="58%" height={20} />
            <Line width="30%" height={20} />
          </View>
          <Copy lines={2} />
        </View>
      </View>
    </SkeletonLayout>
  );
}
