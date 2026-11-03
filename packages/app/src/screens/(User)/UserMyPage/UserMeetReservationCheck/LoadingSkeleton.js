import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, past}) {
  return (
    <SkeletonLayout title={title} style={{paddingVertical: 24}}>
      <Repeat count={2}>
        {() => (
          <View style={{paddingHorizontal: 20, marginBottom: 12}}>
            <View style={{padding: 16, borderRadius: 12}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                {!past && <Line width="35%" />}
                <Line width="40%" height={12} />
              </View>
              <Line width="80%" height={22} style={{marginBottom: 4}} />
              <Line width="65%" height={12} style={{marginBottom: 16}} />
              <Line width="100%" height={180} style={{borderRadius: 10}} />
              {!past && (
                <Line
                  width="24%"
                  height={12}
                  style={{alignSelf: 'flex-end', marginTop: 12}}
                />
              )}
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
