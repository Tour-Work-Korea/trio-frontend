import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.grayscale_100,
  },
  headerBox: {
    paddingHorizontal: 20,
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 1,
    gap: 12,
  },
  //이력서 리스트
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_400,
  },
  resumeItem: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  resumeLeftSection: {
    justifyContent: 'center',
  },
  resumeMiddleSection: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'column',
    gap: 12,
    flex: 1,
  },
  resumeTitle: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
  },
  //태그
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tagText: {
    ...FONTS.fs_12_medium,
    color: COLORS.primary_blue,
    backgroundColor: COLORS.grayscale_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  //수정
  modifiedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modifiedTextBox: {
    flexDirection: 'row',
    gap: 8,
  },
  lastModifiedText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  editButton: {
    justifyContent: 'center',
    padding: 4,
  },
});
