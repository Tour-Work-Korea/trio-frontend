import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 128,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  guesthouseName: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
    marginRight: 8,
  },
  deadline: {
    color: COLORS.grayscale_400,
  },
  recruitTitle: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_900,
    lineHeight: 23,
    marginBottom: 14,
  },
  shortDescription: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  tagText: {
    color: COLORS.primary_blue,
  },
  tabSection: {
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  activeTabItem: {
    borderBottomColor: COLORS.primary_blue,
  },
  tabText: {
    color: COLORS.grayscale_700,
  },
  activeTabText: {
    color: COLORS.primary_blue,
  },
  infoCard: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.grayscale_100,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  infoLabel: {
    width: 74,
    color: COLORS.grayscale_400,
  },
  infoValue: {
    flex: 1,
    color: COLORS.grayscale_900,
    lineHeight: 18,
  },
  detailSection: {
    marginTop: 24,
  },
  detailTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 10,
  },
  detailText: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
  },
  applyButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: COLORS.grayscale_0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default styles;
