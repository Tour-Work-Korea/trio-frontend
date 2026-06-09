import {StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
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
    color: COLORS.grayscale_900,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  address: {
    flex: 1,
    color: COLORS.grayscale_500,
  },
  workDuration: {
    color: COLORS.grayscale_500,
  },
  shortDescription: {
    color: COLORS.grayscale_900,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
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
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 10,
  },
  detailCard: {
    borderRadius: 8,
    padding: 14,
    backgroundColor: COLORS.grayscale_100,
  },
  detailText: {
    color: COLORS.grayscale_900,
    lineHeight: 20,
  },
  applyButtonContainer: {
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
});

export default styles;
