import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 20,
    marginRight: 18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  centerContent: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  noticeBox: {
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  noticeText: {
    color: COLORS.grayscale_900,
    lineHeight: 21,
  },
  partySectionTitle: {
    color: COLORS.grayscale_900,
    marginTop: 24,
  },
  partySectionTitleAccent: {
    color: COLORS.primary_orange,
  },
  partyList: {
    marginTop: 12,
    gap: 12,
  },
  partyCard: {
    minHeight: 116,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    gap: 12,
  },
  partyImage: {
    width: 90,
    height: 90,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
  },
  partyImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyImageText: {
    color: COLORS.grayscale_400,
  },
  partyInfo: {
    flex: 1,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  partyTitle: {
    color: COLORS.grayscale_900,
    lineHeight: 22,
  },
  partyPeopleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partyPeopleText: {
    color: COLORS.grayscale_400,
  },
  partyTime: {
    color: COLORS.primary_orange,
    alignSelf: 'flex-end',
  },
  emptyBox: {
    marginTop: 18,
    backgroundColor: COLORS.grayscale_100,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.grayscale_500,
    textAlign: 'center',
  },
});

export default styles;
