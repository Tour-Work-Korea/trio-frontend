import {Platform, StyleSheet} from 'react-native';

import {COLORS} from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  submitButton: {
    minWidth: 52,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_100,
  },
  submitButtonActive: {
    backgroundColor: COLORS.primary_orange,
  },
  submitButtonText: {
    color: COLORS.grayscale_400,
  },
  submitButtonTextActive: {
    color: COLORS.grayscale_0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 62,
  },
  categoryWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  categoryButton: {
    height: 44,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  categoryButtonText: {
    color: COLORS.grayscale_700,
  },
  selectedCategoryButtonText: {
    color: COLORS.grayscale_900,
  },
  categoryMenu: {
    position: 'absolute',
    top: 42,
    left: 10,
    width: 132,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 12,
    elevation: 4,
  },
  categoryMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryMenuText: {
    color: COLORS.grayscale_700,
  },
  selectedCategoryMenuText: {
    color: COLORS.primary_orange,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.grayscale_200,
  },
  titleInput: {
    height: 52,
    paddingHorizontal: 10,
    color: COLORS.grayscale_900,
  },
  bodyInput: {
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 12,
    color: COLORS.grayscale_900,
    lineHeight: 22,
  },
  imagePreviewSection: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  imagePreviewHeader: {
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imagePreviewTitle: {
    color: COLORS.grayscale_900,
  },
  imagePreviewCount: {
    color: COLORS.grayscale_500,
  },
  imagePreviewList: {
    paddingHorizontal: 14,
    gap: 10,
  },
  imagePreviewItem: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  locationPreviewCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 18,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.grayscale_200,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_0,
  },
  locationMapPreview: {
    height: 136,
    backgroundColor: COLORS.grayscale_100,
  },
  locationMap: {
    flex: 1,
  },
  locationMapActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationMapActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale_900,
  },
  locationPreviewBody: {
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  locationPreviewTextWrap: {
    width: '100%',
  },
  locationPreviewTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 6,
  },
  locationPreviewAddress: {
    color: COLORS.grayscale_500,
  },
  bottomToolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 44,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.grayscale_200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: COLORS.grayscale_0,
  },
  bottomToolbarDetached: {
    bottom: Platform.OS === 'ios' ? 20 : 0,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarButtonText: {
    color: COLORS.grayscale_600,
  },
  keyboardHideButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageModalCloseArea: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalImage: {
    width: '100%',
    height: '100%',
  },
});

export default styles;
