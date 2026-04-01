import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import Avatar from '@components/Avatar';
import CheckIcon from '@assets/images/check_white.svg';
import PlusIcon from '@assets/images/plus_black.svg';

const GuesthouseProfileList = ({
  items = [],
  selectedId = null,
  onSelect = () => {},
  onAdd = () => {},
  addLabel = '새 게스트하우스 등록',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.rowBorder]}>
        {items.map((item, index) => {
          const isSelected = selectedId === item.id;
          const noticeCount = Number(item.noticeCount ?? 0);

          return (
            <React.Fragment key={item.id ?? `guesthouse-${index}`}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelect(item)}
                activeOpacity={0.8}>
                <View style={styles.leftSection}>
                  <View style={styles.avatarWrap}>
                    <Avatar
                      uri={item.photoUrl}
                      size={36}
                      iconSize={20}
                      style={styles.avatarImage}
                    />
                  </View>

                  <View style={styles.textWrap}>
                    <Text
                      style={[FONTS.fs_14_semibold, styles.nameText]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.name}
                    </Text>

                    <View style={styles.noticeRow}>
                      <View style={styles.noticeDot} />
                      <Text style={[FONTS.fs_12_medium, styles.noticeText]}>
                        알림 {noticeCount}개
                      </Text>
                    </View>
                  </View>
                </View>

                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <CheckIcon width={16} height={16} />
                  </View>
                ) : null}
              </TouchableOpacity>

              {index < items.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          );
        })}

        {/* 임시: 게하 프로필 추가 비활성화 */}
        {/* {items.length > 0 ? <View style={styles.divider} /> : null}

        <TouchableOpacity
          style={styles.addRow}
          onPress={onAdd}
          activeOpacity={0.8}>
          <View style={styles.addIconWrap}>
            <PlusIcon width={20} height={20} />
          </View>
          <Text style={[FONTS.fs_14_semibold, styles.addText]}>{addLabel}</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },

  rowBorder: {
    gap: 8,
    borderColor: COLORS.grayscale_200,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.grayscale_100,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
  },
  noticeRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeDot: {
    width: 4,
    height: 4,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    marginRight: 6,
  },
  noticeText: {
    color: COLORS.grayscale_500,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: COLORS.primary_orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addText: {
  },
});

export default GuesthouseProfileList;
