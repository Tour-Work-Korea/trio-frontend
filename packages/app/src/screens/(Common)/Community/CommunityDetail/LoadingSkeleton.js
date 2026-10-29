import {COLORS} from '@constants/colors';
import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={layout.content}>
      <View style={layout.postHeader}>
        <Line
          width={32}
          height={32}
          style={{borderRadius: 16, marginRight: 8}}
        />
        <Line width="32%" />
        <Line width="20%" height={12} style={{marginLeft: 8}} />
      </View>
      <Line width="75%" height={20} style={{marginBottom: 8}} />
      <Copy lines={4} />
      <Line
        style={[
          layout.singlePostImage,
          {backgroundColor: COLORS.grayscale_200},
        ]}
      />
      <View style={layout.actionRow}>
        <Line width={46} />
        <Line width={46} />
      </View>
      <View style={layout.commentList}>
        <Repeat count={2}>
          {() => (
            <View style={layout.commentContentRow}>
              <Line
                width={32}
                height={32}
                style={{borderRadius: 16, marginRight: 10}}
              />
              <Copy lines={2} style={layout.commentBody} />
            </View>
          )}
        </Repeat>
      </View>
    </SkeletonLayout>
  );
}
