import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import SkeletonLayout, {Line, Copy, Repeat} from '@screens/_components/SkeletonLayout';
import styles from './MeetDetail.styles';

export default function DetailSkeleton() {
  const {t} = useTranslation();
  return (
    <View style={styles.rootContainer}>
      <SkeletonLayout title={t('common.loadingContent')} style={styles.container}>
        <Line width="100%" height={280} style={localStyles.hero} />
        <View style={styles.contentContainer}>
          <View style={styles.summaryCard}>
            <Line width={40} height={40} style={[styles.summaryAvatar, localStyles.avatar]} />
            <Line width="60%" height={20} style={localStyles.host} />
            <Line width="80%" height={28} style={localStyles.title} />
          </View>
          <View style={styles.scheduleBar}>
            <Line width="65%" height={20} />
          </View>
        </View>
        <View style={localStyles.tabs}>
          <Repeat count={4}>{() => <Line width="18%" height={20} />}</Repeat>
        </View>
        <View style={localStyles.body}>
          <Line width="100%" height={240} />
          <Copy lines={3} />
        </View>
      </SkeletonLayout>
    </View>
  );
}

const localStyles = StyleSheet.create({
  hero: {borderRadius: 0},
  avatar: {borderRadius: 20},
  host: {alignSelf: 'center', marginBottom: 12},
  title: {alignSelf: 'center'},
  tabs: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16},
  body: {padding: 20, gap: 20},
});
