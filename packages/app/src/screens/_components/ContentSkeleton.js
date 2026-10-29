import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {COLORS} from '@constants/colors';

// Animate the group together rather than starting a loop for every text line.
export function SkeletonPulse({children, style, title, decorative = false}) {
  const {t} = useTranslation();
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let active = true;
    let mediaQuery;
    const update = value => {
      if (active) setReduceMotion(value);
    };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      update(mediaQuery ? mediaQuery.matches : value);
    }).catch(() => {});
    const onMediaChange = event => update(event.matches);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      update(mediaQuery.matches);
      mediaQuery.addEventListener?.('change', onMediaChange);
    }
    return () => {
      active = false;
      subscription.remove();
      mediaQuery?.removeEventListener?.('change', onMediaChange);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.45,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
        isInteraction: false,
      }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <View
      style={style}
      pointerEvents="none"
      accessible={!decorative}
      accessibilityLabel={decorative ? undefined : title || t('common.loading')}
      accessibilityState={decorative ? undefined : {busy: true}}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}>
      <Animated.View style={[{opacity}, decorative && styles.fill]} accessible={false}>
        {children}
      </Animated.View>
    </View>
  );
}

export function SkeletonBlock({style}) {
  return <View style={[styles.block, style]} />;
}

function Card({horizontal = false, compact = false}) {
  return (
    <View style={horizontal ? styles.horizontalCard : compact ? styles.row : styles.card}>
      <SkeletonBlock style={compact ? styles.thumbnail : styles.photo} />
      <View style={[styles.copy, compact && styles.rowCopy]}>
        <SkeletonBlock style={styles.title} />
        <SkeletonBlock style={styles.line} />
        <SkeletonBlock style={styles.shortLine} />
      </View>
    </View>
  );
}

export default function ContentSkeleton({title, variant = 'list', count = 3}) {
  return (
    <SkeletonPulse
      title={title}
      style={[styles.container, variant === 'horizontal' && styles.section]}>
      {variant === 'banner' ? (
        <SkeletonBlock style={styles.banner} />
      ) : variant === 'horizontal' ? (
        <>
          <SkeletonBlock style={styles.sectionTitle} />
          <View style={styles.horizontal}>
            {[0, 1, 2].map(index => <Card key={index} horizontal />)}
          </View>
        </>
      ) : variant === 'detail' ? (
        <>
          <SkeletonBlock style={styles.detailPhoto} />
          <View style={styles.detailCopy}>
            <SkeletonBlock style={styles.title} />
            <SkeletonBlock style={styles.line} />
            <SkeletonBlock style={styles.shortLine} />
            <SkeletonBlock style={styles.sectionTitle} />
            <SkeletonBlock style={styles.line} />
            <SkeletonBlock style={styles.line} />
          </View>
        </>
      ) : (
        <View style={styles.list}>
          {Array.from({length: count}, (_, index) => (
            <Card key={index} compact={variant === 'rows'} />
          ))}
        </View>
      )}
    </SkeletonPulse>
  );
}

const styles = StyleSheet.create({
  fill: {width: '100%', height: '100%'},
  container: {width: '100%', overflow: 'hidden', backgroundColor: COLORS.grayscale_0},
  section: {paddingHorizontal: 16, paddingVertical: 12},
  block: {backgroundColor: COLORS.grayscale_200, borderRadius: 8},
  list: {padding: 20, gap: 24},
  card: {gap: 12},
  row: {flexDirection: 'row', gap: 12, alignItems: 'center'},
  rowCopy: {flex: 1},
  horizontal: {flexDirection: 'row', gap: 20},
  horizontalCard: {width: 249, gap: 12},
  photo: {width: '100%', height: 212, borderRadius: 12},
  thumbnail: {width: 72, height: 72, borderRadius: 12},
  copy: {gap: 10},
  title: {width: '65%', height: 20},
  line: {width: '90%', height: 14},
  shortLine: {width: '42%', height: 14},
  sectionTitle: {width: '58%', height: 24, marginBottom: 16, marginTop: 12},
  banner: {height: 120, marginHorizontal: 18, borderRadius: 12},
  detailPhoto: {width: '100%', height: 280, borderRadius: 0},
  detailCopy: {padding: 20, gap: 16},
});
