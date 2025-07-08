import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function Loading() {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item width={200} height={20} borderRadius={4} />
    </SkeletonPlaceholder>
  );
}
