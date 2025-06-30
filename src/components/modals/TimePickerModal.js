import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 6 }, (_, i) => i * 10);
const meridiems = ['오전', '오후'];

const TimePickerModal = ({ visible, initialTime, onConfirm, onClose }) => {
  const [selectedHour, setSelectedHour] = useState(2);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedMeridiem, setSelectedMeridiem] = useState('오후');

  useEffect(() => {
    if (initialTime && typeof initialTime === 'string') {
      const match = initialTime.match(/(\uC624\uC804|\uC624\uD6C4) (\d{2}):(\d{2})/);
      if (match) {
        const [, meridiem, hourStr, minuteStr] = match;
        setSelectedMeridiem(meridiem);
        setSelectedHour(parseInt(hourStr, 10));
        setSelectedMinute(parseInt(minuteStr, 10));
      }
    }
  }, [initialTime]);

  const handleConfirm = () => {
    const formatted = `${selectedMeridiem} ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onConfirm(formatted);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <Picker
              selectedValue={selectedMeridiem}
              onValueChange={setSelectedMeridiem}
              style={styles.picker}
            >
              {meridiems.map((m) => (
                <Picker.Item label={m} value={m} key={m} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedHour}
              onValueChange={setSelectedHour}
              style={styles.picker}
            >
              {hours.map((h) => (
                <Picker.Item label={String(h)} value={h} key={h} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedMinute}
              onValueChange={setSelectedMinute}
              style={styles.picker}
            >
              {minutes.map((m) => (
                <Picker.Item label={String(m).padStart(2, '0')} value={m} key={m} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={[FONTS.fs_h2_bold, styles.confirmText]}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  picker: {
    flex: 1,
  },
  confirmBtn: {
    marginVertical: 16,
    alignSelf: 'center',
  },
  confirmText: {
  },
});

export default TimePickerModal;
