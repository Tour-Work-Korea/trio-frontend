import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  scrollContent: {paddingHorizontal: 20, flexGrow: 1, gap: 20},
  bottomGap: {marginBottom: 40},
  photoSection: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
  },
  photoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoTitle: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  photoCount: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoUploadButton: {
    width: 92,
    height: 92,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  photoItem: {
    position: 'relative',
    width: 92,
    height: 92,
  },
  resumePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.grayscale_100,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_0,
  },
  //헤더
  headerBox: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    ...FONTS.fs_20_semibold,
    color: COLORS.grayscale_800,
  },
});

export default styles;
