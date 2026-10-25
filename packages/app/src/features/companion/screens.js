import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Text,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import Modal from '@components/modals/AdaptiveModal';
import DatePicker from '@components/Employ/DatePicker';
import AppImage from '@components/AppImage';
import communityApi from '@utils/api/communityApi';
import CommunityDetailScreen from '../../screens/(Common)/Community/CommunityDetail';
import homeStyles from '../../screens/(Common)/BottomTabs/Home/HomeMain/Home.styles';
import communityStyles from '../../screens/(Common)/BottomTabs/Community/Community.styles';
import {CompanionPost, CompanionPostInfo} from './communityPost';
import {loadCompanionFeedPage} from './communityFeed';
import {MyCompanionCard} from './myCompanionUi';
import {postSchedule} from './communityPost';
import useUserStore from '@stores/userStore';
import {COLORS as C} from '@constants/colors';
import {formatNumber, formatDate} from '@utils/localeFormat';
import writeStyles from '../../screens/(Common)/Community/CommunityWrite/CommunityWrite.styles';
import {FONTS} from '@constants/fonts';
import UpIcon from '@assets/images/chevron_up_gray.svg';
import DownIcon from '@assets/images/chevron_down_gray.svg';
import PlaceOrangeIcon from '@assets/images/map_pin_fill_orange.svg';
import ChatIcon from '@assets/images/chat_bubbles_black.svg';
import ChatBlueIcon from '@assets/images/chat_bubbles_blue.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';
import CloseIcon from '@assets/images/x_gray.svg';
import {
  companionApi,
  chatApi,
  companionEnabled,
  newIntentKey,
  uploadPostImages,
} from './api';
import {
  ACTIVITIES,
  REGIONS,
  countText,
  dateKey,
  displayDate,
  displayTime,
  hasAction,
  kstDate,
  roomForAccess,
  validateDraft,
} from './model';
import {
  Action,
  Chip,
  Field,
  LoginGate,
  Meta,
  Person,
  ResourceBody,
  Screen,
  Status,
  Title,
  Txt,
  styles as s,
  useFeedback,
  useResource,
  useTask,
} from './ui';

const goCompanions = navigation =>
  navigation.navigate('MainTabs', {
    screen: '커뮤니티',
    params: {tab: 'COMPANION'},
  });
export function ChatEntry({navigation, label}) {
  const {t} = useTranslation();
  const focused = useIsFocused();
  const token = useUserStore(state => state.accessToken);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    setUnreadCount(0);
    if (!focused || !token) {
      return;
    }
    let disposed = false;
    let busy = false;
    let appState = AppState.currentState;
    const refresh = async () => {
      if (disposed || busy || (appState && appState !== 'active')) {
        return;
      }
      busy = true;
      try {
        const {data} = await chatApi.list();
        if (!disposed) {
          setUnreadCount(
            (Array.isArray(data) ? data : []).reduce((total, room) => {
              const count = Number(room.unreadCount);
              return total + (Number.isFinite(count) ? Math.max(0, count) : 0);
            }, 0),
          );
        }
      } catch {
        // A transient chat failure must not hide the community screen.
      } finally {
        busy = false;
      }
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    const subscription = AppState.addEventListener('change', nextState => {
      appState = nextState;
      if (nextState === 'active') {
        refresh();
      }
    });
    return () => {
      disposed = true;
      clearInterval(timer);
      subscription.remove();
    };
  }, [focused, token]);
  return (
    <TouchableOpacity
      style={s.iconButton}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? t('companion.inbox.unreadLabel', {value: formatNumber(unreadCount)})
          : label || t('companion.inbox')
      }
      onPress={() => navigation.navigate('CompanionInbox')}>
      <ChatIcon width={24} height={24} />
      {unreadCount > 0 && (
        <View
          pointerEvents="none"
          style={[homeStyles.unreadBadge, {top: 3, right: 3}]}>
          <Text style={homeStyles.unreadBadgeText}>
            {unreadCount > 99
              ? t('companion.inbox.countOverflow', {value: formatNumber(99)})
              : formatNumber(unreadCount)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
export function CompanionList({isActive = true, selectedSort = 'LATEST'}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const advancing = useRef(false);
  const resource = useResource(
    async isCurrent => {
      if (!isActive) {
        return null;
      }
      try {
        const result = await loadCompanionFeedPage(page, isCurrent);
        if (!isCurrent()) {
          return null;
        }
        setItems(previous =>
          page
            ? [
                ...previous.filter(
                  item =>
                    !result.content.some(
                      next => next.companionId === item.companionId,
                    ),
                ),
                ...result.content,
              ]
            : result.content,
        );
        return result;
      } finally {
        advancing.current = false;
      }
    },
    [page, isActive],
  );
  const sorted = [...items].sort((a, b) => {
    const difference =
      (a.post.createdAt ? +kstDate(a.post.createdAt) : 0) -
      (b.post.createdAt ? +kstDate(b.post.createdAt) : 0);
    return selectedSort === 'OLDEST' ? difference : -difference;
  });
  const refresh = () => {
    if (page) {
      setPage(0);
    } else {
      resource.reload();
    }
  };
  return (
    <View style={s.screen}>
      <ResourceBody
        resource={{
          ...resource,
          data: resource.data || (items.length ? {} : null),
        }}
        scroll={false}>
        <FlatList
          data={sorted}
          keyExtractor={item => String(item.companionId)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={communityStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={resource.loading} onRefresh={refresh} />
          }
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (
              !advancing.current &&
              !resource.loading &&
              resource.data?.last === false
            ) {
              advancing.current = true;
              setPage(value => value + 1);
            }
          }}
          renderItem={({item}) => (
            <CompanionPost
              item={item}
              onPress={() =>
                navigation.navigate('CompanionDetail', {
                  companionId: item.companionId,
                })
              }
            />
          )}
          ListEmptyComponent={
            <Txt style={communityStyles.emptyText}>
              {t('companion.listEmpty')}
            </Txt>
          }
          ListFooterComponent={
            resource.loading && items.length > 0 ? (
              <ActivityIndicator color={C.grayscale_500} />
            ) : null
          }
        />
      </ResourceBody>
    </View>
  );
}

export function CompanionDetail({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const feedback = useFeedback();
  const task = useTask(feedback, () => resource.reload());
  const resource = useResource(
    async () => (await companionApi.detail(id)).data,
    [id],
  );
  const item = resource.data;
  const own =
    String(item?.organizerId) ===
    String(useUserStore(state => state.userProfile?.userId));
  const openChat = () =>
    navigation.navigate('CompanionChatAccess', {companionId: id});
  const inquire = () => {
    if (!useUserStore.getState().accessToken) {
      navigation.navigate('Login');
      return;
    }
    task.run(`inquire:${id}`, key => companionApi.inquire(id, key), openChat);
  };
  if (!item || resource.error) {
    return (
      <Screen title={t('companion.title')}>
        <ResourceBody resource={resource} />
      </Screen>
    );
  }
  const canOpenDirect =
    item.status === 'OPEN' &&
    !own &&
    (hasAction(item, 'OPEN_INQUIRY') ||
      ['INQUIRING', 'PENDING', 'ACCEPTED', 'WITHDRAWN', 'REJECTED'].includes(
        item.myParticipationStatus,
      ) ||
      !useUserStore.getState().accessToken);
  const canOpenGroup =
    item.status === 'CLOSED' &&
    (own || item.myParticipationStatus === 'ACCEPTED') &&
    item.confirmedCount > 0;
  const action =
    own && item.status === 'OPEN'
      ? () => navigation.navigate('CompanionManage', {companionId: id})
      : canOpenGroup
      ? openChat
      : hasAction(item, 'OPEN_INQUIRY') || !useUserStore.getState().accessToken
      ? inquire
      : openChat;
  return (
    <View style={s.screen}>
      <CommunityDetailScreen
        route={{
          ...route,
          params: {
            ...route.params,
            postId: item.postId,
            sourceTab: 'COMPANION',
          },
        }}
        headerTitle={t('companion.title')}
        contentOverride={{title: item.title, content: item.description}}
        hidePostLocation
        afterPostContent={
          <CompanionPostInfo item={item}>
            <Action
              label={t(
                own && item.status === 'OPEN'
                  ? 'companion.manage'
                  : canOpenGroup
                  ? 'companion.groupChat'
                  : item.status !== 'OPEN'
                  ? 'companion.status.CLOSED'
                  : 'companion.chat',
              )}
              disabled={
                task.busy ||
                (!own && !canOpenDirect && !canOpenGroup) ||
                (own && item.status !== 'OPEN' && !canOpenGroup)
              }
              onPress={action}
            />
          </CompanionPostInfo>
        }
      />
      {feedback.modal}
    </View>
  );
}

// Local form styling: preserve shared fields used by the other companion screens.
function CompanionWriteField({label, style, ...props}) {
  return (
    <View style={{gap: 10}}>
      <Txt style={FONTS.fs_14_regular}>{label}</Txt>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={C.grayscale_400}
        style={[
          {
            ...FONTS.fs_14_regular,
            color: C.grayscale_900,
            borderWidth: 1,
            borderColor: C.grayscale_200,
            borderRadius: 24,
            minHeight: 48,
            paddingHorizontal: 14,
            paddingVertical: 12,
            textAlignVertical: props.multiline ? 'top' : 'center',
          },
          style,
        ]}
      />
    </View>
  );
}
export function CompanionWrite({navigation, route}) {
  const {t} = useTranslation();
  const keyboardContainer = useRef(null);
  const formScroll = useRef(null);
  const focusedInput = useRef(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const revealInput = () => {
    if (Platform.OS === 'ios' && focusedInput.current != null) {
      formScroll.current
        ?.getScrollResponder()
        ?.scrollResponderScrollNativeHandleToKeyboard(
          focusedInput.current,
          24,
          true,
        );
    }
  };
  const focusInput = event => {
    focusedInput.current = event.target;
    requestAnimationFrame(revealInput);
  };
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    const subscription = Keyboard.addListener('keyboardDidShow', revealInput);
    return () => subscription.remove();
  }, []);
  const editing = route.params?.companion;
  const feedback = useFeedback({horizontalButtons: true});
  const task = useTask(feedback);
  const showError = feedback.error;
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(() => ({
    title: editing?.title || '',
    description: editing?.description || '',
    activityType: editing?.activityType || '',
    regionCode: editing?.regionCode || '',
    meetingPlace: editing?.meetingPlace || '',
    startDate: editing?.startDate || '',
    endDate: editing?.endDate || '',
    capacity: editing?.capacity || 1,
  }));
  const [images, setImages] = useState([]);
  const [editReady, setEditReady] = useState(!editing);
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(null);
  const [dateField, setDateField] = useState(null);
  const [regionOpen, setRegionOpen] = useState(false);
  // Keep the calendar date stable while its own month/selection state changes.
  const calendarMinDate = useMemo(() => {
    if (dateField === 'endDate' && draft.startDate) {
      return kstDate(draft.startDate);
    }
    return kstDate(dateKey(new Date()));
  }, [dateField, draft.startDate]);
  const calendarValue = useMemo(
    () => (draft[dateField] ? kstDate(draft[dateField]) : calendarMinDate),
    [dateField, draft.startDate, draft.endDate, calendarMinDate],
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const {i18n} = useTranslation();
  useEffect(() => {
    let active = true;
    communityApi
      .getCategories()
      .then(({data}) => {
        if (active && Array.isArray(data)) {
          setCategories(
            data.filter(
              category =>
                category.contentType === 'COMMUNITY' &&
                category.code !== 'STAFF',
            ),
          );
        }
      })
      .catch(showError);
    return () => {
      active = false;
    };
  }, [showError]);
  const firstStepValid = !validateDraft(
    {...draft, description: '0123456789'},
    new Date(),
    !editing,
  );
  const completeValid = !validateDraft(draft, new Date(), !editing);
  const transaction = useRef(null);
  const changed = Object.keys(draft).some(key => draft[key] !== editing?.[key]);
  const set = (key, value) =>
    setDraft(previous => ({...previous, [key]: value}));
  useEffect(() => {
    let disposed = false;
    if (editing) {
      communityApi
        .getPostDetail(editing.postId)
        .then(({data}) => {
          if (disposed) {
            return;
          }
          // Do not infer S3 keys, sizes or versions from display URLs.
          if (
            !data.updatedAt ||
            !Array.isArray(data.images) ||
            data.images.some(image => !image.objectKey || !image.fileSizeBytes)
          ) {
            throw new Error('EDIT_IMAGES_UNAVAILABLE');
          }
          setImages(
            data.images.map(image => ({
              ...image,
              uri: image.imageUrl,
              isExisting: true,
            })),
          );
          setExpectedUpdatedAt(data.updatedAt);
          setEditReady(true);
        })
        .catch(error => {
          if (!disposed) {
            showError(error);
          }
        });
    }
    return () => {
      disposed = true;
    };
  }, [editing, showError]);
  const addImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5 - images.length,
      });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        throw new Error('IMAGE_PICK_FAILED');
      }
      const assets = await Promise.all(
        (result.assets || []).slice(0, 5 - images.length).map(async asset => {
          const resized = await ImageResizer.createResizedImage(
            asset.uri,
            1600,
            1600,
            'JPEG',
            90,
          );
          return {
            uri: resized.uri,
            fileName: `companion-${newIntentKey()}.jpg`,
            fileSize: resized.size,
            type: 'image/jpeg',
          };
        }),
      );
      if (
        assets.some(
          asset => !asset.fileSize || asset.fileSize > 20 * 1024 * 1024,
        )
      ) {
        feedback.inform(t('companion.imageLimit'));
        return;
      }
      setImages(previous => [...previous, ...assets]);
    } catch (error) {
      feedback.error(error);
    }
  };
  const submit = (confirmedClose = false) => {
    if (
      editing?.confirmedCount > 0 &&
      draft.capacity === editing.confirmedCount &&
      !confirmedClose
    ) {
      feedback.confirm(
        t('companion.closeTitle'),
        t('companion.closeBody'),
        t('companion.closeAndGroup'),
        () => submit(true),
      );
      return;
    }
    const invalid = validateDraft(draft, new Date(), !editing);
    if (invalid) {
      feedback.inform(t(invalid));
      return;
    }
    const snapshot = JSON.stringify({draft, images});
    task.run(
      snapshot,
      async key => {
        const body = {
          ...draft,
          title: draft.title.trim(),
          description: draft.description.trim(),
          meetingPlace: draft.meetingPlace.trim() || null,
        };
        if (editing) {
          if (!editReady) {
            throw new Error('EDIT_IMAGES_UNAVAILABLE');
          }
          const uploaded = await uploadPostImages(editing.postId, images);
          const {startDate, endDate, ...updateBody} = body;
          return (
            await companionApi.update(editing.companionId, {
              ...updateBody,
              expectedUpdatedAt,
              images: uploaded,
            })
          ).data;
        }
        // Once a draft is created, retry only its upload/publish. Never create a second draft after an upload failure.
        if (transaction.current && transaction.current.snapshot !== snapshot) {
          throw new Error('DRAFT_PENDING');
        }
        if (!transaction.current) {
          transaction.current = {
            snapshot,
            draftKey: key,
            publishKey: newIntentKey(),
          };
        }
        const tx = transaction.current;
        if (!tx.ids) {
          try {
            tx.ids = (await companionApi.draft(body, tx.draftKey)).data;
          } catch (error) {
            if (error.response?.status >= 400 && error.response?.status < 500) {
              transaction.current = null;
            }
            throw error;
          }
        }
        if (!tx.uploaded) {
          tx.uploaded = await uploadPostImages(tx.ids.postId, images);
        }
        return (
          await companionApi.publish(
            tx.ids.companionId,
            tx.uploaded,
            tx.publishKey,
          )
        ).data;
      },
      result =>
        navigation.replace(
          result.status === 'CLOSED' && result.confirmedCount > 0
            ? 'CompanionChatAccess'
            : 'CompanionDetail',
          {
            companionId: result.companionId,
          },
        ),
    );
  };
  const next = () => {
    const invalid = validateDraft({...draft, description: '0123456789'});
    if (invalid && !editing) {
      feedback.inform(t(invalid));
      return;
    }
    if (!draft.title.trim() || !draft.activityType || !draft.regionCode) {
      feedback.inform(t('companion.validation'));
      return;
    }
    setStep(2);
  };
  const back = () => {
    if (step === 2 && !task.busy) {
      setStep(1);
      return;
    }
    if (changed || images.length) {
      feedback.confirm(
        t('companion.discardTitle'),
        t('companion.discardBody'),
        t('companion.discard'),
        () => navigation.goBack(),
      );
    } else {
      navigation.goBack();
    }
  };
  return (
    <View
      ref={keyboardContainer}
      collapsable={false}
      style={{flex: 1}}
      onLayout={() => {
        if (Platform.OS === 'ios') {
          keyboardContainer.current?.measureInWindow((x, y) =>
            setKeyboardOffset(y),
          );
        }
      }}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}>
        <Screen
          title={t(editing ? 'companion.edit' : 'companion.writeHeader')}
          onBack={back}
          footer={
            <Action
              style={{
                marginTop: -1,
                marginBottom: Platform.OS === 'ios' ? 20 : 0,
              }}
              label={t(
                step === 1
                  ? 'common.next'
                  : editing
                  ? 'companion.save'
                  : 'companion.publish',
              )}
              disabled={
                !(step === 1 ? firstStepValid : completeValid) ||
                task.busy ||
                !editReady ||
                !companionEnabled ||
                !useUserStore.getState().accessToken
              }
              onPress={step === 1 ? next : () => submit()}
            />
          }>
          <LoginGate navigation={navigation}>
            <ScrollView
              ref={formScroll}
              style={{flex: 1}}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 24,
                gap: 14,
                flexGrow: 1,
              }}>
              <View style={[writeStyles.categoryWrapper, {marginBottom: 16}]}>
                <TouchableOpacity
                  style={writeStyles.categoryButton}
                  disabled={!!editing || task.busy || !!transaction.current}
                  onPress={() => setCategoryOpen(value => !value)}>
                  <Txt style={writeStyles.selectedCategoryButtonText}>
                    {t('companion.title')}
                  </Txt>
                  {categoryOpen ? (
                    <UpIcon width={16} height={16} />
                  ) : (
                    <DownIcon width={16} height={16} />
                  )}
                </TouchableOpacity>
                {categoryOpen && (
                  <View style={writeStyles.categoryMenu}>
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category.code}
                        style={writeStyles.categoryMenuItem}
                        onPress={() => {
                          setCategoryOpen(false);
                          if (category.code !== 'COMPANION') {
                            navigation.replace('CommunityWrite', {
                              initialCategory: category,
                            });
                          }
                        }}>
                        <Txt
                          style={[
                            writeStyles.categoryMenuText,
                            category.code === 'COMPANION' &&
                              writeStyles.selectedCategoryMenuText,
                          ]}>
                          {category.displayName}
                        </Txt>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={s.between}>
                <Txt style={s.orange}>
                  {t(
                    step === 1
                      ? 'companion.stepSchedule'
                      : 'companion.stepIntro',
                  )}
                </Txt>
                <Txt style={s.small}>{t('companion.stepValue', {step})}</Txt>
              </View>
              <View
                style={{
                  height: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: C.grayscale_200,
                }}>
                <View
                  style={{
                    height: 3,
                    width: step === 1 ? '50%' : '100%',
                    backgroundColor: C.primary_orange,
                  }}
                />
              </View>
              {step === 1 ? (
                <>
                  <CompanionWriteField
                    onFocus={focusInput}
                    style={{
                      borderRadius: 24,
                      minHeight: 48,
                      paddingVertical: 10,
                    }}
                    label={t('companion.titleLabel')}
                    value={draft.title}
                    onChangeText={value => set('title', value)}
                    maxLength={120}
                    editable={!task.busy && !transaction.current}
                    placeholder={t('companion.titlePlaceholder')}
                  />
                  <Txt>{t('companion.activityLabel')}</Txt>
                  <View
                    style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                    {ACTIVITIES.map(activity => (
                      <TouchableOpacity
                        key={activity}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: draft.activityType === activity,
                        }}
                        disabled={
                          !!editing?.confirmedCount ||
                          task.busy ||
                          !!transaction.current
                        }
                        onPress={() => set('activityType', activity)}
                        style={{
                          borderRadius: 100,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          backgroundColor:
                            draft.activityType === activity
                              ? C.primary_orange
                              : C.grayscale_100,
                        }}>
                        <Txt
                          style={{
                            ...FONTS.fs_14_regular,
                            color:
                              draft.activityType === activity
                                ? C.grayscale_0
                                : C.grayscale_900,
                          }}>
                          {t(`companion.activity.${activity}`)}
                        </Txt>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Txt>{t('companion.regionLabel')}</Txt>
                  <View style={{position: 'relative', zIndex: 1}}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('companion.regionLabel')}
                      disabled={
                        !!editing?.confirmedCount ||
                        task.busy ||
                        !!transaction.current
                      }
                      onPress={() => setRegionOpen(value => !value)}
                      style={{
                        borderWidth: 1,
                        borderColor: C.grayscale_200,
                        borderRadius: 24,
                        minHeight: 48,
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                      <Txt style={s.grow}>
                        {draft.regionCode
                          ? t(`companion.region.${draft.regionCode}`)
                          : t('companion.regionSelect')}
                      </Txt>
                      <DownIcon width={20} height={20} />
                    </TouchableOpacity>
                    {regionOpen && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 52,
                          left: 0,
                          right: 0,
                          backgroundColor: C.grayscale_0,
                          borderWidth: 1,
                          borderColor: C.grayscale_200,
                          borderRadius: 16,
                          paddingVertical: 8,
                          elevation: 4,
                        }}>
                        {REGIONS.map(region => (
                          <TouchableOpacity
                            key={region}
                            accessibilityRole="button"
                            accessibilityState={{
                              selected: draft.regionCode === region,
                            }}
                            onPress={() => {
                              set('regionCode', region);
                              setRegionOpen(false);
                            }}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 12,
                            }}>
                            <Txt
                              style={draft.regionCode === region && s.orange}>
                              {t(`companion.region.${region}`)}
                            </Txt>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={{position: 'relative'}}>
                    <CompanionWriteField
                      onFocus={focusInput}
                      label={t('companion.placeLabel')}
                      placeholder={t('companion.placePlaceholder')}
                      value={draft.meetingPlace}
                      maxLength={255}
                      style={{
                        borderRadius: 24,
                        minHeight: 48,
                        paddingVertical: 12,
                        paddingRight: 40,
                      }}
                      editable={!task.busy && !transaction.current}
                      onChangeText={value => set('meetingPlace', value)}
                    />
                    <View
                      pointerEvents="none"
                      style={{position: 'absolute', right: 14, bottom: 12}}>
                      <PlaceOrangeIcon width={20} height={20} />
                    </View>
                  </View>
                  <Txt>{t('companion.dateLabel')}</Txt>
                  <View style={s.row}>
                    {['startDate', 'endDate'].map(key => (
                      <View style={s.grow} key={key}>
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={t(`companion.${key}`)}
                          style={{
                            borderWidth: 1,
                            borderColor: C.grayscale_200,
                            borderRadius: 24,
                            minHeight: 48,
                            justifyContent: 'center',
                            paddingHorizontal: 14,
                          }}
                          disabled={
                            !!editing || task.busy || !!transaction.current
                          }
                          onPress={() => {
                            Keyboard.dismiss();
                            setDateField(key);
                          }}>
                          <Txt>
                            {draft[key]
                              ? i18n.resolvedLanguage?.startsWith('ko')
                                ? draft[key].replace(/-/g, '. ')
                                : formatDate(kstDate(draft[key]), {
                                    timeZone: 'Asia/Seoul',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })
                              : t(`companion.${key}`)}
                          </Txt>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {!!editing && (
                    <Txt style={s.small}>{t('companion.dateLocked')}</Txt>
                  )}
                  <Txt>{t('companion.capacityLabel')}</Txt>
                  <View style={s.between}>
                    <TouchableOpacity
                      disabled={
                        draft.capacity <=
                          Math.max(1, editing?.confirmedCount || 0) ||
                        task.busy ||
                        !!transaction.current
                      }
                      onPress={() => set('capacity', draft.capacity - 1)}
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: C.grayscale_200,
                        borderRadius: 8,
                      }}
                      accessibilityLabel={t('companion.decrease')}>
                      <MinusIcon width={24} height={24} />
                    </TouchableOpacity>
                    <Title>
                      {countText(t, 'companion.people', draft.capacity)}
                    </Title>
                    <TouchableOpacity
                      disabled={
                        draft.capacity >= 100 ||
                        task.busy ||
                        !!transaction.current
                      }
                      onPress={() => set('capacity', draft.capacity + 1)}
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: C.grayscale_200,
                        borderRadius: 8,
                      }}
                      accessibilityLabel={t('companion.increase')}>
                      <PlusIcon width={24} height={24} />
                    </TouchableOpacity>
                  </View>
                  {!!editing?.confirmedCount && (
                    <Txt style={s.small}>{t('companion.acceptedEditRule')}</Txt>
                  )}
                </>
              ) : (
                <>
                  <CompanionWriteField
                    onFocus={focusInput}
                    style={{height: 180, minHeight: 180, borderRadius: 24}}
                    label={t('companion.descriptionLabel')}
                    placeholder={t('companion.descriptionPlaceholder')}
                    value={draft.description}
                    onChangeText={value => set('description', value)}
                    maxLength={1000}
                    multiline
                    editable={!task.busy && !transaction.current}
                  />
                  <Txt style={s.small}>{t('companion.descriptionHelp')}</Txt>
                  <Txt>{t('companion.photosLabel')}</Txt>
                  <View style={s.wrap}>
                    {images.map((image, index) => (
                      <View key={image.uri} style={{width: 84, height: 84}}>
                        <AppImage
                          uri={image.uri}
                          style={{width: 84, height: 84, borderRadius: 8}}
                        />
                        <TouchableOpacity
                          accessibilityLabel={t('companion.removePhoto', {
                            index: index + 1,
                          })}
                          disabled={task.busy || !!transaction.current}
                          onPress={() =>
                            setImages(previous =>
                              previous.filter(
                                (_, position) => position !== index,
                              ),
                            )
                          }
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            backgroundColor: C.grayscale_0,
                            borderRadius: 12,
                          }}>
                          <CloseIcon width={24} height={24} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {images.length < 5 && (
                      <TouchableOpacity
                        style={{
                          width: 70,
                          height: 70,
                          borderWidth: 1,
                          borderColor: C.grayscale_200,
                          borderRadius: 12,
                          backgroundColor: C.grayscale_100,
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                        }}
                        onPress={addImages}
                        disabled={task.busy || !!transaction.current}
                        accessibilityLabel={t('companion.addPhoto')}>
                        <PlusIcon width={24} height={24} />
                        <Txt style={s.small}>
                          {t('companion.photoCount', {count: images.length})}
                        </Txt>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Txt style={s.small}>{t('companion.photosHelp')}</Txt>
                  {transaction.current && (
                    <Txt style={s.small}>{t('companion.publishRetry')}</Txt>
                  )}
                </>
              )}
            </ScrollView>
          </LoginGate>
          <Modal
            visible={!!dateField}
            transparent
            onRequestClose={() => setDateField(null)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: 20,
                backgroundColor: C.modal_background,
              }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={() => setDateField(null)}
                style={{
                  alignSelf: 'flex-end',
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: C.grayscale_0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                <CloseIcon width={24} height={24} />
              </TouchableOpacity>
              {!!dateField && (
                <DatePicker
                  key={dateField}
                  label={t(`companion.${dateField}`)}
                  value={calendarValue}
                  minDate={calendarMinDate}
                  onChange={date => {
                    const value = dateKey(date);
                    setDraft(previous => ({
                      ...previous,
                      [dateField]: value,
                      ...(dateField === 'startDate' &&
                      (!previous.endDate || previous.endDate < value)
                        ? {endDate: value}
                        : {}),
                    }));
                    setDateField(null);
                  }}
                />
              )}
            </View>
          </Modal>
          {feedback.modal}
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

async function loadMyManagement(id) {
  const first = (await companionApi.management(id)).data;
  const content = [...first.applications.content];
  let last = first.applications.last;
  let nextPage = 1;
  while (!last) {
    const next = (await companionApi.management(id, nextPage++)).data
      .applications;
    content.push(...next.content);
    last = next.last;
  }
  return {
    data: {
      ...first,
      summary: {...first.summary, conversationCount: content.length},
      applications: {content, last: true},
    },
  };
}

export function MyCompanions({navigation}) {
  const {t} = useTranslation();
  const [role, setRole] = useState('ORGANIZER');
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const token = useUserStore(state => state.accessToken);
  const resource = useResource(
    async isCurrent => {
      if (!token) {
        return {last: true};
      }
      const result = (await companionApi.mine({role, page, size: 20})).data;
      // Unpublished draft posts are not readable through the public community endpoint.
      const summaries = result.content.filter(item => item.status !== 'DRAFT');
      const cards = new Array(summaries.length);
      let cursor = 0;
      await Promise.all(
        Array.from({length: Math.min(4, summaries.length)}, async () => {
          while (cursor < summaries.length && isCurrent()) {
            const index = cursor++;
            const summary = summaries[index];
            const [detail, post, management] = await Promise.all([
              companionApi.detail(summary.companionId),
              summary.postId
                ? communityApi.getPostDetail(summary.postId, {commentSize: 1})
                : Promise.resolve({data: {}}),
              role === 'ORGANIZER'
                ? loadMyManagement(summary.companionId)
                : Promise.resolve(null),
            ]);
            cards[index] = {
              ...summary,
              ...detail.data,
              author: post.data.author,
              summary: management?.data.summary,
            };
          }
        }),
      );
      if (!isCurrent()) {
        return null;
      }
      setItems(previous =>
        page
          ? [
              ...previous,
              ...cards.filter(
                card =>
                  !previous.some(item => item.companionId === card.companionId),
              ),
            ]
          : cards,
      );
      return result;
    },
    [role, page, token],
  );
  return (
    <Screen title={t('companion.my')}>
      <LoginGate navigation={navigation}>
        <View style={[s.wrap, {paddingHorizontal: 20}]}>
          {['ORGANIZER', 'PARTICIPANT'].map(value => (
            <Chip
              key={value}
              label={t(`companion.role.${value}`)}
              selected={value === role}
              onPress={() => {
                setPage(0);
                setRole(value);
              }}
            />
          ))}
        </View>
        <ResourceBody resource={resource}>
          <View style={s.soft}>
            <Txt style={s.small}>
              {t(
                role === 'ORGANIZER'
                  ? 'companion.myUi.organizerHelp'
                  : 'companion.myUi.participantHelp',
              )}
            </Txt>
          </View>
          {items.map(item => {
            const organizer = role === 'ORGANIZER';
            const open = item.status === 'OPEN';
            const showPost = () =>
              navigation.navigate('CompanionDetail', {
                companionId: item.companionId,
              });
            return (
              <View key={item.companionId} style={{gap: 12, marginBottom: 12}}>
                <MyCompanionCard
                  item={item}
                  organizer={organizer}
                  onPress={showPost}
                />
                {open && (
                  <View style={s.soft}>
                    <Txt style={s.small}>
                      {organizer
                        ? t('companion.myUi.recruitmentSummary', {
                            pending: formatNumber(
                              item.summary?.pendingCount || 0,
                            ),
                            inquiries: formatNumber(
                              item.summary?.conversationCount || 0,
                            ),
                          })
                        : t(
                            item.myParticipationStatus === 'PENDING'
                              ? 'companion.myUi.waiting'
                              : 'companion.myUi.participationHelp',
                          )}
                    </Txt>
                  </View>
                )}
                <View style={s.row}>
                  <Action
                    style={s.grow}
                    secondary
                    label={t(
                      organizer && open
                        ? 'companion.manage'
                        : 'companion.myUi.viewPost',
                    )}
                    onPress={
                      organizer && open
                        ? () =>
                            navigation.navigate('CompanionManage', {
                              companionId: item.companionId,
                            })
                        : showPost
                    }
                  />
                  <Action
                    style={s.grow}
                    label={
                      open && organizer
                        ? countText(
                            t,
                            'companion.myUi.chatCount',
                            item.summary?.conversationCount || 0,
                          )
                        : t(
                            item.status === 'CLOSED'
                              ? 'companion.groupChat'
                              : 'companion.goChat',
                          )
                    }
                    disabled={
                      item.status === 'CANCELLED' ||
                      item.status === 'DRAFT' ||
                      (item.status === 'CLOSED' &&
                        (!item.confirmedCount ||
                          (!organizer &&
                            item.myParticipationStatus !== 'ACCEPTED')))
                    }
                    onPress={() =>
                      navigation.navigate(
                        organizer && open
                          ? 'CompanionManage'
                          : 'CompanionChatAccess',
                        {
                          companionId: item.companionId,
                          mode: organizer && open ? 'inquiries' : undefined,
                        },
                      )
                    }
                  />
                </View>
              </View>
            );
          })}
          {!items.length && (
            <View style={s.empty}>
              <Title>{t('companion.myEmpty')}</Title>
              <Action
                label={t('companion.find')}
                onPress={() => goCompanions(navigation)}
              />
            </View>
          )}
          {resource.data?.last === false && (
            <Action
              secondary
              label={t('companion.loadMore')}
              onPress={() => setPage(value => value + 1)}
              disabled={resource.loading}
            />
          )}
        </ResourceBody>
      </LoginGate>
    </Screen>
  );
}

export function CompanionManage({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const inquiryMode = route.params?.mode === 'inquiries';
  const feedback = useFeedback({horizontalButtons: true});
  const task = useTask(feedback, () => resource.reload());
  const [page, setPage] = useState(0);
  const [people, setPeople] = useState([]);
  const resource = useResource(
    async isCurrent => {
      const [detail, management, chats] = await Promise.all([
        companionApi.detail(id),
        loadMyManagement(id),
        chatApi.list().catch(() => ({data: []})),
      ]);
      const members = management.data.applications.content;
      let memberCursor = 0;
      await Promise.all(
        Array.from({length: Math.min(4, members.length)}, async () => {
          while (memberCursor < members.length && isCurrent()) {
            const index = memberCursor++;
            try {
              const {data: profile} = await chatApi.profile(
                members[index].userId,
              );
              members[index] = {
                ...members[index],
                profileImageUrl: profile.profileImageUrl,
              };
            } catch {}
          }
        }),
      );
      if (!isCurrent()) {
        return null;
      }
      setPeople(previous =>
        page
          ? [
              ...previous,
              ...management.data.applications.content.filter(
                person =>
                  !previous.some(
                    item => item.participationId === person.participationId,
                  ),
              ),
            ]
          : management.data.applications.content,
      );
      return {item: detail.data, ...management.data, chats: chats.data};
    },
    [id, page],
  );
  const item = resource.data?.item;
  const refresh = () => {
    if (page) {
      setPage(0);
    } else {
      resource.reload();
    }
  };
  const close = () =>
    feedback.confirm(
      t('companion.closeTitle'),
      t(
        item.confirmedCount
          ? 'companion.closeBody'
          : 'companion.closeEmptyBody',
      ),
      t(item.confirmedCount ? 'companion.closeAndGroup' : 'companion.close'),
      () =>
        task.run(
          `close:${id}`,
          key => companionApi.close(id, key),
          result => {
            refresh();
            if (result.data.confirmedCount) {
              navigation.navigate('CompanionChatAccess', {companionId: id});
            } else {
              feedback.inform(
                t('companion.closedDone'),
                t('companion.noGroup'),
              );
            }
          },
        ),
    );
  const decide = (person, accept) => {
    const perform = () =>
      task.run(
        `manage-decision:${id}:${person.participationId}:${person.requestGeneration}:${accept}`,
        key => companionApi.decide(id, person, accept, key),
        async () => {
          refresh();
          const current = (await companionApi.detail(id)).data;
          if (current.status === 'CLOSED' && current.confirmedCount)
            navigation.navigate('CompanionChatAccess', {companionId: id});
        },
      );
    if (accept && item.confirmedCount + 1 >= item.capacity)
      feedback.confirm(
        t('companion.acceptLastTitle'),
        t('companion.closeBody'),
        t('companion.acceptAndGroup'),
        perform,
      );
    else perform();
  };
  return (
    <Screen
      title={t(
        inquiryMode ? 'companion.myUi.inquiryTitle' : 'companion.manage',
      )}
      footer={
        !inquiryMode &&
        item && (
          <View style={{paddingBottom: Platform.OS === 'ios' ? 20 : 0}}>
            <Action
              label={
                item.status === 'OPEN'
                  ? countText(
                      t,
                      'companion.myUi.inquiryButton',
                      resource.data.summary.conversationCount,
                    )
                  : t('companion.groupChat')
              }
              disabled={
                item.status === 'CANCELLED' ||
                item.status === 'DRAFT' ||
                (item.status === 'CLOSED' && !item.confirmedCount)
              }
              onPress={() =>
                navigation.navigate(
                  item.status === 'OPEN'
                    ? 'CompanionManage'
                    : 'CompanionChatAccess',
                  {
                    companionId: id,
                    mode: item.status === 'OPEN' ? 'inquiries' : undefined,
                  },
                )
              }
            />
          </View>
        )
      }>
      <ResourceBody resource={resource}>
        {item && (
          <>
            {inquiryMode ? (
              <>
                <View style={s.soft}>
                  <View style={s.row}>
                    <Status item={item} />
                    <Txt style={s.small}>
                      {t('companion.myUi.confirmedRatio', {
                        confirmed: formatNumber(item.confirmedCount),
                        capacity: formatNumber(item.capacity),
                      })}
                    </Txt>
                  </View>
                  <Title>{item.title}</Title>
                  <Txt style={s.small}>{postSchedule(item, t)}</Txt>
                </View>
                <View style={s.soft}>
                  <Txt style={s.small}>
                    {countText(
                      t,
                      'companion.myUi.inquiryHelp',
                      resource.data.summary.conversationCount,
                    )}
                  </Txt>
                </View>
                {people.map(person => (
                  <TouchableOpacity
                    key={person.participationId}
                    disabled={!person.directRoomId}
                    onPress={() =>
                      navigation.navigate('CompanionChat', {
                        roomId: person.directRoomId,
                        companionId: id,
                        participant: person,
                      })
                    }
                    style={{
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderColor: C.grayscale_200,
                    }}>
                    <Person
                      name={person.userName}
                      uri={person.profileImageUrl}
                      subtitle={t(`companion.participation.${person.status}`)}>
                      <Txt style={s.small}>
                        {displayTime(
                          resource.data.chats.find(
                            chat =>
                              String(chat.roomId) ===
                              String(person.directRoomId),
                          )?.lastMessageAt,
                        )}
                      </Txt>
                    </Person>
                    <Txt style={[s.small, {marginTop: 8, marginLeft: 48}]}>
                      {resource.data.chats.find(
                        chat =>
                          String(chat.roomId) === String(person.directRoomId),
                      )?.lastMessagePreview ||
                        t(`companion.participation.${person.status}`)}
                    </Txt>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Status item={item} />
                <Title>{item.title}</Title>
                <Meta item={item} />
                <View style={[s.soft, s.between]}>
                  {['inquiryCount', 'pendingCount', 'confirmedCount'].map(
                    key => (
                      <View key={key} style={[s.grow, {alignItems: 'center'}]}>
                        <Title>
                          {key === 'confirmedCount'
                            ? t('companion.ratio', {
                                confirmed: resource.data.summary[key],
                                capacity: item.capacity,
                              })
                            : formatNumber(resource.data.summary[key])}
                        </Title>
                        <Txt style={s.small}>
                          {t(`companion.metric.${key}`)}
                        </Txt>
                      </View>
                    ),
                  )}
                </View>
                {item.status === 'OPEN' && (
                  <View style={s.row}>
                    <Action
                      style={s.grow}
                      secondary
                      label={t('companion.edit')}
                      disabled={task.busy}
                      onPress={() =>
                        navigation.navigate('CompanionWrite', {companion: item})
                      }
                    />
                    <Action
                      style={s.grow}
                      secondary
                      label={t('companion.close')}
                      disabled={task.busy}
                      onPress={close}
                    />
                  </View>
                )}
                <Title>
                  {countText(
                    t,
                    'companion.myUi.pendingHeading',
                    resource.data.summary.pendingCount,
                  )}
                </Title>
                {people
                  .filter(person => person.status === 'PENDING')
                  .map(person => (
                    <View key={person.participationId} style={s.soft}>
                      <Person
                        name={person.userName}
                        uri={person.profileImageUrl}
                        subtitle={t(`companion.participation.${person.status}`)}
                      />
                      {item.status === 'OPEN' && person.directRoomId && (
                        <Action
                          secondary
                          label={t('companion.viewConversation')}
                          onPress={() =>
                            navigation.navigate('CompanionChat', {
                              roomId: person.directRoomId,
                              companionId: id,
                              participant: person,
                            })
                          }
                        />
                      )}
                      {item.status === 'OPEN' && (
                        <View style={s.row}>
                          <Action
                            style={s.grow}
                            secondary
                            label={t('companion.reject')}
                            disabled={task.busy}
                            onPress={() => decide(person, false)}
                          />
                          <Action
                            style={s.grow}
                            label={t('companion.accept')}
                            disabled={task.busy}
                            onPress={() => decide(person, true)}
                          />
                        </View>
                      )}
                    </View>
                  ))}
                <Title>
                  {countText(
                    t,
                    'companion.myUi.confirmedHeading',
                    resource.data.summary.confirmedCount,
                  )}
                </Title>
                {people
                  .filter(person => person.status === 'ACCEPTED')
                  .map(person => (
                    <Person
                      key={person.participationId}
                      name={person.userName}
                      uri={person.profileImageUrl}
                      subtitle={t('companion.participation.ACCEPTED')}
                    />
                  ))}
                <View style={s.soft}>
                  <Txt style={s.small}>
                    {t('companion.myUi.peoplePolicy', {
                      capacity: formatNumber(item.capacity),
                      total: formatNumber(item.capacity + 1),
                      confirmed: formatNumber(item.confirmedCount + 1),
                    })}
                  </Txt>
                </View>
              </>
            )}
            {resource.data.applications.last === false && (
              <Action
                secondary
                label={t('companion.loadMore')}
                disabled={resource.loading}
                onPress={() => setPage(value => value + 1)}
              />
            )}
          </>
        )}
      </ResourceBody>
      {feedback.modal}
    </Screen>
  );
}

export function CompanionChatAccess({navigation, route}) {
  const {t} = useTranslation();
  const id = route.params?.companionId;
  const [state, setState] = useState('PENDING');
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(null);
  useEffect(() => {
    let stopped = false;
    let timer;
    let count = 0;
    async function check() {
      try {
        const [detail, access] = await Promise.all([
          companionApi.detail(id),
          companionApi.access(id),
        ]);
        if (stopped) {
          return;
        }
        const roomId = roomForAccess(access.data, detail.data);
        if (roomId) {
          navigation.replace('CompanionChat', {
            roomId,
            companionId: id,
            mayRejoin: detail.data.status === 'CLOSED',
          });
          return;
        }
        setState(access.data.status);
        if (access.data.status === 'PENDING' && count++ < 8) {
          timer = setTimeout(check, Math.min(1000 * 1.5 ** count, 8000));
        } else if (access.data.status === 'PENDING') {
          setState('TIMEOUT');
        }
      } catch (cause) {
        if (!stopped) {
          setError(cause);
        }
      }
    }
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id, attempt, navigation]);
  return (
    <Screen title={t('companion.chat')}>
      <View style={s.empty}>
        <ChatBlueIcon width={48} height={48} />
        <Title>
          {t(error ? 'companion.chatUnavailable' : `companion.access.${state}`)}
        </Title>
        <Txt style={s.muted}>{t('companion.accessHelp')}</Txt>
        <Action
          style={{width: '100%', maxWidth: 360}}
          label={t('companion.retry')}
          onPress={() => {
            setError(null);
            setState('PENDING');
            setAttempt(value => value + 1);
          }}
        />
        <Action
          secondary
          style={{width: '100%', maxWidth: 360}}
          label={t('companion.inbox')}
          onPress={() => navigation.replace('CompanionInbox')}
        />
      </View>
    </Screen>
  );
}
