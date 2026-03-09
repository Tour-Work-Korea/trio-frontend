import { StyleSheet } from 'react-native';

import { COLORS } from '@constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  nameText: {
    color: COLORS.grayscale_800,
    marginBottom: 2,
  },

  section: {
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.grayscale_500,
  },
  infoValue: {
    color: COLORS.grayscale_900,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 16,
  },
  highlightText: {
    color: COLORS.primary_orange,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginVertical: 18,
  },

  buttonRow: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  cancelButtonText: {
    color: COLORS.grayscale_900,
  },
  bottomSpacing: {
    height: 12,
  },
});

export default styles;
