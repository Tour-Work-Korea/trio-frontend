import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Chips,
} from '@screens/_components/SkeletonLayout';
import applicantStyles from '@components/Employ/ApplicantDetail/ApplicantDetail.styles';

export default function ScreenSkeleton({title, layout}) {
  return (
    <SkeletonLayout title={title} style={{gap: 20}}>
      <View style={applicantStyles.sectionBox}>
        <View style={applicantStyles.basicInfoContainer}>
          <Line width="32%" height={20} />
          <Line width="20%" />
        </View>
        <View style={applicantStyles.profileMainContainer}>
          <Line style={applicantStyles.profileImageContainer} />
          <Copy lines={4} style={{flex: 1}} />
        </View>
      </View>
      <View style={applicantStyles.sectionBox}>
        <Line width="35%" style={{marginBottom: 16}} />
        <Line width="90%" height={44} />
      </View>
      <View style={applicantStyles.sectionBox}>
        <Line width="35%" style={{marginBottom: 16}} />
        <Copy lines={4} />
      </View>
      <View style={applicantStyles.sectionBox}>
        <Chips />
      </View>
      <View style={applicantStyles.sectionBox}>
        <Line width="35%" style={{marginBottom: 16}} />
        <Copy lines={4} />
      </View>
      <View style={layout.photoSection}>
        <Line width="30%" />
        <View style={layout.photoGrid}>
          <Line style={layout.photoItem} />
          <Line style={layout.photoItem} />
        </View>
      </View>
    </SkeletonLayout>
  );
}
