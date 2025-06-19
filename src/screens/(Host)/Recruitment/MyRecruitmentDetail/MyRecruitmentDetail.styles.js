import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerButtonText: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  shareButton: {
    padding: 8,
  },
  mainImageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  title: {
    ...FONTS.fs_h1_bold,
    color: COLORS.black,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLORS.light_gray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
  },
  location: {
    ...FONTS.fs_body,
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    ...FONTS.fs_body,
    marginBottom: 8,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    ...FONTS.fs_body,
    color: COLORS.gray,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.stroke_gray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.scarlet,
  },
  tabText: {
    ...FONTS.fs_h2_bold,
    color: COLORS.gray,
  },
  activeTabText: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.scarlet,
  },
  tabContent: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    flex: 2,
  },
  divider: {
    height: 0,
    backgroundColor: COLORS.stroke_gray,
  },
  sectionTitle: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  photoScroll: {
    marginBottom: 24,
  },
  workplacePhoto: {
    width: 150,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  detailSection: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.light_gray,
  },
  detailTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 12,
  },
  detailContent: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.stroke_gray,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.scarlet,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.white,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.stroke_gray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...FONTS.fs_body_bold,
    color: COLORS.gray,
  },
});

export default styles;
