import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import AdaptiveText from '@components/AdaptiveText';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import AlertModal from '@components/modals/AlertModal';
import Modal from '@components/modals/AdaptiveModal';
import Avatar from '@components/Avatar';
import {COLORS as C} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import PinIcon from '@assets/images/map_pin_gray.svg';
import PeopleIcon from '@assets/images/people_gray.svg';
import BackIcon from '@assets/images/chevron_left_gray.svg';
import {trimJejuPrefix} from '@trio/app/src/utils/formatAddress';
import useUserStore from '@stores/userStore';
import {countText, schedule} from './model';
import {newIntentKey} from './api';

export const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: C.grayscale_0},
  content: {padding: 20, paddingBottom: 40, gap: 20, flexGrow: 1},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  wrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8},
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  grow: {flex: 1, minWidth: 0},
  text: {...FONTS.fs_14_medium, color: C.grayscale_800, lineHeight: 22},
  title: {...FONTS.fs_18_semibold, color: C.grayscale_800, lineHeight: 27},
  muted: {color: C.grayscale_500},
  small: {...FONTS.fs_12_medium, color: C.grayscale_500, lineHeight: 19},
  orange: {color: C.primary_orange},
  blue: {color: C.primary_blue},
  card: {
    borderWidth: 1,
    borderColor: C.grayscale_200,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  soft: {
    backgroundColor: C.grayscale_100,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  info: {
    backgroundColor: C.secondary_blue,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: C.grayscale_100,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  selectedChip: {backgroundColor: C.primary_orange},
  selectedText: {color: C.grayscale_0},
  badge: {
    backgroundColor: C.secondary_blue,
    borderRadius: 100,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  roleBadge: {
    backgroundColor: C.grayscale_100,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  input: {
    ...FONTS.fs_14_medium,
    color: C.grayscale_800,
    borderWidth: 1,
    borderColor: C.grayscale_200,
    borderRadius: 12,
    padding: 14,
    minHeight: 48,
  },
  multiline: {minHeight: 170, textAlignVertical: 'top'},
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: C.grayscale_100,
    gap: 10,
  },
  divider: {height: 1, backgroundColor: C.grayscale_200},
  iconButton: {padding: 10, alignItems: 'center', justifyContent: 'center'},
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  error: {color: C.semantic_red},
  bubble: {
    maxWidth: '85%',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    backgroundColor: C.grayscale_100,
  },
  mine: {alignSelf: 'flex-end', backgroundColor: C.secondary_orange},
});
export const Txt = ({children, style, ...props}) => (
  <AdaptiveText variant="body" style={[styles.text, style]} {...props}>
    {children}
  </AdaptiveText>
);
export const Title = ({children, style, ...props}) => (
  <Txt style={[styles.title, style]} {...props}>
    {children}
  </Txt>
);
export const Field = ({label, ...props}) => (
  <View style={{gap: 8}}>
    <Txt>{label}</Txt>
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={C.grayscale_400}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  </View>
);
export const Chip = ({label, selected, onPress}) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityState={{selected}}
    onPress={onPress}
    style={[styles.chip, selected && styles.selectedChip]}>
    <Txt style={selected && styles.selectedText}>{label}</Txt>
  </TouchableOpacity>
);
export function Action({label, onPress, disabled, secondary, style}) {
  const {i18n} = useTranslation();
  const english = i18n.resolvedLanguage === 'en';
  return (
    <View style={style}>
      {secondary ? (
        english ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{disabled: !!disabled}}
            disabled={disabled}
            onPress={onPress}
            style={{
              backgroundColor: C.grayscale_200,
              borderRadius: 8,
              minHeight: 40,
              paddingVertical: 10,
              paddingHorizontal: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AdaptiveText
              variant="button"
              style={[
                FONTS.fs_16_semibold,
                {
                  textAlign: 'center',
                  color: disabled ? C.grayscale_400 : C.grayscale_900,
                },
              ]}>
              {label}
            </AdaptiveText>
          </TouchableOpacity>
        ) : (
          <ButtonWhite title={label} onPress={onPress} disabled={disabled} />
        )
      ) : (
        <ButtonScarlet
          title={label}
          onPress={onPress}
          disabled={disabled}
          style={english && {height: 'auto', minHeight: 44}}
        />
      )}
    </View>
  );
}
export function Screen({title, children, right, footer, onBack}) {
  const navigation = useNavigation();
  const {t} = useTranslation();
  return (
    <View style={styles.screen}>
      {right ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}>
          <TouchableOpacity onPress={onBack || (() => navigation.goBack())}>
            <BackIcon width={28} height={28} />
          </TouchableOpacity>
          <AdaptiveText
            variant="header"
            numberOfLines={2}
            style={[
              FONTS.fs_20_semibold,
              styles.grow,
              {color: C.grayscale_800},
            ]}>
            {title}
          </AdaptiveText>
          <View>{right}</View>
        </View>
      ) : (
        <Header title={title} onPress={onBack} />
      )}
      {children}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}
export function Status({item}) {
  const {t} = useTranslation();
  return (
    <View style={styles.badge}>
      <Txt style={[styles.small, styles.blue]}>
        {t(`companion.status.${item.status}`)}
      </Txt>
    </View>
  );
}
export function Meta({item, total = false}) {
  const {t} = useTranslation();
  return (
    <View style={{gap: 8}}>
      <View style={styles.row}>
        <CalendarIcon width={16} height={16} />
        <Txt style={styles.small}>{schedule(item, t)}</Txt>
      </View>
      <View style={styles.row}>
        <PinIcon width={16} height={16} />
        <Txt style={[styles.small, styles.grow]}>
          {t('companion.locationValue', {
            region: t(`companion.region.${item.regionCode}`, {
              defaultValue: item.regionCode || '',
            }),
            place: trimJejuPrefix(item.meetingPlace || ''),
          }).replace(/ · $/, '')}
        </Txt>
      </View>
      {total && (
        <View style={styles.row}>
          <PeopleIcon width={16} height={16} />
          <Txt style={[styles.small, styles.orange]}>
            {countText(
              t,
              'companion.totalPeople',
              Number(
                item.status === 'CLOSED' ? item.confirmedCount : item.capacity,
              ) + 1,
            )}
          </Txt>
        </View>
      )}
    </View>
  );
}
export function CompanionCard({item, onPress, children}) {
  const {t} = useTranslation();
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} style={{gap: 12}}>
        <View style={styles.between}>
          <Status item={item} />
          <Txt style={styles.small}>
            {t(`companion.activity.${item.activityType}`, {
              defaultValue: item.activityType,
            })}
          </Txt>
        </View>
        <Title numberOfLines={2}>{item.title}</Title>
        {item.description && <Txt numberOfLines={2}>{item.description}</Txt>}
        <Meta item={item} />
        <Txt style={[styles.small, styles.orange]}>
          {t('companion.capacityValue', {
            confirmed: item.confirmedCount,
            capacity: item.capacity,
          })}
        </Txt>
      </TouchableOpacity>
      {children}
    </View>
  );
}
export function Person({name, subtitle, uri, children}) {
  return (
    <View style={styles.row}>
      <Avatar size={38} uri={uri} />
      <View style={styles.grow}>
        <Txt>{name}</Txt>
        {subtitle && <Txt style={styles.small}>{subtitle}</Txt>}
      </View>
      {children}
    </View>
  );
}
export function useFeedback() {
  const {t} = useTranslation();
  const [dialog, setDialog] = useState(null);
  const dismiss = () => setDialog(null);
  const error = useCallback(
    errorValue => {
      const code = errorValue?.message;
      const localKey = {
        CHAT_AUTH_REQUIRED: 'companion.chatAuthRequired',
        CHAT_NOT_CONFIGURED: 'companion.chatNotConfigured',
        EDIT_IMAGES_UNAVAILABLE: 'companion.editUnavailable',
        DRAFT_PENDING: 'companion.draftPending',
      }[code];
      const status = errorValue?.response?.status;
      setDialog({
        title: t(
          localKey ||
            (status === 409
              ? 'companion.conflict'
              : status === 403
              ? 'companion.forbidden'
              : status === 404
              ? 'companion.notFound'
              : 'companion.error'),
        ),
        buttonText: t('common.confirm'),
      });
    },
    [t],
  );
  const confirm = (title, message, label, onConfirm) =>
    setDialog({
      title,
      message,
      buttonText: label,
      buttonText2: t('common.cancel'),
      onPress: () => {
        dismiss();
        onConfirm();
      },
    });
  return {
    error,
    confirm,
    inform: (title, message) =>
      setDialog({title, message, buttonText: t('common.confirm')}),
    modal: dialog?.buttonText2 ? (
      <Modal visible transparent onRequestClose={dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: C.modal_background,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}>
          <View
            style={{
              width: '100%',
              maxWidth: 360,
              backgroundColor: C.grayscale_0,
              borderRadius: 16,
              padding: 20,
              gap: 14,
            }}>
            <Title>{dialog.title}</Title>
            <Txt>{dialog.message}</Txt>
            <Action label={dialog.buttonText} onPress={dialog.onPress} />
            <Action secondary label={dialog.buttonText2} onPress={dismiss} />
          </View>
        </View>
      </Modal>
    ) : (
      <AlertModal
        visible={!!dialog}
        {...dialog}
        onPress={dialog?.onPress || dismiss}
        onPress2={dismiss}
        onRequestClose={dismiss}
      />
    ),
  };
}
export function useTask(feedback, onConflict) {
  const active = useRef(false);
  const intents = useRef(new Map());
  const [busy, setBusy] = useState(false);
  const run = async (intent, work, after) => {
    if (active.current) {
      return;
    }
    active.current = true;
    setBusy(true);
    const key = intents.current.get(intent) || newIntentKey();
    intents.current.set(intent, key);
    try {
      const result = await work(key);
      intents.current.delete(intent);
      await after?.(result);
    } catch (error) {
      // Retain the same intent on network/5xx errors. A 409 needs a fresh state before another user action.
      if (error.response?.status >= 400 && error.response?.status < 500) {
        intents.current.delete(intent);
      }
      feedback.error(error);
      if ([403, 409].includes(error.response?.status)) {
        await onConflict?.();
      }
    } finally {
      active.current = false;
      setBusy(false);
    }
  };
  return {busy, run};
}
export function useResource(loader, deps = []) {
  const focused = useIsFocused();
  const [state, setState] = useState({data: null, loading: true, error: null});
  const generation = useRef(0);
  const load = useCallback(async () => {
    const version = ++generation.current;
    setState(previous => ({...previous, loading: true, error: null}));
    try {
      const data = await loader(() => version === generation.current);
      if (version === generation.current) {
        setState({data, loading: false, error: null});
      }
      return data;
    } catch (error) {
      if (version === generation.current) {
        setState(previous => ({...previous, loading: false, error}));
      }
      return null;
    }
    // Callers explicitly provide the stable dependencies of their loader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  const previousLoader = useRef(load);
  useEffect(() => {
    if (previousLoader.current !== load) {
      previousLoader.current = load;
      setState({data: null, loading: true, error: null});
    }
    if (focused) {
      load();
    }
    return () => {
      // This ref is a request generation counter, not a rendered node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
    };
  }, [focused, load]);
  return {...state, reload: load};
}
export function ResourceBody({resource, children, empty, scroll = true}) {
  const {t} = useTranslation();
  if (resource.loading && !resource.data) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={C.primary_orange} />
        <Txt>{t('companion.loading')}</Txt>
      </View>
    );
  }
  if (resource.error) {
    return (
      <View style={styles.empty}>
        <Title>{t('companion.error')}</Title>
        <Action label={t('companion.retry')} onPress={resource.reload} />
      </View>
    );
  }
  if (!scroll) {
    return children;
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={resource.loading}
          onRefresh={resource.reload}
        />
      }>
      {children || <Txt>{empty}</Txt>}
    </ScrollView>
  );
}
export function LoginGate({navigation, children}) {
  const {t} = useTranslation();
  const token = useUserStore(state => state.accessToken);
  return token ? (
    children
  ) : (
    <View style={styles.empty}>
      <Title>{t('companion.loginRequired')}</Title>
      <Action
        label={t('common.logIn')}
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}
