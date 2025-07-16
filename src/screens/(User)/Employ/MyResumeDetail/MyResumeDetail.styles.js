import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
    paddingTop: 30,
  },
  //헤더
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 40,
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
  pageTitle: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  //프로필

  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6E9F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileName: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    ...FONTS.fs_body,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  infoValueHashtag: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
    flex: 1,
    textAlign: 'right',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.fs_h2_bold,
    color: COLORS.black,
    marginBottom: 16,
  },
  experienceTotal: {
    ...FONTS.fs_body,
    color: COLORS.scarlet,
    marginLeft: 8,
    marginBottom: 16,
  },
  experienceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.scarlet,
    marginTop: 6,
    marginRight: 12,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 18,
    width: 2,
    height: '100%',
    backgroundColor: COLORS.scarlet,
    zIndex: 1,
  },
  lastTimelineLine: {
    display: 'none',
  },
  experienceContent: {
    flex: 1,
  },
  experiencePeriod: {
    ...FONTS.fs_body,
    color: COLORS.gray,
    marginBottom: 4,
  },
  experienceCompany: {
    ...FONTS.fs_body_bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  experienceDuties: {
    ...FONTS.fs_body,
    color: COLORS.black,
  },
  introductionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  introductionText: {
    ...FONTS.fs_body,
    color: COLORS.black,
    lineHeight: 22,
  },
  attachmentButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentText: {
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
