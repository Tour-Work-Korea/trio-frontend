import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyState from '@components/EmptyState';

import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';
import EmptyIcon from '@assets/images/wa_blue_apply.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.8);

const MeetLocationModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialGuesthouseId = null,
}) => {
  // 게하 리스트 상태
  const [guesthouseList, setGuesthouseList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [appliedId, setAppliedId] = useState(null); // 마지막으로 적용한 ID 저장

  // 모달 열릴 때 데이터 불러오기 + 선택 복원
  useEffect(() => {
    if (!visible) return;
    let mounted = true;

    const fetchMyGuesthouses = async () => {
      try {
        const res = await hostGuesthouseApi.getMyGuesthouses();
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;
        setGuesthouseList(list);

        const targetId = appliedId ?? initialGuesthouseId ?? null;

        // 적용값이 있으면 선택 복원
        if (targetId) {
          const exists = list.some(g => String(g.id) === String(targetId));
          setSelectedId(exists ? targetId : null);
        } else if (list.length > 0) {
          // 기본은 미선택 상태
          setSelectedId(null);
        }
      } catch (e) {
        if (!mounted) return;
        setGuesthouseList([]);
        setSelectedId(null);
      }
    };

    fetchMyGuesthouses();
    return () => {
      mounted = false;
    };
  }, [visible, appliedId]);

  // 단순 닫기
  const handleModalClose = () => {
    if (shouldResetOnClose) {
      // 적용 안 하고 닫을 때는 마지막 적용값으로 되돌림
      setSelectedId(appliedId ?? null);
    }
    onClose();
  };

  // 등록 버튼 (적용)
  const handleConfirm = () => {
    if (!selectedId) return;
    onSelect({guesthouseId: selectedId});

    // 적용값 저장 후 닫기
    setAppliedId(selectedId);
    onClose();
  };

  // 게하 리스트
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => setSelectedId(item.id)}>
      {selectedId === item.id ? (
        <EnabledRadioButton width={28} height={28} />
      ) : (
        <DisabledRadioButton width={28} height={28} />
      )}
      <Image source={{uri: item.thumbnailImg}} style={styles.itemImage} />
      <View style={styles.itemTextContainer}>
        <Text style={[FONTS.fs_16_semibold, styles.itemName]}>
          {item.guesthouseName}
        </Text>
        <Text style={[FONTS.fs_12_medium, styles.itemAddress]}>
          {item.guesthouseAddress} {item.guesthouseDetailAddress}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const listEmpty = guesthouseList.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {/* 헤더 */}
              <View style={styles.header}>
                <Text style={[FONTS.fs_20_semibold]}>이벤트 장소</Text>
                <TouchableOpacity
                  style={styles.XBtn}
                  onPress={handleModalClose}>
                  <XBtn width={24} height={24} />
                </TouchableOpacity>
              </View>

              {/* 설명 문구 */}
              <Text style={[FONTS.fs_16_medium, styles.modalTitle]}>
                이벤트 장소를 선택해 주세요
              </Text>

              {/* 리스트 */}
              <FlatList
                data={guesthouseList}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{height: 16}} />}
                contentContainerStyle={
                  listEmpty
                    ? [
                        styles.listContainer,
                        {flex: 1, justifyContent: 'center'},
                      ]
                    : styles.listContainer
                }
                ListEmptyComponent={
                  <EmptyState
                    icon={EmptyIcon}
                    iconSize={{width: 188, height: 84}}
                    title="입점된 게스트하우스가 없어요"
                    description="게스트하우스를 등록해주세요!"
                  />
                }
              />

              {/* 등록하기 버튼 */}
              <ButtonScarlet
                title={'등록하기'}
                onPress={handleConfirm}
                disabled={!selectedId}
                style={{marginBottom: 16}}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetLocationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 헤더
  header: {
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  XBtn: {
    position: 'absolute',
    right: 0,
  },

  // 설명 문구
  modalTitle: {
    marginTop: 20,
    marginBottom: 20,
    color: COLORS.grayscale_600,
  },

  listContainer: {},
  // 리스트
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginLeft: 12,
  },
  itemTextContainer: {
    marginLeft: 12,
    alignItems: 'flex-start',
    height: '100%',
  },
  itemName: {
    marginBottom: 4,
  },
  itemAddress: {
    color: COLORS.grayscale_500,
  },
});
