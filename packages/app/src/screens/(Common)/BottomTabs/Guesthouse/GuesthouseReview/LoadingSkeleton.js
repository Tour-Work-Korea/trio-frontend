import React from 'react';
import {View} from 'react-native';
import SkeletonLayout, {
  Line,
  Copy,
  Repeat,
} from '@screens/_components/SkeletonLayout';
import styles from './GuesthouseReview.styles';

export default function ReviewLoadingSkeleton({title, count = 2}) {
  return (
    <SkeletonLayout title={title}>
      <Repeat count={count}>
        {() => (
          <View style={styles.reviewContainer}>
            <View style={styles.reviewHeaderContainer}>
              <View style={[styles.userProfileContainer, {flex: 1}]}>
                <Line width={44} height={44} style={{borderRadius: 22}} />
                <Line width="45%" height={14} style={{marginLeft: 12}} />
              </View>
              <Line width={58} height={22} style={{borderRadius: 11}} />
            </View>
            <View
              style={[
                styles.reviewImageContainer,
                {gap: 4, overflow: 'hidden'},
              ]}>
              <Line style={styles.reviewImage} />
              <Line style={styles.reviewImage} />
            </View>
            <Copy lines={3} style={{marginTop: 10}} />
          </View>
        )}
      </Repeat>
    </SkeletonLayout>
  );
}
