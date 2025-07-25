import {FONTS} from '@constants/fonts';
import React from 'react';
import {Modal, View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import XBtn from '@assets/images/x_gray.svg';
import {COLORS} from '@constants/colors';

/*
화면 높이 절반까지 오는 결과 모달
*/
export default function ResultModal({visible, onClose, title, Icon}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View />
            <Text style={[FONTS.fs_20_semibold]}>{title}</Text>
            <TouchableOpacity style={styles.xBtn} onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>
          <Icon style={styles.image} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
    alignItems: 'center',
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
  image: {
    width: 168,
  },
});
