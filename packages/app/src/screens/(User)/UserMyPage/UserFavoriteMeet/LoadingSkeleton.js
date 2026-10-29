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
    <SkeletonLayout title={title}>
      <Repeat>
        {() => (
          <View style={{marginBottom: 16}}>
            <View style={{flexDirection: 'row'}}>
              <Line
                style={[
                  layout.thumbnail,
                  {backgroundColor: COLORS.grayscale_200},
                ]}
              />
              <View style={layout.middle}>
                <Copy />
                <Line width="40%" style={{alignSelf: 'flex-end'}} />
              </View>
            </View>
            <View style={layout.down}>
              <Line width="60%" height={12} />
              <Line width="25%" height={12} />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
