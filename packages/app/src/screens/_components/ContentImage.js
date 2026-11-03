import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AppImage from '@components/AppImage';
import {SkeletonBlock, SkeletonPulse} from './ContentSkeleton';

function ImageContent({style, onLoad, onError, onLoadEnd, ...props}) {
  const [settled, setSettled] = useState(false);
  return (
    <View style={[style, styles.frame]}>
      <AppImage
        {...props}
        style={StyleSheet.absoluteFillObject}
        onLoad={event => {
          setSettled(true);
          onLoad?.(event);
        }}
        onError={event => {
          setSettled(true);
          onError?.(event);
        }}
        onLoadEnd={event => {
          setSettled(true);
          onLoadEnd?.(event);
        }}
      />
      {!settled && (
        <SkeletonPulse decorative style={StyleSheet.absoluteFillObject}>
          <SkeletonBlock style={styles.placeholder} />
        </SkeletonPulse>
      )}
    </View>
  );
}

export default function ContentImage(props) {
  const sourceKey = props.uri || props.source?.uri || props.source;
  if (!sourceKey) return null;
  // Reset only when the image changes, including when a list reuses a row.
  return <ImageContent key={String(sourceKey)} {...props} />;
}

const styles = StyleSheet.create({
  frame: {overflow: 'hidden'},
  placeholder: {width: '100%', height: '100%', borderRadius: 0},
});
