import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Postcode from '@actbase/react-daum-postcode';
import { COLORS } from '@constants/colors';

const AddressSearchModal = ({ visible, onClose, onSelected }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
          <Postcode
            style={{ flex: 1 }}
            jsOptions={{ animation: true }}
            onSelected={(data) => {
              onSelected(data);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
  },
  modalContainer: {
    height: '80%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  closeButtonContainer: {
    padding: 10,
    alignItems: 'flex-end',
    backgroundColor: COLORS.grayscale_0,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.grayscale_800,
  },
});

export default AddressSearchModal;
