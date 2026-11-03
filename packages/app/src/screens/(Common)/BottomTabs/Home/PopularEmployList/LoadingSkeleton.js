import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Repeat,
  Chips,
} from '@screens/_components/SkeletonLayout';
import recruitStyles from '@components/Employ/RecruitList/RecruitList.styles';

export default function ScreenSkeleton({title}) {
  return (
    <SkeletonLayout title={title} style={{paddingHorizontal: 20}}>
      <Repeat>
        {() => (
          <View style={{marginBottom: 16}}>
            <View style={recruitStyles.jobItemContent}>
              <Line style={recruitStyles.jobImage} />
              <View style={recruitStyles.jobDetails}>
                <View style={recruitStyles.jobHeader}>
                  <Line width="60%" height={12} />
                  <Line width={20} height={20} />
                </View>
                <Line width="88%" />
                <View style={recruitStyles.jobHeader}>
                  <Line width="50%" height={12} />
                  <Line width="28%" height={12} />
                </View>
              </View>
            </View>
            <View style={recruitStyles.hashTagContainer}>
              <Chips />
            </View>
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
