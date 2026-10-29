import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
  DateColumns,
} from '@screens/_components/SkeletonLayout';

export default function ScreenSkeleton({title, cancelled}) {
  return (
    <SkeletonLayout title={title} style={{paddingVertical: 24}}>
      <Repeat count={2}>
        {() => (
          <View style={{paddingHorizontal: 20, marginBottom: 24}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
              <Line width="35%" />
              <Line width="25%" height={12} />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Line
                width={80}
                height={80}
                style={{borderRadius: 4, marginRight: 12}}
              />
              <Copy style={{flex: 1, paddingVertical: 4}} />
            </View>
            <DateColumns style={{marginTop: 12, padding: 4}} />
            <View style={{flexDirection: 'row', gap: 16, marginTop: 16}}>
              <Line width={cancelled ? '100%' : '47%'} height={44} />
              {!cancelled && <Line width="47%" height={44} />}
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
