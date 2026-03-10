import React, {useMemo, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const TABS = [
  {key: 'GREETING', label: '인사말'},
  {key: 'SPACE', label: '공간'},
  {key: 'LIFE', label: '생활'},
];

export default function PostTapSection({intro}) {
  const [activeTab, setActiveTab] = useState('GREETING');

  const sectionsByType = useMemo(() => {
    const list = intro?.sections ?? [];
    const grouped = {
      GREETING: [],
      SPACE: [],
      LIFE: [],
    };

    list.forEach(s => {
      if (grouped[s.sectionType]) {
        grouped[s.sectionType].push(s);
      }
    });

    Object.keys(grouped).forEach(type => {
      grouped[type] = grouped[type].sort(
        (a, b) => (a.blockOrder ?? 0) - (b.blockOrder ?? 0),
      );
    });

    return grouped;
  }, [intro]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blocks = sectionsByType[activeTab] ?? [];

  return (
    <>
      <View style={styles.tabContainer}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent}>
        {blocks.length === 0 ? (
          <Text style={styles.emptyText}>아직 작성된 내용이 없어요.</Text>
        ) : (
          blocks.map((b, i) => {
            const hasTitle = (b.title ?? '').trim().length > 0;
            const hasContent = (b.content ?? '').trim().length > 0;
            const hasImage = (b.imgUrl ?? '').trim().length > 0;

            return (
              <View key={b.sectionId ?? i} style={styles.blockBox}>
                {/* 이미지 */}
                {hasImage && (
                  <Image
                    source={{uri: b.imgUrl}}
                    style={styles.blockImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.textBox}>
                  {/* 제목 */}
                  {hasTitle && <Text style={styles.blockTitle}>{b.title}</Text>}

                  {/* 내용 */}
                  {hasContent && (
                    <Text style={styles.blockContent}>{b.content}</Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary_blue,
  },
  tabText: {
    ...FONTS.fs_14_semibold,
    color: COLORS.grayscale_500,
  },
  activeTabText: {
    color: COLORS.primary_blue,
  },

  tabContent: {
    flexDirection: 'column',
    gap: 2,
    paddingTop: 20,
  },

  emptyText: {
    ...FONTS.fs_14_regular,
    color: COLORS.grayscale_400,
    paddingVertical: 20,
    textAlign: 'center',
  },

  blockBox: {
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  blockImage: {
    paddingHorizontal: 20,
    width: '100%',
    height: 350,
    borderRadius: 10,
  },
  textBox: {
    paddingVertical: 20,
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 24,
  },
  blockTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_900,
  },
  blockContent: {
    ...FONTS.fs_16_regular,
    color: COLORS.grayscale_700,
    lineHeight: 26,
  },
});
