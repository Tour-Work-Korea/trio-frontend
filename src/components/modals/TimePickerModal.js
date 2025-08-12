import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';

// 데이터 주고 받을 때 로컬 타임으로 주고받음 initialValue
// 분 기본 15분 단위로 되어있음

// visible,
// initialValue = '00:00:00',
// onClose,
// onConfirm,
// 위 4가지만 입력해도 됨

// 포멧 함수 있음 부모에서 사용
// import { formatLocalTimeToKorean12Hour } from '@utils/formatDate';

export default function TimePickerModal({
  visible,
  initialValue = '00:00:00',
  onClose,
  onConfirm,
  minuteStep = 15,
  labels = { am: '오전', pm: '오후', hour: '시', minute: '분' }
}) {
  const parsed = useMemo(() => parseTime(initialValue), [initialValue]);

  const minuteOptions = useMemo(() => {
    const arr = [];
    const step = Math.max(1, minuteStep);
    for (let m = 0; m < 60; m += step) arr.push(m);
    return arr;
  }, [minuteStep]);

  const [ampm, setAmpm] = useState(parsed.ampm);
  const [hour12, setHour12] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [second, setSecond] = useState(parsed.second);

  useEffect(() => {
    const p = parseTime(initialValue);
    setAmpm(p.ampm);
    setHour12(p.hour12);
    setMinute(p.minute);
    setSecond(p.second);
  }, [initialValue]);

  const handleApply = () => {
    const hour24 = to24Hour(ampm, hour12);
    const newValue = fmtTime(hour24, minute, second);
    onConfirm?.(newValue);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={{ flexDirection: 'row' }}>
                {/* 오전/오후 */}
                <Picker selectedValue={ampm} onValueChange={setAmpm} style={{ flex: 1 }}>
                  <Picker.Item label={labels.am} value="AM" />
                  <Picker.Item label={labels.pm} value="PM" />
                </Picker>
                {/* 시 */}
                <Picker selectedValue={hour12} onValueChange={setHour12} style={{ flex: 1 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <Picker.Item key={h} label={String(h)} value={h} />
                  ))}
                </Picker>
                {/* 분 */}
                <Picker selectedValue={minute} onValueChange={setMinute} style={{ flex: 1 }}>
                  {minuteOptions.map((m) => (
                    <Picker.Item key={m} label={pad2(m)} value={m} />
                  ))}
                </Picker>
              </View>

              <ButtonScarlet
                title="적용하기"
                onPress={handleApply}
                style={{ marginTop: 16 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function parseTime(str) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(String(str || ''));
  let hour24 = 0, minute = 0, second = 0;
  if (m) {
    hour24 = Number(m[1]);
    minute = Number(m[2]);
    second = Number(m[3]);
  }
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour24, minute, second, ampm, hour12 };
}

function to24Hour(ampm, hour12) {
  const h = Number(hour12) || 12;
  if (ampm === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function fmtTime(hour24, minute, second = 0) {
  return `${pad2(hour24)}:${pad2(minute)}:${pad2(second)}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16
  }
});
