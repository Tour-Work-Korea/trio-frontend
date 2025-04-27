import {StyleSheet} from 'react-native';
import {COLORS} from '@constants/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
    fontSize: 14,
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#999999',
  },
  dropdownIcon: {
    width: 12,
    height: 12,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#999999',
  },
  dateIcon: {
    width: 20,
    height: 20,
  },
  spacer: {
    width: 10,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  countContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
  },
  countLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  ageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  ageContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
  },
  ageLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  photoSection: {
    marginTop: 15,
  },
  photoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  photoContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 14,
  },
});
