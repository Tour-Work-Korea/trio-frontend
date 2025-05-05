import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#ADB5BD',
  },
  activeText: {
    color: '#212529',
  },
  addButton: {
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#212529',
  },
  spacer: {
    width: 16,
  },
  countRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  countContainer: {
    flex: 1,
  },
  countLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#495057',
  },
  ageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ageContainer: {
    flex: 1,
  },
  ageLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#495057',
  },
  photoSection: {
    marginTop: 8,
  },
  photoLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#495057',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  addPhotoContainer: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#4263EB',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default styles;
