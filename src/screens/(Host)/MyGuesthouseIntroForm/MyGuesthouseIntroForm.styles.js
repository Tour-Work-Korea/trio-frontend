import {StyleSheet, Platform} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

const styles = StyleSheet.create({
  outContainer: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
    flex: 1,
  },

  //섹션별 제목
  label: {
    ...FONTS.fs_14_semibold,
  },
  lengthTextAll: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_400,
    textAlign: 'right',
  },
  lengthText: {color: COLORS.primary_orange},
  rewriteText: {
    textAlign: 'right',
    color: COLORS.grayscale_500,
    ...FONTS.fs_12_medium,
  },
  sectionBox: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleBox: {flexDirection: 'row', justifyContent: 'space-between'},
  titleText: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_800,
  },
  subtitleText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_800,
  },

  //하단
  bottomText: {
    color: COLORS.primary_orange,
    ...FONTS.fs_12_medium,
    textAlign: 'center',
  },
  buttonLocation: {position: 'absolute', bottom: 20, right: 20},
  buttonContainer: {flexDirection: 'row', justifyContent: 'flex-end'},
  addButton: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 10,
    alignItems: 'center'
  },
  addButtonText: {
    color: COLORS.grayscale_800,
    ...FONTS.fs_14_medium,
  },

  //모달
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        maxHeight: '90%',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  sticky: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },

  //본문
  body: {
    gap: 20,
  },
  subsectionTitle: {
    ...FONTS.fs_16_semibold,
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 8,
  },
  dateLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  detailContainer: {
    gap: 8,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countLabel: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_600,
  },
  countInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  buttonPlMi: {
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 100,
    padding: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    padding: 12,
    maxHeight: 450,
  },
  //태그
  tagSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    alignContent: 'center',
  },
  tagOptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    padding: 10,
    width: '48%',
  },
  tagOptionText: {
    color: COLORS.grayscale_400,
  },
  tagOptionSelectedText: {
    color: COLORS.primary_orange,
  },
  addPhotoButton: {
    padding: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    width: 100,
    height: 100,
    marginBottom: 40,
  },

  photoItem: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  thumbnail: {
    borderColor: COLORS.primary_blue,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

export default styles;
