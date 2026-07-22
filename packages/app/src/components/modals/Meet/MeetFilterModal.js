import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import Modal from '@components/modals/AdaptiveModal';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';

import XBtn from '@assets/images/x_gray.svg';
import CheckedCircleIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedCircleIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';

const {height} = Dimensions.get('window');

const CATEGORY_OPTIONS = [
  {id: null, label: '전체'},
  {id: 'POTLUCK', label: '포틀럭'},
  {id: 'DINNER_PARTY', label: '디너파티'},
  {id: 'BOOK', label: '독서'},
  {id: 'WALK', label: '산책'},
];

const GUEST_OPTIONS = [
  {id: null, label: '누구나 참여'},
  {id: true, label: '숙박객 전용'},
];

const CAPACITY_OPTIONS = [
  {id: null, label: '전체', isBigParty: null},
  {id: '3-10', label: '3~10명', isBigParty: false},
  {id: '11-20', label: '11~20명', isBigParty: true},
  {id: '21-30', label: '21~30명', isBigParty: true},
  {id: '31-60', label: '31~60명', isBigParty: true},
];

const PRICE_OPTIONS = [
  {id: 'all', label: '전체'},
  {id: 'free', label: '무료', minPrice: 0, maxPrice: 0, chargeTypes: ['FREE']},
  {id: 'under10000', label: '1만원 이하', minPrice: 0, maxPrice: 10000},
  {id: 'under30000', label: '3만원 이하', minPrice: 0, maxPrice: 30000},
  {id: 'under50000', label: '5만원 이하', minPrice: 0, maxPrice: 50000},
  {id: 'custom', label: '직접 입력'},
];

const DEFAULT_FILTERS = {
  contentType: null,
  isGuest: null,
  capacityId: null,
  isBigParty: null,
  priceOption: 'all',
  minPrice: '',
  maxPrice: '',
  chargeTypes: undefined,
};

const onlyNumbers = value => String(value ?? '').replace(/[^0-9]/g, '');

const buildAppliedFilters = state => {
  const price = PRICE_OPTIONS.find(option => option.id === state.priceOption);
  const isAll = state.priceOption === 'all';
  const isCustom = state.priceOption === 'custom';

  return {
    contentTypes: state.contentType ? [state.contentType] : undefined,
    isGuest: state.isGuest,
    capacityId: state.capacityId,
    isBigParty: state.isBigParty,
    chargeTypes: isAll || isCustom ? undefined : price?.chargeTypes,
    minPrice: isAll
      ? undefined
      : isCustom
      ? state.minPrice
        ? Number(state.minPrice)
        : undefined
      : price?.minPrice,
    maxPrice: isAll
      ? undefined
      : isCustom
      ? state.maxPrice
        ? Number(state.maxPrice)
        : undefined
      : price?.maxPrice,
  };
};

const MeetFilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  initialScrollTarget,
}) => {
  const {
    scrollRef,
    contentContainerStyle: keyboardAwareContentStyle,
  } = useKeyboardAwareScrollView({
    basePaddingBottom: 180,
    extraScrollOffset: 40,
    scrollDelay: 160,
    iosOnly: false,
  });
  const sectionPositionsRef = useRef({});

  const initialState = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...(initialFilters ?? {}),
      contentType: initialFilters?.contentTypes?.[0] ?? null,
      priceOption: initialFilters?.hasApplied
        ? initialFilters?.priceOption ?? DEFAULT_FILTERS.priceOption
        : DEFAULT_FILTERS.priceOption,
      minPrice:
        initialFilters?.hasApplied && initialFilters?.minPrice != null
          ? String(initialFilters.minPrice)
          : '',
      maxPrice:
        initialFilters?.hasApplied && initialFilters?.maxPrice != null
          ? String(initialFilters.maxPrice)
          : '',
    }),
    [initialFilters],
  );

  const [filters, setFilters] = useState(initialState);
  const isCustomPrice = filters.priceOption === 'custom';

  const isDirty = useMemo(
    () =>
      JSON.stringify(buildAppliedFilters(filters)) !==
      JSON.stringify(buildAppliedFilters(initialState)),
    [filters, initialState],
  );

  const setFilter = next => {
    setFilters(prev => ({
      ...prev,
      ...next,
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const scrollToSection = useCallback(key => {
    const y = sectionPositionsRef.current[key] ?? 0;

    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo?.({
          y: Math.max(0, y - 12),
          animated: true,
        });
      }, 180);
    });
  }, [scrollRef]);

  const scrollToPriceInput = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({animated: true});
      }, 220);
    });
  }, [scrollRef]);

  const registerSection = key => ({
    onLayout: e => {
      sectionPositionsRef.current[key] = e?.nativeEvent?.layout?.y ?? 0;
    },
  });

  const renderRadio = selected =>
    selected ? (
      <CheckedCircleIcon width={24} height={24} />
    ) : (
      <UncheckedCircleIcon width={24} height={24} />
    );

  useEffect(() => {
    if (visible) {
      setFilters(initialState);
    }
  }, [visible, initialState]);

  useEffect(() => {
    if (!visible || !initialScrollTarget) {
      return;
    }

    scrollToSection(initialScrollTarget);
  }, [initialScrollTarget, scrollToSection, visible]);

  const renderRadioOption = ({key, label, selected, onPress}) => (
    <TouchableOpacity
      activeOpacity={1}
      key={key}
      style={styles.radioOption}
      onPress={onPress}>
      {renderRadio(selected)}
      <Text style={[FONTS.fs_14_medium, styles.radioLabel]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderPriceChip = option => {
    const selected = filters.priceOption === option.id;

    return (
      <TouchableOpacity
        activeOpacity={1}
        key={option.id}
        style={[styles.priceChip, selected && styles.priceChipSelected]}
        onPress={() => {
          setFilter({
            priceOption: option.id,
            minPrice:
              option.id === 'custom'
                ? filters.minPrice
                : String(option.minPrice ?? ''),
            maxPrice:
              option.id === 'custom'
                ? filters.maxPrice
                : String(option.maxPrice ?? ''),
            chargeTypes: option.chargeTypes,
          });
          if (option.id === 'custom') {
            scrollToPriceInput();
          }
        }}>
        <Text
          style={[
            FONTS.fs_13_medium,
            styles.priceChipText,
            selected && styles.priceChipTextSelected,
          ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold]}>필터</Text>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.xBtn}
              onPress={onClose}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardAwareContentStyle,
            ]}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled">
            <View style={styles.section} {...registerSection('category')}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                카테고리
              </Text>
              <View style={styles.radioGrid}>
                {CATEGORY_OPTIONS.map(option =>
                  renderRadioOption({
                    key: option.label,
                    label: option.label,
                    selected: filters.contentType === option.id,
                    onPress: () => setFilter({contentType: option.id}),
                  }),
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section} {...registerSection('guest')}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                참여 대상
              </Text>
              <View style={styles.segmented}>
                {GUEST_OPTIONS.map(option => {
                  const selected = filters.isGuest === option.id;

                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      key={option.label}
                      style={styles.segment}
                      onPress={() => setFilter({isGuest: option.id})}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.segmentText,
                          selected && styles.segmentTextSelected,
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section} {...registerSection('capacity')}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                정원
              </Text>
              <View style={styles.radioGrid}>
                {CAPACITY_OPTIONS.map(option =>
                  renderRadioOption({
                    key: option.label,
                    label: option.label,
                    selected: filters.capacityId === option.id,
                    onPress: () =>
                      setFilter({
                        capacityId: option.id,
                        isBigParty: option.isBigParty,
                      }),
                  }),
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section} {...registerSection('price')}>
              <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                가격 범위
              </Text>
              <View style={styles.priceRow}>
                {PRICE_OPTIONS.map(renderPriceChip)}
              </View>

              {isCustomPrice && (
                <View style={styles.customPriceRow}>
                  <TextInput
                    value={filters.minPrice}
                    onChangeText={value =>
                      setFilter({minPrice: onlyNumbers(value)})
                    }
                    onFocus={scrollToPriceInput}
                    placeholder="최소 금액"
                    placeholderTextColor={COLORS.grayscale_400}
                    keyboardType="number-pad"
                    style={[FONTS.fs_14_medium, styles.priceInput]}
                  />
                  <Text style={[FONTS.fs_14_medium, styles.priceDivider]}>
                    ~
                  </Text>
                  <TextInput
                    value={filters.maxPrice}
                    onChangeText={value =>
                      setFilter({maxPrice: onlyNumbers(value)})
                    }
                    onFocus={scrollToPriceInput}
                    placeholder="최대 금액"
                    placeholderTextColor={COLORS.grayscale_400}
                    keyboardType="number-pad"
                    style={[FONTS.fs_14_medium, styles.priceInput]}
                  />
                  <Text style={[FONTS.fs_14_medium, styles.wonText]}>원</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.sticky}>
            <View style={styles.resetButton}>
              <ButtonWhite
                title="초기화"
                onPress={handleReset}
                disabled={!isDirty}
              />
            </View>
            <View style={styles.confirmButton}>
              <ButtonScarlet
                title="콘텐츠 보기"
                onPress={() => {
                  onApply({
                    ...buildAppliedFilters(filters),
                    hasApplied: true,
                    priceOption: filters.priceOption,
                  });
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MeetFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  container: {
    height: height * 0.9,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  xBtn: {
    position: 'absolute',
    right: 0,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 16,
  },
  divider: {
    height: 0.8,
    backgroundColor: COLORS.grayscale_200,
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  radioOption: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioLabel: {
    color: COLORS.grayscale_900,
  },
  segmented: {
    height: 42,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    color: COLORS.grayscale_400,
  },
  segmentTextSelected: {
    color: COLORS.primary_orange,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceChipSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  priceChipText: {
    color: COLORS.grayscale_900,
  },
  priceChipTextSelected: {
    color: COLORS.grayscale_0,
  },
  customPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 14,
    color: COLORS.grayscale_900,
  },
  priceDivider: {
    color: COLORS.grayscale_500,
  },
  wonText: {
    color: COLORS.grayscale_900,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  resetButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 3,
  },
});
